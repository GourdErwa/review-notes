> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/framework/flink-basis) ，[github-源码 ](https://github.com/GourdErwa/flink-advanced)，欢迎 Star，转载请附上原文出处链接和本声明。
本节内容对应[官方文档 ](https://ci.apache.org/projects/flink/flink-docs-release-1.9/dev/stream/operators/windows.html)，本节内容对应[示例源码 ](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/streaming/operators/windows/)  

[toc]
## 1 Windows（窗口）
Windows 是处理无限流的核心。Windows 将流分成有限大小的**buckets**，我们可以在其上应用计算。
&emsp;    
Flink 支持两种"功能性"窗口"
1. 数据按 key 分组后转换为`KeyedStream`分配的窗口为`WindowedStream`
2. 数据未按 key 分组时，`DataStream`分配的窗口为`AllWindowedStream`
&emsp;    

以口语形象整体描述本章内容知识点，方便快速阅读理解，以`WindowedStream`为例。   
> 初次接触比较难以快速理解以上概念，我们可以整体阅读文章内容后回头再理解该描述，从整体角度理解 window 一系列操作以及每个操作的意义。

```
stream
       .keyBy(...)               <-  返回:KeyedStream
       .window(...)              <-  必选:窗口分配，根据实际业务指定具体窗口
      [.trigger(...)]            <-  选填:触发器，告诉窗口什么时候可以执行窗口函数（默认为默认实现）
      [.evictor(...)]            <-  可选:驱逐器，触发器触发后，在窗口函数执行前/后对数据操作（默认无）
      [.allowedLateness(...)]    <-  可选:指定允许延迟事件（默认为 0）
      [.sideOutputLateData(...)] <-  可选:指定延迟事件的侧输出（默认无）
       .reduce/aggregate/fold/apply()      <-  必填:窗口函数，定义窗口的数据如何计算
      [.getSideOutput(...)]      <-  可选:DataStream.getSideOutput() 获取侧输出
```
[简单示例代码-KeyedWindowCompleteExample](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/streaming/operators/windows/KeyedWindowCompleteExample.scala) ： 
```scala
  sEnv.setStreamTimeCharacteristic(TimeCharacteristic.EventTime)

  val lateOutputTag = new OutputTag[(String, Int, Double)]("late-data")

  val result = GameData.DataStream.rolePay(this, 10)
    // .filter(_.uid == "1|1051") // 过滤演示数据
    .assignAscendingTimestamps(_.eventTimestamp) // 指定 event-time
    .map(o => (o.platform, o.dataUnix, o.money))
    .keyBy(_._1) // 按平台字段分组
    .window(TumblingEventTimeWindows.of(Time.milliseconds(10))) // 窗口定义: 按 event-time 设置 10ms 的滚动窗口
    .trigger(CountTrigger.of(2)) // 触发器：窗口内数据数量 ≥ N 时触发 max 计算
    .evictor(CountEvictor.of(1000)) // 驱逐器：触发器触发后，窗口内数据量 ≥ N 时，默认从开始位置移除，最大仅保留 N 条
    .allowedLateness(Time.milliseconds(5)) // 允许延迟为 N ms
    .sideOutputLateData(lateOutputTag) // 延迟的事件输出到指定标记中
    .max(2) // 窗口函数：max 聚合函数计算

  val lateStream = result.getSideOutput(lateOutputTag)

  lateStream.print("lateStream")

  result.print("normalStream")

  sEnv.execute(this.getClass.getName)
```
### 1.1 Keyed Windows
`keyBy(...).window(...) call for the keyed streams `  
> 拥有`keyed streams`将使窗口化计算可以由多个任务**并行执行**，因为每个逻辑`keyed streams`都可以独立于其余逻辑流进行处理。引用同一键的所有元素将被发送到同一并行任务。
```
stream
       .keyBy(...)               <-  keyed versus non-keyed windows
       .window(...)              <-  required: "assigner"
      [.trigger(...)]            <-  optional: "trigger" (else default trigger)
      [.evictor(...)]            <-  optional: "evictor" (else no evictor)
      [.allowedLateness(...)]    <-  optional: "lateness" (else zero)
      [.sideOutputLateData(...)] <-  optional: "output tag" (else no side output for late data)
       .reduce/aggregate/fold/apply()      <-  required: "function"
      [.getSideOutput(...)]      <-  optional: "output tag"
```  
### 1.2 Non-Keyed Windows
`windowAll(...) for non-keyed streams`  
> 原始流将不会拆分为多个逻辑流，并且所有窗口逻辑将由单个任务执行，即并行度为 1
```  
stream
       .windowAll(...)           <-  required: "assigner"
      [.trigger(...)]            <-  optional: "trigger" (else default trigger)
      [.evictor(...)]            <-  optional: "evictor" (else no evictor)
      [.allowedLateness(...)]    <-  optional: "lateness" (else zero)
      [.sideOutputLateData(...)] <-  optional: "output tag" (else no side output for late data)
       .reduce/aggregate/fold/apply()      <-  required: "function"
      [.getSideOutput(...)]      <-  optional: "output tag"
```      
> 在上面，方括号（`[…]`）中的命令是可选的。Flink 允许您以多种不同方式自定义窗口逻辑，满足各种需求
## 2 窗口生命周期
只要属于此窗口的第一个元素到达，就会创建一个窗口，当时间（事件或处理时间）超过其结束时间戳加上用户指定的允许延迟时，窗口将被完全删除。  
&emsp;    
Flink 保证仅删除基于时间的窗口而不是其他类型的窗口，例如全局窗口。  
*例如，使用基于事件时间的窗口策略，每 5 分钟创建一个不重叠（或滚动）的窗口并允许延迟 1 分钟，当具有落入该间隔的时间戳的第一个元素到达时，Flink 将为 12:00 到 12:05 之间的间隔创建一个新窗口，当水印（Watermark）到 12:06 时间戳时它将删除它。*同时我们也可以明白 Watermark 的作用**  
&emsp;    
此外，每个窗口都有一个 Trigger 和函数（Process`window function`，ReduceFunction，AggregateFunction 或 FoldFunction）。该函数将包含要应用于窗口内容的计算，而触发器指定窗口被认为准备好应用该函数的条件。触发策略可能类似于“当窗口中的元素数量大于 4”时，或“当水位线通过窗口结束时”。触发器还可以决定在创建和删除之间的任何时间清除窗口的内容。在这种情况下，清除仅涉及窗口中的元素，而不是窗口元数据。这意味着仍然可以将新数据添加到该窗口。
&emsp;    
除上述内容外，还可以指定一个`Evictor`（参见 Evictors），它可以在触发器触发后以及应用函数之前和/或之后从窗口中删除元素。
## 3 窗口类型
Flink 提供以下类型窗口：
- Tumbling Windows：滚动窗口（没有重叠） 
- Sliding Windows：滑动窗口 （可能会重叠）
- Session Windows：会话窗口 
- Global Windows： 全局窗口

窗口由抽象类`abstract class WindowAssigner<T, W extends Window>`不同实现类创建对应类型的窗口。  
- T 为窗口存放数据类型
- W 为窗口类型 Window 实现类型。表示将窗口数据如何划分，目前提供 2 种 
    - GlobalWindow 可存放所有数据的时间窗口桶
    - TimeWindow   可存放[start,end）时间窗口桶
`WindowAssigner` 类图关系如下：

![WindowAssigner_uml](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/WindowAssigner_uml.png)

### 3.1 滚动窗户 (Tumbling Windows)
**定义**：滚动窗口具有固定的大小，并且不重叠。
例如，指定大小为 5 分钟的滚动窗口，每 5 分钟将启动一个新窗口
&emsp;   
**时间间隔指定**：`Time.milliseconds(x)，Time.seconds(x)， Time.minutes(x)，...`
&emsp;   
**窗口对齐**：  
如最后一个示例所示，滚动窗口分配器还采用一个可选 offset 参数，该参数可用于更改窗口的对齐方式。
如果没有偏移，则每小时滚动窗口与 epoch 对齐
即您将获得诸如的窗口 `1:00:00.000 - 1:59:59.999，2:00:00.000 - 2:59:59.999 ，...`依此类推。
如果要更改，可以提供一个偏移量 offset = 15 minutes
例如，`1:15:00.000 - 2:14:59.999，2:15:00.000 - 3:14:59.999` 等.
一个重要的用例的偏移是窗口调整到比 UTC-0 时区等，例如，在中国，您必须指定的偏移量 Time.hours(-8)

![tumbling-windows](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/tumbling-windows.png)

[示例代码-TumblingWindow](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/streaming/operators/windows/TumblingWindow.scala) ：           
```scala
  val rolePayDataStream: DataStream[RolePay] = GameData.DataStream.rolePay(this)
  val keyed = rolePayDataStream.keyBy(_.rid)

  // 窗口定义: 按 event-time 滚动窗口
  keyed.window(TumblingEventTimeWindows.of(Time.seconds(5)))

  // 窗口定义: 按 processing-time 滚动窗口
  keyed.window(TumblingProcessingTimeWindows.of(Time.seconds(5)))

  // 窗口定义: 每日按 event-time 滚动窗口，时间偏移-8 小时
  keyed.window(TumblingEventTimeWindows.of(Time.days(1), Time.hours(-8)))

  /*
  直接使用 KeyedStream.timeWindow 调用指定滚动时间单位，（内部自动判断时间域设置）等同于
  
    if (environment.getStreamTimeCharacteristic() == TimeCharacteristic.ProcessingTime) {
      return window(TumblingProcessingTimeWindows.of(size));
    } else {
      return window(TumblingEventTimeWindows.of(size));
    }
 */
  keyed.timeWindow(Time.seconds(5))
```
### 3.2 滑动窗 (Sliding Windows)
**定义**：滑动窗口按时间分配固定的大小，且按指定时间参数启动新的窗口，可能会重叠。  
例如，如果您指定大小为 5 分钟，滑动参数为 1 分钟，则每 1 分钟将启动一个新窗口，累计 5 分钟进入窗口的事件后该窗口结束。
&emsp;   
**时间间隔指定**：`Time.milliseconds(x)，Time.seconds(x)， Time.minutes(x)，...`
&emsp;   
**窗口对齐**：  
如最后一个示例所示，滚动窗口分配器还采用一个可选 offset 参数，该参数可用于更改窗口的对齐方式。
如果没有偏移，则每小时滚动窗口与 epoch 对齐
即您将获得诸如的窗口 `1:00:00.000 - 1:59:59.999，2:00:00.000 - 2:59:59.999 ，...`依此类推。
如果要更改，可以提供一个偏移量 offset = 15 minutes
例如，`1:15:00.000 - 2:14:59.999，2:15:00.000 - 3:14:59.999` 等.
一个重要的用例的偏移是窗口调整到比 UTC-0 时区等，例如，在中国，您必须指定的偏移量 Time.hours(-8)

![sliding-windows](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/sliding-windows.png)

[示例代码-SlidingWindow](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/streaming/operators/windows/SlidingWindow.scala) ：        
```scala
  val rolePayDataStream: DataStream[RolePay] = GameData.DataStream.rolePay(this)
  val keyed = rolePayDataStream.keyBy(_.rid)

  // 窗口定义: 按 event-time 滑动窗口，将 10s 大小的窗口滑动 5s
  keyed.window(SlidingEventTimeWindows.of(Time.seconds(10), Time.seconds(5)))

  // 窗口定义: 按 processing-time 滑动窗口
  keyed.window(SlidingProcessingTimeWindows.of(Time.seconds(10), Time.seconds(5)))

  // 窗口定义: 每日按 event-time 滑动窗口，时间偏移-8 小时
  keyed.window(SlidingProcessingTimeWindows.of(Time.hours(12), Time.hours(1), Time.hours(-8)))

  /*
  直接使用 KeyedStream.timeWindow 调用指定滑动时间大小与滑动时间间隔 (内部自动判断时间域设置),等同于
   if (environment.getStreamTimeCharacteristic() == TimeCharacteristic.ProcessingTime) {
       return window(SlidingProcessingTimeWindows.of(size, slide));
   } else {
       return window(SlidingEventTimeWindows.of(size, slide));
   }
  */
  keyed.timeWindow(Time.seconds(10), Time.seconds(5))
```
### 3.3 会话窗口 (Session Windows)
**定义**：与滑动窗口和滚动窗口相比，会话窗口不重叠且没有固定的开始和结束时间。相反，当会话窗口在一定时间段内未收到元素时（即，发生不活动间隙时），它将关闭。  
会话窗口分配器支持静态与动态时间间隔创建，其限定不活动周期有多长。当此时间段到期时，当前会话将关闭，随后的元素将分配给新的会话窗口
> 动态间隙是通过实现[[org.apache.flink.streaming.api.windowing.assigners.SessionWindowTimeGapExtractor]] 接口指定  

&emsp;   
**静态时间间隔指定**：`Time.milliseconds(x)，Time.seconds(x)， Time.minutes(x)，...`
&emsp;   
**注意**：  
    由于会话窗口没有固定的开始和结束，因此对它们的评估不同于滑动窗口和滚动窗口。
    在内部，会话窗口运算符会为每个到达的事件创建一个新窗口，如果窗口彼此之间的距离比已定义的间隔小，则将它们合并在一起。
    为了可合并的，会话窗口操作者需要一个合并触发器以及合并的窗函数，如 `ReduceFunction，AggregateFunction，Process`window function``
    (FoldFunction 不能合并）  
    
![session-windows](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/session-windows.png)
[示例代码-SessionWindow](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/streaming/operators/windows/SessionWindow.scala) ：    
```scala
  val rolePayDataStream: DataStream[RolePay] = GameData.DataStream.rolePay(this)
  val keyed = rolePayDataStream.keyBy(_.rid)

  // 窗口定义: 按 event-time 定义静态时间间隔的 SessionWindow
  keyed.window(EventTimeSessionWindows.withGap(Time.minutes(10)))

  // 窗口定义: 按 event-time 定义动态态时间间隔的 SessionWindow
  keyed.window(EventTimeSessionWindows.withDynamicGap((element: RolePay) => {
    // 确定并返回会话间隔,此处模拟返回假数据
    element.dataUnix
  }))

  // 窗口定义: 按 processing-time 定义静态时间间隔的 SessionWindow
  keyed.window(ProcessingTimeSessionWindows.withGap(Time.minutes(10)))

  // 窗口定义: 按 processing-time 定义动态态时间间隔的 SessionWindow
  keyed.window(DynamicProcessingTimeSessionWindows.withDynamicGap((element: RolePay) => {
    // 确定并返回会话间隔,此处模拟返回假数据
    element.dataUnix
  }))
```
### 3.4 全局窗口 (Global Windows)
**定义**：全局窗口分配器将所有具有相同 key 的元素分配到同一个全局窗口中，这个窗口模式仅适用于用户还需自定义触发器的情况。  
否则，由于全局窗口没有一个自然的结尾，无法执行元素的聚合，将不会有计算被执行。

![non-windowed](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/non-windowed.png)

[示例代码-GlobalWindow](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/streaming/operators/windows/GlobalWindow.scala) ：  
```scala
  val rolePayDataStream: DataStream[RolePay] = GameData.DataStream.rolePay(this)
  val keyed = rolePayDataStream.keyBy(_.rid)

  // 窗口定义: 指定全局窗口
  keyed.window(GlobalWindows.create())

  /*
  直接使用 KeyedStream.countWindow 调用指定 count 数内部创建等同于
  window(GlobalWindows.create()).trigger(PurgingTrigger.of(CountTrigger.of(size)));
  */
  keyed.countWindow(5)
  /*
  直接使用 KeyedStream.countWindow 调用指定 count 数内部创建 GlobalWindow 等同于
  window(GlobalWindows.create())
		.evictor(CountEvictor.of(size))
		.trigger(CountTrigger.of(slide));
  */
  keyed.countWindow(5, 10)
```

## 4 触发器 (Trigger)
触发器决定了一个窗口何时可以被`window function`处理，每一个窗口分配器都有一个默认的触发器，如果默认的触发器不能满足需要，你可以通过调用`WindowedStream.trigger(...)`来指定一个自定义的触发器。

> 例如：`TumblingEventTimeWindows`（滚动窗口）默认触发器为`EventTimeTrigger`，默认情况下在*当前窗口支持最大时间小于等于当前水印线时*触发`window function`。

&emsp;   
触发器的接口有 5 个方法来允许触发器处理不同的事件:
- `onElement()`方法，每个元素被添加到窗口时调用
- `onEventTime()`方法，当一个已注册的事件时间计时器启动时调用
- `onProcessingTime()`方法，当一个已注册的处理时间计时器启动时调用
- `onMerge()`方法，与状态性触发器相关，当使用会话窗口时，两个触发器对应的窗口合并时，合并两个触发器的状态。
- `clear()`方法，执行任何需要清除的相应窗口
&emsp;   

上面的方法中有两个需要注意的地方:
1. 前三个方法通过返回一个 `TriggerResult` 来决定如何操作调用他们的事件，这些操作可以是下面操作中的一个：
    - CONTINUE：什么也不做
    - FIRE：触发计算
    - PURGE：清除窗口中的数据
    - FIRE_AND_PURGE：触发计算并清除窗口中的数据
2. 这些函数可以注册 "处理时间定时器" 或者 "事件时间计时器"，被用来为后续的操作使用

### 4.1 触发器结果
触发方法的结果类型。这决定了窗口会发生什么，`TriggerResult` 返回状态包含
- CONTINUE 在窗口上不执行任何操作
- FIRE 触发计算
- PURGE 清除窗口中的元素
- FIRE_AND_PURGE 触发计算，清除窗口中的元素

一旦触发器确定窗口准备好处理数据，它将触发。例如，它返回 FIRE 或 FIRE_AND_PURGE。这是窗口算子给当前窗口发送结果的信号。
> 给定一个带有`window function`的窗口，所有的元素都被传递给`window function`(可能在将所有元素传递给`Evictor`之后)。带有 ReduceFunction 或者 FoldFunction 的窗口只是简单地发出他们急切希望得到的聚合结果。

默认情况下，内置的触发器只返回 FIRE，不会清除窗口状态
> 注意：清除将仅删除窗口的内容，并将保留有关该窗口的任何潜在元信息和任何触发状态。

### 4.2 WindowAssigners 的默认触发器
默认触发器参考 `WindowAssigner#getDefaultTrigger(StreamExecutionEnvironment env)` 子类实现  
**注意**：GlobalWindow 的默认 NeverTrigger 永不触发的。因此，必须定义一个自定义触发器  
&emsp;   
**注意**：调用`trigger()`指定触发器后，将覆盖的默认触发器。

### 4.3 Flink 内置和自定义触发器
[Trigger](https://github.com/apache/flink/blob/master//flink-streaming-java/src/main/java/org/apache/flink/streaming/api/windowing/triggers/Trigger.java) 内置实现类图
![Trigger_uml](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/Trigger_uml.png)
&emsp;   
Flink 带有一些内置触发器如下：
- `ContinuousEventTimeTrigger` 基于 EventTime&Watermark,根据给定的时间间隔连续触发
- `ContinuousProcessingTimeTrigger` 基于 ProcessingTime,根据给定的时间间隔连续触发
- `CountTrigger` 根据给定阈值，数量一旦达到阈值触发
- `DeltaTrigger` 根据 DeltaFunction 和阈值触发
- `NeverTrigger` 永远不会触发的触发器，它是 GlobalWindows 的默认触发器
- `EventTimeTrigger` EventTime&Watermark 通过窗口的支持的最大时间时触发
- `ProcessingTimeTrigger` ProcessingTime 通过窗口的支持的最大时间时触发
- `PurgingTrigger` 可以将任何触发器转换为清除的触发器
- `StateCleaningCountTrigger` 元素数量达到给定数量时触发或触发清除计时器


自定义触发器实现`Trigger`接口即可。
## 5 驱逐器 (Evictor)
驱逐器能够在触发器触发之后，在应用`window function`之前或之后从窗口中移除元素，也可以之前之后都删除元素。调用`.evictor(CountEvictor.of(10))`进行设置
&emsp;   

**Evictor 接口有两个方法：**
- `evictBefore()`包含驱逐逻辑，在`window function`之前应用
- `evictAfter()`在`window function`之后应用。在应用`window function`之前被逐出的元素将不被处理
&emsp;   

**内置的 Evictor:**
- `CountEvictor`：保持窗口内用户指定数量的元素，如果多于用户指定的数量，从窗口缓冲区的开头丢弃剩余的元素
- `DeltaEvictor`：使用 DeltaFunction 和阈值，计算窗口缓冲区中的最后一个元素与其余每个元素之间的 delta 值，并删除 delta 值大于或等于阈值的元素
- `TimeEvictor`：以毫秒为单位的时间间隔作为参数，对于给定的窗口，找到元素中的最大的时间戳 max_ts，并删除时间戳小于 max_ts - interval 的所有元素
&emsp;   

**注意** 
1. 默认默认情况下，所有预先实现的 Evictor 均在`window function`之前应用其逻辑。
2. 如果指定了 Evictor(evictBefore) 则会妨碍任何 pre-aggregation 操作，因为所有的窗口元素都会在 windowing function 计算之前先执行 evictor 操作
3. Flink 不保证窗口内元素的顺序，Evictor 可以从窗口的开头删除元素，但不一定是最先到达的元素

## 6 允许延迟 (Allowed Lateness)
默认情况下，当 watermark 通过之后，再有之前的数据到达时，这些数据会被删除。为了避免有些迟到的数据被删除，因此产生了 allowedLateness 的概念。  
*allowedLateness 针对**event-time**而言，对于其他时间类型无意义。*
> `WindowOperator#processElement`窗口操作中`allowedLateness`参与运算相关源码分析:
> 接收一个事件 element-> 根据 element 创建窗口 -> 判断创建的每个窗口是否已经延迟 (延迟直接跳出) -> 触发器进行 onElement 操作 -> 判断触发器返回结果

`allowedLateness`主要作用为：
- 窗口的清理时间逻辑
    - 如果为 event-time 类型窗口为 window.maxTimestamp() + allowedLateness
    - 其他情况为 window.maxTimestamp()
- 窗口是否延迟
    - 如果为 event-time 类型窗口为 window.maxTimestamp() + allowedLateness <= currentWatermark
    - 其他情况 false
- 事件是否延迟
    - 如果为 event-time 类型窗口为 element.getTimestamp() + allowedLateness <= currentWatermark
    - 其他情况 false
