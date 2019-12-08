
>专栏原创出处：[源笔记文件](https://github.com/GourdErwa/review-notes/tree/master/framework/flink-basis) ，[源码](https://github.com/GourdErwa/flink-advanced)

在某些算法中，可能需要为数据集元素分配唯一标识符。[[org.apache.flink.api.scala.utils.DataSetUtils]] scala包装类  
具体实现源码可参考 [DataSetUtils](https://github.com/apache/flink/blob/master//flink-java/src/main/java/org/apache/flink/api/java/utils/DataSetUtils.java)

## **zipWithIndex**
为元素分配连续的标签，接收数据集作为输入并返回 DataSet[(Long, T)] 2元组的新数据集。  
此过程需要两步操作，首先是计数，然后是标记元素，由于计数同步，因此无法进行流水线处理。  
替代方法 zipWithUniqueId 以流水线方式工作，当唯一的标签足够时，它是首选方法。
  
## **zipWithUniqueId**
在许多情况下，可能不需要分配连续的标签。  
zipWithUniqueId 以管道方式工作，加快了标签分配过程。  
此方法接收一个数据集作为输入，并返回一个新的 DataSet[(Long, T)] 2元组数据集

代码示例 [ZippingElements](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/batch/ZippingElements.scala) ：  
```scala
import io.gourd.flink.scala.api.BatchExecutionEnvironmentApp

/** 在某些算法中，可能需要为数据集元素分配唯一标识符。
  * 本文档说明了如何将
  * [[org.apache.flink.api.scala.utils.DataSetUtils]]
  * [[org.apache.flink.api.java.utils.DataSetUtils.zipWithIndex()]]
  * [[org.apache.flink.api.java.utils.DataSetUtils.zipWithUniqueId()]]
  * 用于此目的。
  *
  * @author Li.Wei by 2019/11/12
  */
object ZippingElements extends BatchExecutionEnvironmentApp {

  import org.apache.flink.api.scala._

  val input: DataSet[String] = bEnv.fromElements("A", "B", "C", "D", "E", "F", "G", "H")
  bEnv.setParallelism(2)

  /*
  zipWithIndex为元素分配连续的标签，接收数据集作为输入并返回 DataSet[(Long, T)] 2元组的新数据集。
  此过程需要两步操作，首先是计数，然后是标记元素，由于计数同步，因此无法进行流水线处理。
  替代方法zipWithUniqueId以流水线方式工作，当唯一的标签足够时，它是首选方法。
   */

  import org.apache.flink.api.scala.utils.DataSetUtils

  input.zipWithIndex.print()
/*
(0,A)
(1,B)
(2,C)
(3,D)
(4,E)
(5,F)
(6,G)
(7,H)
 */
  println()
  /*
  在许多情况下，可能不需要分配连续的标签。
  zipWithUniqueId以管道方式工作，加快了标签分配过程。
  此方法接收一个数据集作为输入，并返回一个新的 DataSet[(Long, T)] 2元组数据集
  
  本机执行，未发生并行，实际情况参考分布式测试结果
   */
  input.zipWithUniqueId.print()
  /*
(0,A)
(1,B)
(2,C)
(3,D)
(4,E)
(5,F)
(6,G)
(7,H)
   */
}
```