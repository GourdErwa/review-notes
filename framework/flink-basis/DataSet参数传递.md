> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/framework/flink-basis) ，[github-源码 ](https://github.com/GourdErwa/flink-advanced)，欢迎 Star，转载请附上原文出处链接和本声明。

# 参数传递
实际开发过程中我们需要在整个任务运行过程中传递自定义参数 。本节内容对应[官方文档 ](https://ci.apache.org/projects/flink/flink-docs-release-1.9/dev/batch/#passing-parameters-to-functions)，本节内容对应[示例源码 ](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/batch/Parameters.scala)

Dataset 定义：
```
trait Parameters extends MainApp {
  val env = ExecutionEnvironment.getExecutionEnvironment
  val toFilter = env.fromElements(1, 2, 3)
}
```
**构造函数传递**
示例代码：
```
object UseConstructor extends Parameters {

  toFilter
    .filter(_ > 2) // 2 可以由构造函数传递
    .print()

}
```
**RichFunction 函数传递**  
自定义参数调用`withParameters`方法传递给 [[org.apache.flink.api.common.functions.RichFunction]]
示例代码：
```
object UseWithParameters extends Parameters {

  val c = new Configuration()
  c.setInteger("limit", 2)

  toFilter.filter(new RichFilterFunction[Int]() {
    var limit = 0

    override def open(config: Configuration): Unit = {
      limit = config.getInteger("limit", 0)
    }

    def filter(in: Int): Boolean = in > limit
  }).withParameters(c) // 自定义参数传递给 UdfOperator&DataSource
    .print()
}
```
**全局参数传递**
自定义参数调用`setGlobalJobParameters`方法在执行配置中注册
示例代码：
```
object UseGlobally extends Parameters {
  val conf = new Configuration()
  conf.setInteger("limit", 2)
  env.getConfig.setGlobalJobParameters(conf) // 设置全局参数

  toFilter.filter(new RichFilterFunction[Int]() {
    var limit = 0

    override def open(config: Configuration): Unit = {
      val globalParams = getRuntimeContext.getExecutionConfig.getGlobalJobParameters

      // 从全局参数中获取对应值
      limit = globalParams.asInstanceOf[Configuration].getInteger("limit", limit)
    }

    def filter(in: Int): Boolean = in > limit
  })
    .print()
}
```