> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/framework/flink-basis) ，[github-源码 ](https://github.com/GourdErwa/flink-advanced)，欢迎 Star，转载请附上原文出处链接和本声明。
本节内容对应[官方文档 ](https://ci.apache.org/projects/flink/flink-docs-release-1.9/dev/datastream_api.html)

[[toc]]
## 1 简单示例程序
[示例源码 ](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/streaming/StreamingSimple.scala)
```scala
object StreamingSimple extends StreamExecutionEnvironmentApp {

  val rolePayDataStream: DataStream[RolePay] = GameData.DataStream.rolePay(this)

  rolePayDataStream
    .filter(_.getDataUnix > 0)       // 过滤
    .map(o => (o.platform, o.dataUnix, o.money))    // 转换为元组
    .keyBy(0)                       // 按 platform 字段分组
    .timeWindow(Time.seconds(5))    // 5s 窗口统计
    .sum(2)                         // 聚合 money 字段
    .print()
    
  sEnv.execute(this.getClass.getName) // 执行

  /* 持续性输出部分示例：
  3> (IOS_YY,1571497479,4170.0)
  4> (ADR,1571576109,2640.0)
  1> (IOS,1571575689,5230.0)
  1> (H5,1571576559,2084.0)
    ...
    ...
   */
}
```  
## 2 Data Sources（数据源）
### 基于文件
- `createInput(inputFormat)`-自定义文件基础类
- `readTextFile(path)// TextInputFormat`-逐行读取文件，并将它们作为字符串返回。
- `readFile(fileInputFormat, path)`-根据指定的文件输入格式读取（一次）文件。
- `readFile(fileInputFormat, path, watchType, interval, pathFilter)-`-监控文件并读取数据
- `readFileOfPrimitives(path, delimiter)`// PrimitiveInputFormat-解析以换行符（或其他 char 序列）定界的原始数据类型的文件，例如 String 或 Integer 使用给定的定界符。
- `readSequenceFile(Key, Value, path)`// SequenceFileInputFormat-创建 JobConf 并从指定的路径中读取类型为 SequenceFileInputFormat，Key 类和 Value 类的文件，并将它们作为 Tuple2 <Key，Value> 返回。
### 基于套接字
- `socketTextStream`-从 socket 读取。数据可以由分隔符分割。
### 基于集合
- `fromCollection(Seq)`-从 Java Java.util.Collection 创建数据流。集合中的所有数据必须具有相同的类型。不能并行执行（并行度=1）
- `fromCollection(Iterator)`-从迭代器创建数据流。该类指定迭代器返回的数据的数据类型。不能并行执行（并行度=1）
- `fromElements(elements: _*)`-从给定的对象序列创建数据流。所有对象必须具有相同的类型。不能并行执行（并行度=1）
- `fromParallelCollection(SplittableIterator)`-从迭代器并行创建数据流。该类指定迭代器返回的数据的数据类型。
- `generateSequence(from, to)` -并行生成给定间隔中的数字序列。
### 自定义
- `addSource`-自定义`SourceFunction`数据源读取。

## 3 Data Sinks（输出端）
- `writeAsText()/ TextOutputFormat`-将数据按行写为字符串。通过调用每个数据的 toString 方法获得字符串。
- `writeAsCsv(...)/ CsvOutputFormat`-将元组写为逗号分隔的值文件。行和字段定界符是可配置的。每个字段的值来自对象的 toString 方法。
- `print()/ printToErr()` - 在标准输出/标准错误流上打印每个数据的 toString（）值。可以提供前缀字符串区分不同的打印调用。如果并行度大于 1，则输出之前还将带有产生输出的任务的标识符。
- `writeUsingOutputFormat()/ FileOutputFormat`-自定义文件输出的方法和基础类。支持自定义对象到字节的转换。
- `writeToSocket` -根据以下内容将数据写入套接字 SerializationSchema
- `addSink`-调用自定义接收器功能。Flink 捆绑有连接到其他系统（例如 Apache Kafka）的连接器，这些连接器实现为接收器功能。
> 请注意，上的 write*() 方法 DataStream 主要用于调试目的。它们不参与 Flink 的检查点，这意味着这些功能通常具有至少一次的语义。刷新到目标系统的数据取决于 OutputFormat 的实现。这意味着并非所有发送到 OutputFormat 的数据都立即显示在目标系统中。同样，在失败的情况下，这些记录可能会丢失。

**说明**
为了将流可靠，准确地一次传输到文件系统中，请使用`flink-connector-filesystem`。

Flink 还提供接收器以收集 DataStream 结果以进行测试和调试。可以如下使用：
```scala
import org.apache.flink.streaming.experimental.DataStreamUtils
import scala.collection.JavaConverters.asScalaIteratorConverter

val myResult: DataStream[(String, Int)] = ...
val myOutput: Iterator[(String, Int)] = DataStreamUtils.collect(myResult.javaStream).asScala
```
## 4 Operators（算子）
### Transformation（转换操作）
#### Map
**DataStream -> DataStream**  
一个元素转换为一个新的元素
```scala
dataStream.map { x => x * 2 }
```    
#### FlatMap
**DataStream -> DataStream**     
一个元素转换为零个，一个或多个新的元素    	
```scala
dataStream.flatMap { str => str.split(" ") }
```    
#### Filter
**DataStream -> DataStream**   

为每个元素执行 boolean 函数判断，仅返回为 true 的元素   
```scala
dataStream.filter { _ != 0 }
```   
#### KeyBy
**DataStream -> KeyedStream**	

在逻辑上将流划分为不相交的分区，每个分区都包含同一键的元素。在内部是通过哈希分区实现的
```scala
dataStream.keyBy("someKey") // Key by field "someKey"
dataStream.keyBy(0) // Key by the first element of a Tuple
```    
#### Reduce
**KeyedStream -> DataStream**

对`KeyedStream`进行`reduce`函数操作
```scala
keyedStream.reduce { _ + _ }
```            
#### Fold
**KeyedStream -> DataStream**
	
对`KeyedStream`进行`fold`函数操作
```scala
val result: DataStream[String] =
    keyedStream.fold("start")((str, i) => { str + "-" + i })
```          
#### Aggregations
**KeyedStream -> DataStream**	

对`KeyedStream`进行`Aggregations`函数操作，支持求最大、最小、和运算
```scala
keyedStream.sum(0)
keyedStream.sum("key")
keyedStream.min(0)
keyedStream.min("key")
keyedStream.max(0)
keyedStream.max("key")
keyedStream.minBy(0)
keyedStream.minBy("key")
keyedStream.maxBy(0)
keyedStream.maxBy("key")
```    
#### Window
**KeyedStream -> WindowedStream**	

在已经分区的`KeyedStream`上定义 Windows。 Windows 根据某些特征将每个键中的数据分组（例如，最近 5 秒钟内到达的数据）
```scala
// Last 5 seconds of data
dataStream.keyBy(0).window(TumblingEventTimeWindows.of(Time.seconds(5))) 
``` 
#### WindowAll
**DataStream -> AllWindowedStream**	

Windows 可以在常规 DataStreams 上定义。 Windows 会根据某些特征（例如，最近 5 秒钟内到达的数据）对所有流事件进行分组

> 警告：在许多情况下，这是非并行转换。所有记录将被收集在 windowAll 运算符的一项任务中。
```scala
// Last 5 seconds of data
dataStream.windowAll(TumblingEventTimeWindows.of(Time.seconds(5))) 
```  
#### Window Apply
**WindowedStream -> DataStream**

**AllWindowedStream -> DataStream**	

将一般功能应用于整个窗口。以下是一个手动汇总窗口元素的函数。
> 注意：如果使用 windowAll 转换，则需要使用 AllWindowFunction。
```scala
windowedStream.apply { WindowFunction }
// applying an AllWindowFunction on non-keyed window stream
allWindowedStream.apply { AllWindowFunction }
```
#### Window Reduce
**WindowedStream -> DataStream**	
将 reduce 函数应用于窗口，并返回减小的值。
```scala
windowedStream.reduce { _ + _ }
```
#### Window Fold
**WindowedStream -> DataStream**	

在`WindowedStream`上应用`fold`函数
```scala
val result: DataStream[String] =
    windowedStream.fold("start", (str, i) => { str + "-" + i })
```          
#### Aggregations on windows
**WindowedStream -> DataStream**	

对`WindowedStream`进行`Aggregations`函数操作，支持求最大、最小、和运算
```scala
windowedStream.sum(0)
windowedStream.sum("key")
windowedStream.min(0)
windowedStream.min("key")
windowedStream.max(0)
windowedStream.max("key")
windowedStream.minBy(0)
windowedStream.minBy("key")
windowedStream.maxBy(0)
windowedStream.maxBy("key")
```    
#### Union
**`DataStream*` -> DataStream**	

两个或多个`DataStream`的并集，创建一个包含所有流中所有元素的新流。
> 注意：如果将`DataStream`与其自身合并，则在结果流中每个元素将获得两次。
```scala
dataStream.union(otherStream1, otherStream2, ...)
```    
#### Window Join
**DataStream,DataStream -> DataStream**	

在给定键和一个公共窗口上连接两个数据流。
```scala
dataStream.join(otherStream)
    .where(<key selector>).equalTo(<key selector>)
    .window(TumblingEventTimeWindows.of(Time.seconds(3)))
    .apply { ... }
```    
#### Window CoGroup
**DataStream,DataStream -> DataStream**	

在给定键和公共窗口上将两个数据流组合在一起。
```scala
dataStream.coGroup(otherStream)
    .where(0).equalTo(1)
    .window(TumblingEventTimeWindows.of(Time.seconds(3)))
    .apply {}
```    
#### Connect
**DataStream,DataStream -> ConnectedStreams**	

“连接”两个保留其类型的数据流，从而允许两个流之间共享状态。
```scala
someStream : DataStream[Int] = ...
otherStream : DataStream[String] = ...

val connectedStreams = someStream.connect(otherStream)
 ```   
#### CoMap, CoFlatMap
**ConnectedStreams -> DataStream**	

与`DataStream`的 map 和 flatMap 相似，使用类型匹配匹配流进行计算
```scala
connectedStreams.map(
    (_ : Int) => true,
    (_ : String) => false
)
connectedStreams.flatMap(
    (_ : Int) => true,
    (_ : String) => false
)
```    
#### Split
**DataStream -> SplitStream**	

根据某些*标准*将流分成两个或多个流。
```scala
val split = someDataStream.split(
  (num: Int) =>
    (num % 2) match {
      case 0 => List("even")
      case 1 => List("odd")
    }
)
```                
#### Select
**SplitStream -> DataStream**	

从拆分流中选择一个或多个流。
```scala
val even = split select "even"
val odd = split select "odd"
val all = split.select("even","odd")
```                
#### Iterate
**DataStream -> IterativeStream -> DataStream**	

DataStream 迭代计算
```scala
initialStream.iterate {
  iteration => {
    val iterationBody = iteration.map {/*do something*/}
    (iterationBody.filter(_ > 0), iterationBody.filter(_ <= 0))
  }
}
```                
#### Extract Timestamps
**DataStream -> DataStream**	

从记录中提取时间戳，以便与使用事件时间语义的窗口一起使用。请参`5.1-Flink DataStream 时间机制 (Time&Watermark)`。
```scala
stream.assignTimestamps { timestampExtractor }
```
#### extensions API（扩展 API）
利用类型匹配计算，支持 API 参考 [scala_api_extensions](https://ci.apache.org/projects/flink/flink-docs-release-1.9/dev/scala_api_extensions.html#datastream-api)
```scala
import org.apache.flink.streaming.api.scala.extensions._

data.mapWith {
  case (_, value) => value.toString
}
```
### Physical partitioning（物理分区）
#### Custom partitioning（自定义分区）
```scala
dataStream.partitionCustom(partitioner, "someKey")
dataStream.partitionCustom(partitioner, 0)
```
#### Random partitioning（随机分区）
`dataStream.shuffle()`
#### Rebalancing（重新负载分区）
内容使用`round robin`方法将数据均匀打散。存在数据偏斜的情况下对性能优化有用。
`dataStream.rebalance()`
#### Rescaling（重新缩放）
通过执行 oepration 算子来实现的。由于这种方式仅发生在一个单一的节点，因此没有跨网络的数据传输。


如果上游操作有 2 个并发，而下游操作有 4 个并发，那么上游的一个并发结果分配给下游的两个并发操作，另外的一个并发结果分配给了下游的另外两个并发操作。  
另一方面，下游有两个并发操作而上游又 4 个并发操作，那么上游的其中两个操作的结果分配给下游的一个并发操作而另外两个并发操作的结果则分配给另外一个并发操作。
>Rebalancing 会产生全量重分区，而 Rescaling 不会。

`dataStream.rescale()`
#### Broadcasting（广播）
广播用于将 dataStream 所有数据发到每一个 partition。
`inputStream.broadcast()`

### 算子链和任务槽
- Flink 出于分布式执行的目的，将 operator 的 subtask 链接在一起形成 task（类似 spark 中的管道）。
- 每个 task 在一个线程中执行。
- 将 operators 链接成 task 是非常有效的优化：它可以减少线程与线程间的切换和数据缓冲的开销，并在降低延迟的同时提高整体吞吐量。
> 参考***《运行环境》***内容
#### 开始新算子链
`someStream.filter(...).map(...).startNewChain().map(...)`
#### 禁用算子链
`someStream.map(...).disableChaining()`
#### 显示指定任务槽
`someStream.filter(...).slotSharingGroup("name")`

## 5 容错能力
> 参考[7.0-Flink 状态与容错 ](https://github.com/GourdErwa/flink-advanced/blob/master/flink-notes/7.0-Flink%E7%8A%B6%E6%80%81%E4%B8%8E%E5%AE%B9%E9%94%99.md)

## 6 延迟控制
默认情况下，数据不会在网络上一对一传输（这会导致不必要的网络通信），但是会进行缓冲。


缓冲区的大小（实际上是在计算机之间传输的）可以在 Flink 配置文件中设置。  
尽管此方法可以优化吞吐量，但是当传入流不够快时，它可能会导致延迟问题。  
为了控制吞吐量和延迟，可以`env.setBufferTimeout(timeoutMillis)`在执行环境（或各个运算符）上使用来设置缓冲区填充的最大等待时间。  
在此时间之后，即使缓冲区未满，也会自动发送缓冲区。
> 此超时的默认值为 100 毫秒。

```scala
val env: LocalStreamEnvironment = StreamExecutionEnvironment.createLocalEnvironment
env.setBufferTimeout(timeoutMillis)

env.generateSequence(1,10).map(myMap).setBufferTimeout(timeoutMillis)
```
- 为了**最大化吞吐量**，请设置 set setBufferTimeout(-1) 来消除超时，并且仅在缓冲区已满时才刷新它们。  
- 为了**最小化延迟**，请将超时设置为接近 0 的值（例如 5 或 10 ms）。应避免将缓冲区超时设置为 0，因为它可能导致严重的性能下降。



