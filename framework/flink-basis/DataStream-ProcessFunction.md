> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/framework/flink-basis) ，[github-源码 ](https://github.com/GourdErwa/flink-advanced)，欢迎 Star，转载请附上原文出处链接和本声明。
本节内容对应[官方文档 ](https://ci.apache.org/projects/flink/flink-docs-release-1.9/dev/stream/operators/process_function.html#process-function-low-level-operations)  

[toc]
## 1 ProcessFunction 是什么

ProcessFunction 是一个低阶的流处理操作，它可以访问流处理程序的基础构建模块:
1. **事件** (event)(流元素)。
2. **状态** (state)(容错性，一致性，仅在`keyed stream`中)。
3. **定时器** (timers)(event time 和 processing time， 仅在`keyed stream`中)。


ProcessFunction 可以看作是一个具有 keyed state 和 timers 访问权的 FlatMapFunction
1. 通过 RuntimeContext 访问 keyed state 。
2. 计时器允许应用程序对处理时间和事件时间中的更改作出响应。对 processElement(…) 函数的每次调用都获得一个 Context 对象，该对象可以访问元素的 event time timestamp 和 TimerService。
3. TimerService 可用于为将来的 event/process time 注册回调。当定时器的达到定时时间时，会调用 onTimer(...) 方法。

> 注意如果要访问 **keyed state 和 timers**，则必须 ProcessFunction 在`keyed stream`上应用：  
>`stream.keyBy(...).process(new MyProcessFunction())`

## 2 应用实例-低阶 Join
要在两个输入上实现低阶 JOIN 操作，应用程序可以使用`CoProcessFunction`或`KeyedCoProcessFunction`。  
此函数绑定到两个不同的输入，并从两个不同的输入中获取单独的调用，`processElement1(...)`/`processElement2(...)`。

该操作遵循以下模式：
- 为一个输入（或两个输入）创建一个状态对象
- 接收到来自其输入的元素时，更新状态
- 接收到来自其他输入的元素后，探测状态并生成 join 的结果

> 例如：当为客户数据保存状态时，你可能会 join 客户数据和财务交易

## 3 应用实例-代码实战
在以下示例中，KeyedProcessFunction 为每个键维护一个计数，并且会把一分钟 (事件时间) 内没有更新的键/值对输出
- 计数，键以及最后更新的时间戳会存储在 ValueState 中，ValueState 由 key 隐含定义。
- 对于每条记录，KeyedProcessFunction 增加计数器并修改最后的时间戳。
- 该函数还会在一分钟后调用回调（事件时间）。
- 每次调用回调时，都会检查存储计数的最后修改时间与回调的事件时间时间戳，如果匹配则发送键/计数键值对（即在一分钟内没有更新）
  
这个简单的例子可以用会话窗口实现。在这里使用 KeyedProcessFunction 只是用来说明它的基本模式。对应[示例源码 ](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/streaming/operators/process_function/ProcessFunction.scala)
```java
object ProcessFunction extends StreamExecutionEnvironmentApp {
  val stream = GameData.DataStream.userLogin(this, 10)

  stream
    .map(o => (o.uid, o.status)) // 转换为元组模式
    // .filter(_._1 == "2|2527").startNewChain() // 过滤数据，加快调试
    .keyBy(0)
    .process(new CountWithTimeoutFunction())
    .print()

  sEnv.execute(this.getClass.getName)
}

/**
  * 状态中存储的数据类型定义
  */
case class CountWithTimestamp(key: String, count: Long, lastModified: Long)

/**
  * 维护计数和超时的 ProcessFunction 的实现
  */
class CountWithTimeoutFunction extends KeyedProcessFunction[Tuple, (String, String), (String, Long)] {

  /** 此过程功能所维护的状态 */
  lazy val state: ValueState[CountWithTimestamp] = getRuntimeContext
    .getState(new ValueStateDescriptor[CountWithTimestamp]("myState", classOf[CountWithTimestamp]))


  override def processElement(value: (String, String),
                              ctx: KeyedProcessFunction[Tuple, (String, String), (String, Long)]#Context,
                              out: Collector[(String, Long)]): Unit = {

    // 初始化或检索/更新状态
    val current: CountWithTimestamp = state.value match {
      case null =>
        CountWithTimestamp(value._1, 1, ctx.timestamp) // 使用 ProcessingTime 时 ctx.timestamp 可能为 null
      case CountWithTimestamp(key, count, _) =>
        CountWithTimestamp(key, count + 1, ctx.timestamp)
    }

    // 写回状态
    state.update(current)

    // 从当前事件时间开始注册一个的定时器
    ctx.timerService.registerProcessingTimeTimer(current.lastModified + 10)
  }

  override def onTimer(timestamp: Long,
                       ctx: KeyedProcessFunction[Tuple, (String, String), (String, Long)]#OnTimerContext,
                       out: Collector[(String, Long)]): Unit = {

    state.value match {
      // 检查定时器是过时定时器还是最新定时器
      case CountWithTimestamp(key, count, lastModified) if timestamp == lastModified + 10 =>
        out.collect((key, count))
      case _ =>
    }
  }
}
```
## 4 定时器
`TimerService` 在内部维护两种类型的定时器（处理时间和事件时间定时器）并排队执行。

`TimerService` 会删除每个键和时间戳重复的定时器，即每个键在每个时间戳上最多有一个定时器。如果为同一时间戳注册了多个定时器，则只会调用一次 onTimer（） 方法。

> Flink 同步调用 onTimer() 和 processElement() 方法。因此，不必担心状态的并发修改。
 
## 5 容错
定时器具有容错能力，并且与应用程序的状态一起进行快照。如果故障恢复或从保存点启动应用程序，就会恢复定时器。
> 在故障恢复之前应该触发的处理时间定时器会被立即触发。当应用程序从故障中恢复或从保存点启动时，可能会发生这种情况。

## 6 定时器合并
由于 Flink 仅为每个键和时间戳维护一个定时器，因此可以通过降低定时器的频率来进行合并以减少定时器的数量。


对于频率为 1 秒的定时器（事件时间或处理时间），我们可以将目标时间向下舍入为整秒数。定时器最多提前 1 秒触发，但不会迟于我们的要求，精确到毫秒。因此，每个键每秒最多有一个定时器。
```scala
val coalescedTime = ((ctx.timestamp + timeout) / 1000) * 1000
ctx.timerService.registerProcessingTimeTimer(coalescedTime)
```

由于事件时间定时器仅当 Watermark 到达时才会触发，因此我们可以将当前 Watermark 与下一个 Watermark 的定时器一起调度和合并：
```scala
val coalescedTime = ctx.timerService.currentWatermark + 1
ctx.timerService.registerEventTimeTimer(coalescedTime)
```

按以下方式停止和删除计时器：
```scala
val timestampOfTimerToStop = ...
ctx.timerService.deleteProcessingTimeTimer(timestampOfTimerToStop) // 停止处理时间计时器
ctx.timerService.deleteEventTimeTimer(timestampOfTimerToStop) // 停止事件时间计时器
```