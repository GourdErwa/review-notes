> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/framework/flink-basis) ，[github-源码 ](https://github.com/GourdErwa/flink-advanced)，欢迎 Star，转载请附上原文出处链接和本声明。
本节内容对应[官方文档 ](https://ci.apache.org/projects/flink/flink-docs-release-1.9/zh/dev/batch/#distributed-cache)，本节内容对应[示例源码 ](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/batch/DistributedCache.scala)  

[toc]
# DataSet 分布式缓冲
Flink 提供了一个分布式缓存，类似于 hadoop，可以使用户在并行函数中很方便的读取本地文件，并把它放在 taskManager 节点中，防止 task 重复拉取。  


*执行机制如下*：   
程序注册一个文件或者目录 (本地或者远程文件系统，例如 hdfs 或者 s3)，通过 `ExecutionEnvironment` 注册缓存文件并为它起一个名称
当程序执行，Flink 自动将文件或者目录复制到所有 taskManager 节点的本地文件系统，仅会执行一次。
用户可以通过这个指定的名称查找文件或者目录，然后从 taskManager 节点的本地文件系统访问它。

示例代码：
```scala
/** 分布式缓存
  * =示例说明=
  * 分布式载入用户 ID 黑名单文件，针对用户登录数据匹配在黑名单 ID 及对应登录状态
  *
  * @author Li.Wei by 2019/11/4
  */
object DistributedCache extends BatchExecutionEnvironmentApp {

  private val path = getClass.getClassLoader.getResource("data/game/blacklist-uid.txt").getPath
  bEnv.registerCachedFile(path, "blacklist-uid", executable = false)

  // 用户登录数据 DataSet
  val userLoginDataSet = DataSet.userLogin(this)

  import org.apache.flink.api.scala.extensions._ // use filterWith

  userLoginDataSet
    .map(new BlacklistMap())
    .filterWith(_._1 != "none")
    .distinct()
    .print()

}

class BlacklistMap extends RichMapFunction[UserLogin, (String, String)] {
  var source: BufferedSource = _ // 读取文件流，函数结束后执行关闭操作
  var blackUid: Seq[String] = _ // 黑名单数据，从分布式缓冲文件中载入

  override def open(config: Configuration): Unit = {
    val file: File = getRuntimeContext.getDistributedCache.getFile("blacklist-uid")
    import scala.io.Source
    source = Source.fromFile(file, "UTF-8")
    blackUid = source.getLines().toSeq
  }

  // 判断当前用户对应的 ID 在该用户对应角色中是否登录过
  override def map(value: UserLogin): (String, String) =
    if (blackUid.contains(value.uid)) (value.uid, value.status) else ("none", value.status)

  override def close(): Unit = source.close()
}
```