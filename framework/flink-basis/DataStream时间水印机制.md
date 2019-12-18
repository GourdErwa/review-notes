> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/framework/flink-basis) ，[github-源码 ](https://github.com/GourdErwa/flink-advanced)，欢迎 Star，转载请附上原文出处链接和本声明。
本节内容对应[官方文档 ](https://ci.apache.org/projects/flink/flink-docs-release-1.9/dev/event_time.html)，本节内容对应[示例源码 ](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/streaming/Watermark.scala)  

[[toc]]
## 1 Time（时间）
所有由 Flink 事件-时间流应用生成的条目都必须伴随着一个时间戳。时间戳将一个条目与一个特定的时间点关联起来，一般这个时间点表示的是这条 record 发生的时间。不过 application 可以随意选择时间戳的含义，只要流中条目的时间戳是随着流的前进而递增即可。
&emsp;    

**支持的时间模型：**
- **EventTime** 是事件创建的时间，即事件产生时自带时间戳，*在 Flink 处理计算中，事件时间难免有延迟，为了处理延迟，必须指定 `Watermark` 的生成方式*
- **IngestionTime** 是事件进入 Flink 的时间，即进入 **source operator** 时获取所在主机时间
- **ProcessingTime** 是每一个算子操作的获取所在主机时间
&emsp;    

**时间模型比较**
- 性能： ProcessingTime> IngestTime> EventTime
- 延迟： ProcessingTime< IngestTime< EventTime
- 确定性： EventTime> IngestTime> ProcessingTime

> 注意：Flink 从数据流模型中实现了许多技术。有关事件时间和水印的一个很好的介绍，请查看下
>- [流式处理概念:时间域、窗口化 ](https://www.oreilly.com/ideas/the-world-beyond-batch-streaming-101)， [中文译文 ](http://09itblog.site/?p=270)
>- [流式处理概念:水印、触发器、积累模式 ](https://www.oreilly.com/ideas/the-world-beyond-batch-streaming-102)， [中文译文 ](http://09itblog.site/?p=279)
>- [流式处理概念:会话窗口 ](https://static.googleusercontent.com/media/research.google.com/zh-CN//pubs/archive/43864.pdf),  [中文译文 ](http://09itblog.site/?p=283)

***
**如何设置时间域？**
```scala
val env = StreamExecutionEnvironment.getExecutionEnvironment
// 默认使用 TimeCharacteristic.ProcessTime
env.setStreamTimeCharacteristic(TimeCharacteristic.ProcessingTime)

// 可选的:
// env.setStreamTimeCharacteristic(TimeCharacteristic.IngestionTime)
// env.setStreamTimeCharacteristic(TimeCharacteristic.EventTime)
```
## 2 Watermark（水印/水位线）
实时系统中，由于各种原因造成的延时，造成某些消息发到 flink 的时间延时于事件产生的时间。  
如果基于`event time`构建`window`，但是对于迟到的事件，我们又不能无限期的等下去，必须要有个机制来保证一个特定的时间后，必须触发`window`去进行计算了。这个特别的机制，就是 Watermark。


`Watermark` 作为数据处理流中的一部分进行传输，并且携带一个时间戳 t。 一个 `Watermark(t)` 表示流中应该不再有事件时间比 t 小的元素（某个事件的时间戳比 `Watermark` 时间大） 
&emsp;    

**水印有两个基本属性：**
1. 它们必须单调递增，以确保任务的 event-time 时钟向前推进，而不是向后
2. 它们与记录的时间戳是相关的。一个时间戳为 T 的水印表示的是：在它之后接下来的所有记录的时间戳，都必须大于 T
&emsp;    

Watermarks(水印) 处理机制如下：
1. 参考 google 的 DataFlow。
2. 是 event time 处理进度的标志。
3. 表示比 watermark 更早 (更老) 的事件都已经到达 (没有比水位线更低的数据 )。
4. 基于 watermark 来进行窗口触发计算的判断。

### 2.1 有序流中 Watermarks
某些情况下，基于 Event Time 的数据流是有续的 (相对 event time)。  
在有序流中，watermark 就是一个简单的周期性标记。

![stream_watermark_in_order](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/stream_watermark_in_order.png)
### 2.2 乱序流中 Watermarks
在更多场景下，基于 Event Time 的数据流是无续的 (相对 event time)。

在无序流中，Watermarks 至关重要，他告诉 operator 比 Watermarks 更早 (更老/时间戳更小) 的事件已经到达，operator 可以将内部事件时间提前到 Watermarks 的时间戳 (可以触发 window 计算)

![stream_watermark_out_of_order](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/stream_watermark_out_of_order.png)
### 2.3 并行流中的 Watermarks
通常情况下， watermark 在源函数中或源函数后生成。如果指定多次 watermark，后面指定的 watermark 会覆盖前面的值。 源函数的每个 sub-task 独立生成水印。

随着水印在算子操作中的流动，它们会提前到达其到达的算子操作的事件时间。每当算子操作提前其事件时间时，同时算子操作会为下游生成一个新的 watermark。
&emsp;    

一些算子消耗多个输入流；例如，keyBy(…) or partition(…) function。这样的算子的当前事件时间是其输入流的事件时间中的最小值。随着其输入流更新其事件时间，算子也将更新。
&emsp;    

现在详细的解释一下，一个 task 如何释放一个水印，并在收到一个新的水印时如何更新它自身的 event-time 时钟（clock）。Flink 会将数据流分成不同的分区（partition），对于每个分区，都会有不同的 operator task 处理，这些 task 并行工作处理整个数据流。每个分区都是记录（包含时间戳）与水印的数据流。对于一个 operator，基于它与上游/下游 operators 连接的方式，它的 tasks 可以从一个或多个输入分区接受 records 和水印，并释放 records 和水印到一个或多个输出分区。下面我们会详细的介绍一个 task 如何释放水印到多个 output tasks，以及它如何根据（从输入 tasks）收到的水印，推进它自身的 event-time 时钟。

一个 task 对每个输入分区，都维护了一个分区水印。当 task 从一个分区收到一个水印，它会将对应分区的水印，更新为收到的水印最大值，并设置为当前值。然后，task 更新它的 event-time 时钟为所有分区水印中的最小值。如果 event-time 时钟相较之前有增加，则 task 处理所有被触发的计时器，并最终广播它的新事件-时间到所有下游 task，此操作通过释放一个对应的水印到所有连接的输出分区完成。
&emsp;    

对于有多个输入流的（例如 Union 或 CoFlatMap 操作）operators，它们的 tasks 也会计算它们自身的 event-time 时钟，并作为所有分区水印的最小值– 他们并不（从不同的输入流中）区分 partition watermarks。这样做的结果是，两个不同的输入流中的数据会根据同一 event-time 时钟进行处理。但是，如果一个 application 的各个输入流的事件时间并不是一致的，则这个行为会导致问题。
&emsp;    

Flink 的水印处理以及传播算法,确保了 operator task 恰当地释放一致时间戳的记录和水印。然而它依赖的基础是：所有分区持续提供递增的水印。一旦一个分区的水印不再递增，或者完全空闲（不再发送任何记录与水印），则 task 的事件-时间时钟不会再向前推进，并且 task 的计时器也不会被触发。在基于时间的、依赖于向前（advancing）时钟执行计算（并做清理）的 operators 中，便会造成问题。最终会导致处理延时、state 大小剧增（如果没有定期从所有的输入任务中接收到新的水印）。

若是两个输入流的水印差异太大，也会造成类似的影响。在有两个输入流的 task 中，它的事件-时钟会对应于较慢的流，并且较快的流的 records 或是中间结果一般会缓存到 state 中，直到 event-time 时钟允许处理它们。

![parallel_streams_watermarks](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/parallel_streams_watermarks.png)

## 3 指定 Timestamp 与生成 Watermarks
### 3.1 SourceFunction 直接定义
```java
class GameSourceFunction[T <: GameModel](seq: Seq[T], millis: Long = 0) extends SourceFunction[T] {

  private var counter = 0
  private var isRunning = true

  override def run(ctx: SourceFunction.SourceContext[T]): Unit = {
    while (isRunning && counter < seq.length) {
      // ctx.collect(seq(counter))
      val next = seq(counter)
      ctx.collectWithTimestamp(next, next.eventTimestamp) // 毫秒时间戳
      //      if (next.hasWatermarkTime) {
      //        ctx.emitWatermark(new Watermark(next.getWatermarkTime))
      //      }
      counter = counter + 1
      Thread.sleep(millis)
    }
  }

  override def cancel(): Unit = {
    isRunning = false
  }
}
```
### 3.2 通过 Flink 的 Timestamp Assigner 指定

Flink 提供了两个接口用于指定 Timestamp 与 Watermarks
- `AssignerWithPeriodicWatermarks`  按时间间隔周期性生成 Watermarks 
- `AssignerWithPunctuatedWatermarks` 根据接入的事件触发条件生成 Watermarks

生成类图关系如下：
![timestampAssigner_uml](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/timestampAssigner_uml.png)

`DataStream`支持指定`Timestamp 与 Watermarks` API
```scala
def assignTimestamps(extractor: TimestampExtractor[T]): DataStream[T] // 已废弃 @Deprecated
def assignAscendingTimestamps(extractor: T => Long): DataStream[T] // 底层转换为 AssignerWithPeriodicWatermarks
def assignTimestampsAndWatermarks(assigner: AssignerWithPeriodicWatermarks[T]): DataStream[T]
def assignTimestampsAndWatermarks(assigner: AssignerWithPunctuatedWatermarks[T]): DataStream[T]
```

简单示例：
```scala
sEnv.setStreamTimeCharacteristic(TimeCharacteristic.EventTime) // 设置时间域
stream.assignTimestampsAndWatermarks(new GameAscendingTimestampExtractor[UserLogin]) // 设置水印生成器
```
####3.2.1 AssignerWithPeriodicWatermarks（周期性水印生成器）
通过定义生成水印的间隔（每 n 毫秒） `ExecutionConfig.setAutoWatermarkInterval(...)`。   
调用`AssignerWithPeriodicWatermarks`的`getCurrentWatermark()`方法，如果返回的水印非空且大于前一个水印，则覆盖以前的水印。

总结为：
- 基于 Timer
- ExecutionConfig.setAutoWatermarkInterval(msec) (默认是 200ms, 设置 Watermarks 发送的周期)
- 实现 `AssignerWithPeriodicWatermarks` 接口

##### 3.2.1.1 Flink-API 提供：时间戳单调递增的分配器
适用于 event-time 戳单调递增的场景，数据没有太多延时。  
> 底层实现为 `AscendingTimestampExtractor<T> implements AssignerWithPeriodicWatermarks<T>`

`val withTimestampsAndWatermarks = stream.assignAscendingTimestamps( _.getCreationTime )`

##### 3.2.1.2 Flink-API 提供：允许固定延迟的分配器
适用于预先知道最大延迟的场景 (例如最多比之前的元素延迟 3000ms)。  
> 底层实现为 `BoundedOutOfOrdernessTimestampExtractor<T> implements AssignerWithPeriodicWatermarks<T>`

##### 3.2.1.3 自定义实现 AssignerWithPeriodicWatermarks 示例
```scala

// 设置水印生成器
stream.assignTimestampsAndWatermarks(new BoundedOutOfOrdernessGenerator[UserLogin]())
stream.assignTimestampsAndWatermarks(new TimeLagWatermarkGenerator[UserLogin]())

/**
周期性水印生成器 = 示例 1
此生成器生成的水印支持处理给定延迟时间范围内的数据
支持延迟的时间动态计算 = 当前处理事件中的最大时间 - 支持最大延迟时间
  */
class BoundedOutOfOrdernessGenerator[T <: GameModel] extends AssignerWithPeriodicWatermarks[T] {

  val maxOutOfOrderness = 3500L // 支持最大延迟时间 3.5 seconds

  var currentMaxTimestamp: Long = _ // 当前最大时间

  override def extractTimestamp(element: T, previousElementTimestamp: Long): Long = {
    val timestamp = element.eventTimestamp
    currentMaxTimestamp = Math.max(timestamp, currentMaxTimestamp)
    timestamp
  }

  // 返回水印为当前最大时间减去支持最大延迟时间
  override def getCurrentWatermark: Watermark =
    new Watermark(currentMaxTimestamp - maxOutOfOrderness)
}

/**
周期性水印生成器 = 示例 2
此生成器生成的水印支持处理给定延迟时间范围内的数据。
支持延迟的时间动态计算 = 当前系统时间 - 支持最大延迟时间
  */
class TimeLagWatermarkGenerator[T <: GameModel] extends AssignerWithPeriodicWatermarks[T] {

  val maxTimeLag = 5000L // 支持最大延迟时间 5 seconds

  override def extractTimestamp(element: T, previousElementTimestamp: Long): Long =
    element.eventTimestamp

  // 返回水印为当前时间减去支持最大延迟时间
  override def getCurrentWatermark: Watermark =
    new Watermark(System.currentTimeMillis() - maxTimeLag)
}
```
#### 3.2.2 AssignerWithPunctuatedWatermarks（条件水印生成器）
使用 `AssignerWithPunctuatedWatermarks`接口。  
首先调用该 `extractTimestamp(...)`方法为元素分配时间戳，然后立即调用`checkAndGetNextWatermark(...)`方法。  
如果返回的水印非空且大于前一个水印，则覆盖以前的水印。

总结为：
- 实现 `AssignerWithPunctuatedWatermarks` 接口
- 生成水印逻辑自定义

> 注意：可以在每个事件上生成水印。但是，由于每个水印都会在下游引起一些计算，因此过多的水印会降低性能。
```scala
// 设置水印生成器
stream.assignTimestampsAndWatermarks(new PunctuatedAssigner[UserLogin]())
    
/** 带条件的水印生成器 = 示例
在特定事件规则，可能会生成新的水印时生成水印
  */
class PunctuatedAssigner[T <: GameModel] extends AssignerWithPunctuatedWatermarks[T] {

  override def extractTimestamp(element: T, previousElementTimestamp: Long): Long = {
    element.eventTimestamp
  }

  override def checkAndGetNextWatermark(lastElement: T, extractedTimestamp: Long): Watermark = {
    if (lastElement.hasWatermarkMarker) new Watermark(extractedTimestamp) else null
  }
}
```
## 4.为每个 Kafka 分区分配时间戳/水印
当 kafka 作为数据源时，kafka 的每个 Partition 分区里面时间戳可能是升序或者乱序模式。通常情况，我们会多个 Partition 分区并行处理，我们可以为 kafka 配置水印。
kafka 内部为每个 Partition 分区维护一个水印，并且在流进行 shuffle 时以**2.3 并行流中的 Watermarks**进行水印合并
```scala
val kafkaSource = new FlinkKafkaConsumer09[MyType]("myTopic", schema, props)
kafkaSource.assignTimestampsAndWatermarks(new AscendingTimestampExtractor[MyType] {
    def extractAscendingTimestamp(element: MyType): Long = element.eventTimestamp
})

val stream: DataStream[MyType] = env.addSource(kafkaSource)
```
<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/parallel_kafka_watermarks.png" height="100%">
</div>