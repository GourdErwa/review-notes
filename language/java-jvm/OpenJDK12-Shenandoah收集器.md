> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-jvm) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-jvm)，欢迎 Star，转载请附上原文出处链接和本声明。

Java JVM-虚拟机专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java JVM-虚拟机 ](https://review-notes.top/language/java-jvm/)

[[toc]]
## 前言
最初 Shenandoah 是由 RedHat 公司独立发展的新型收集器项目，在 2014 年 RedHat 把 Shenandoah 贡献给了 OpenJDK，并推动它成为 [OpenJDK 12](https://wiki.openjdk.java.net/display/shenandoah/main) 的正式特性之一。

>意味着我们的 Oracle JDK 无法使用它。

目标是实现一种能在任何堆内存大小下都可以把垃圾收集的停顿时间限制在「十毫秒」以内的垃圾收集器。

> 该目标意味着相比 CMS 和 G1，Shenandoah 不仅要进行并发的垃圾标记，还要并发地进行对象清理后的整理动作。

## 与 G1 的关系
Shenandoah 像是 G1 的下一代继承者，它们两者有着相似的堆内存布局，在初始标记、并发标记等许多阶段的处理思路上都高度一致。

它与 G1 至少有三个明显的不同之处：
1. 支持并发的整理算法，G1 的回收阶段是可以多线程并行的，但却不能与用户线程并发

2. 默认不使用分代收集，不会有专门的新生代 Region 或者老年代 Region 的存在，没有实现分代，并不是说分代对 Shenandoah 没有价值，这更多是出于性价比的权衡，基于工作量上的考虑而将其放到优先级较低的位置上

3. 摒弃了在 G1 中耗费大量内存和计算资源去维护的记忆集，改用名为「连接矩阵」（Connection Matrix）的全局数据结构来记录跨 Region 的引用关系，降低了处理跨代指针时的记忆集维护消耗，也降低了[伪共享问题](https://www.jianshu.com/p/a4358d39adac)

## 工作过程
名词解释：
- Collection Set：回收集

- Immediate Garbage Region：一个存活对象都没有找到的 Region

#### 1. 初始标记（Initial Marking）
与 G1 一样，首先标记与 GC Roots 直接关联的对象，停顿时间与堆大小无关，只与 GC Roots 的数量相关。

第一个「Stop The World」。

#### 2. 并发标记（Concurrent Marking）
与 G1 一样，遍历对象图，标记出全部可达的对象，这个阶段是与用户线程一起并发的，时间长短取决于堆中存活对象的数量以及对象图的结构复杂程度。由于应用程序可以在此阶段自由分配新数据，因此在并发标记期间堆占用率会上升。

#### 3. 最终标记（Final Marking）
与 G1 一样，处理剩余的 SATB 扫描，并在这个阶段统计出回收价值最高的 Region，将这些 Region 构成一组回收集。

第二个「Stop The World」（短暂的停顿）。

#### 4.并发清理（Concurrent Cleanup）
这个阶段用于清理「一个存活对象都没有找到的 Region」。

#### 5. 并发疏散（Concurrent Evacuation）
将回收集里面的存活对象先复制一份到其他未被使用的 Region 之中。（*这个阶段是与之前 HotSpot 中其他收集器的核心差异*）
并发疏散阶段运行的时间长短取决于回收集的大小。

> 并发进行时，复制对象动作通过读屏障和被称为「Brooks Pointers」的转发指针来解决。  
> 转发指针：在原有对象布局结构的最前面统一增加一个新的引用字段，在正常不处于并发移动的情况下，该引用指向对象自己。

#### 6. 初始引用更新（Initial Update Reference）
并发疏散阶段复制对象结束后，还需要把堆中所有指向旧对象的引用修正到复制后的新地址，这个操作称为引用更新。

引用更新的初始化阶段实际上并未做什么具体的处理，设立这个阶段只是为了建立一个线程集合点，确保所有并发疏散阶段中进行的收集器线程都已完成分配给它们的对象移动任务而已。

第三个「Stop The World」（短暂的停顿）。

#### 7. 并发引用更新（Concurrent Update Reference）
真正开始进行引用更新操作，这个阶段是与用户线程一起并发的，时间长短取决于内存中涉及的引用数量的多少。

并发引用更新与并发标记不同，它不再需要沿着对象图来搜索，只需要按照内存物理地址的顺序，线性地搜索出引用类型，把旧值改为新值即可。

#### 8. 最终引用更新（Final Update Reference）
解决了堆中的引用更新后，还要修正存在于 GC Roots 中的引用。

第四个「Stop The World」，停顿时间只与 GC Roots 的数量相关。

#### 9. 并发清理（Concurrent Cleanup）
经过并发疏散和引用更新之后，整个回收集中所有的 Region 已再无存活对象，这些 Region 都变成 Immediate Garbage Regions 了，最后再调用一次并发清理过程来回收这些 Region 的内存空间，供以后新对象分配使用。

#### 关键步骤示意图
下图为以下 3 个关键步骤的运行过程：
- 并发标记（Concurrent Marking）
- 并发疏散（Concurrent Evacuation）
- 并发引用更新（Concurrent Update Reference）

<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-jvm/_images/shenandoah-gc-cycle.png">
</div>


## 实践分析
#### 堆大小
与几乎所有其他 GC 的性能一样，Shenandoah 的性能取决于堆大小。

如果在并发阶段运行时有足够的堆空间来容纳分配，它应该会更好。

- 对于某些实时数据集少，分配压力适中的工作负载，1 - 2 GB 堆的性能很好。

- 对于高达 80％ 存活对象大小的各种工作负载上，堆大小在 4 - 128 GB 时根据实际情况测试。

#### 暂停
Shenandoah 的暂停行为主要由「GC Roots」操作控制：扫描和更新 Roots。
Roots 包括：局部变量，嵌入在生成的代码中的引用，中间字符串，来自类加载器的引用（例如静态引用），JNI 引用，JVMTI 引用。

拥有更大的「GC Roots」通常意味着对 Shenandoah 的停顿时间更长。

#### 吞吐量
由于 Shenandoah 是并发 GC。
在大多数情况下，暂停时间在 0-10ms 之内，而吞吐量损失在 0-15％之内。实际的性能数字在很大程度上取决于实际的应用程序，配置等。

## 相关参数
```java
     bool ShenandoahAcmpBarrier                    = true                                   {diagnostic} {default}
     bool ShenandoahAllocFailureALot               = false                                  {diagnostic} {default}
    uintx ShenandoahAllocSpikeFactor               = 5                                    {experimental} {default}
     intx ShenandoahAllocationStallThreshold       = 10000                                  {diagnostic} {default}
    uintx ShenandoahAllocationThreshold            = 0                                    {experimental} {default}
     bool ShenandoahAllocationTrace                = false                                  {diagnostic} {default}
     bool ShenandoahAllowMixedAllocs               = true                                   {diagnostic} {default}
     bool ShenandoahAlwaysClearSoftRefs            = false                                {experimental} {default}
     bool ShenandoahAlwaysPreTouch                 = false                                  {diagnostic} {default}
     bool ShenandoahCASBarrier                     = true                                   {diagnostic} {default}
     bool ShenandoahCloneBarrier                   = true                                   {diagnostic} {default}
    uintx ShenandoahCodeRootsStyle                 = 2                                    {experimental} {default}
     bool ShenandoahCommonGCStateLoads             = false                                {experimental} {default}
     bool ShenandoahConcurrentScanCodeRoots        = true                                 {experimental} {default}
    uintx ShenandoahControlIntervalAdjustPeriod    = 1000                                 {experimental} {default}
    uintx ShenandoahControlIntervalMax             = 10                                   {experimental} {default}
    uintx ShenandoahControlIntervalMin             = 1                                    {experimental} {default}
    uintx ShenandoahCriticalFreeThreshold          = 1                                    {experimental} {default}
     bool ShenandoahDecreaseRegisterPressure       = false                                  {diagnostic} {default}
     bool ShenandoahDegeneratedGC                  = true                                   {diagnostic} {default}
     bool ShenandoahDontIncreaseWBFreq             = true                                 {experimental} {default}
     bool ShenandoahElasticTLAB                    = true                                   {diagnostic} {default}
    uintx ShenandoahEvacAssist                     = 10                                   {experimental} {default}
    uintx ShenandoahEvacReserve                    = 5                                    {experimental} {default}
     bool ShenandoahEvacReserveOverflow            = true                                 {experimental} {default}
   double ShenandoahEvacWaste                      = 1.200000                             {experimental} {default}
    uintx ShenandoahFreeThreshold                  = 10                                   {experimental} {default}
    uintx ShenandoahFullGCThreshold                = 3                                    {experimental} {default}
    ccstr ShenandoahGCHeuristics                   = adaptive                             {experimental} {default}
    uintx ShenandoahGarbageThreshold               = 60                                   {experimental} {default}
    uintx ShenandoahGuaranteedGCInterval           = 300000                               {experimental} {default}
   size_t ShenandoahHeapRegionSize                 = 0                                    {experimental} {default}
     bool ShenandoahHumongousMoves                 = true                                 {experimental} {default}
     intx ShenandoahHumongousThreshold             = 100                                  {experimental} {default}
    uintx ShenandoahImmediateThreshold             = 90                                   {experimental} {default}
     bool ShenandoahImplicitGCInvokesConcurrent    = true                                 {experimental} {default}
    uintx ShenandoahInitFreeThreshold              = 70                                   {experimental} {default}
     bool ShenandoahKeepAliveBarrier               = true                                   {diagnostic} {default}
    uintx ShenandoahLearningSteps                  = 5                                    {experimental} {default}
     bool ShenandoahLoopOptsAfterExpansion         = true                                 {experimental} {default}
    uintx ShenandoahMarkLoopStride                 = 1000                                 {experimental} {default}
     intx ShenandoahMarkScanPrefetch               = 32                                   {experimental} {default}
   size_t ShenandoahMaxRegionSize                  = 33554432                             {experimental} {default}
    uintx ShenandoahMergeUpdateRefsMaxGap          = 200                                  {experimental} {default}
    uintx ShenandoahMergeUpdateRefsMinGap          = 100                                  {experimental} {default}
    uintx ShenandoahMinFreeThreshold               = 10                                   {experimental} {default}
   size_t ShenandoahMinRegionSize                  = 262144                               {experimental} {default}
     bool ShenandoahOOMDuringEvacALot              = false                                  {diagnostic} {default}
     bool ShenandoahOptimizeInstanceFinals         = false                                {experimental} {default}
     bool ShenandoahOptimizeStableFinals           = false                                {experimental} {default}
     bool ShenandoahOptimizeStaticFinals           = true                                 {experimental} {default}
     bool ShenandoahPacing                         = true                                 {experimental} {default}
    uintx ShenandoahPacingCycleSlack               = 10                                   {experimental} {default}
    uintx ShenandoahPacingIdleSlack                = 2                                    {experimental} {default}
    uintx ShenandoahPacingMaxDelay                 = 10                                   {experimental} {default}
   double ShenandoahPacingSurcharge                = 1.100000                             {experimental} {default}
    uintx ShenandoahParallelRegionStride           = 1024                                 {experimental} {default}
     uint ShenandoahParallelSafepointThreads       = 4                                    {experimental} {default}
     bool ShenandoahPreclean                       = true                                 {experimental} {default}
     bool ShenandoahReadBarrier                    = true                                   {diagnostic} {default}
    uintx ShenandoahRefProcFrequency               = 5                                    {experimental} {default}
     bool ShenandoahRegionSampling                 = true                                 {experimental} {command line}
      int ShenandoahRegionSamplingRate             = 40                                   {experimental} {default}
     bool ShenandoahSATBBarrier                    = true                                   {diagnostic} {default}
    uintx ShenandoahSATBBufferFlushInterval        = 100                                  {experimental} {default}
   size_t ShenandoahSATBBufferSize                 = 1024                                 {experimental} {default}
     bool ShenandoahStoreCheck                     = false                                  {diagnostic} {default}
     bool ShenandoahStoreValEnqueueBarrier         = false                                  {diagnostic} {default}
     bool ShenandoahStoreValReadBarrier            = true                                   {diagnostic} {default}
     bool ShenandoahSuspendibleWorkers             = false                                {experimental} {default}
   size_t ShenandoahTargetNumRegions               = 2048                                 {experimental} {default}
     bool ShenandoahTerminationTrace               = false                                  {diagnostic} {default}
     bool ShenandoahUncommit                       = true                                 {experimental} {default}
    uintx ShenandoahUncommitDelay                  = 300000                               {experimental} {default}
    uintx ShenandoahUnloadClassesFrequency         = 0                                    {experimental} {default}
    ccstr ShenandoahUpdateRefsEarly                = adaptive                             {experimental} {default}
     bool ShenandoahVerify                         = false                                  {diagnostic} {default}
     intx ShenandoahVerifyLevel                    = 4                                      {diagnostic} {default}
     bool ShenandoahWriteBarrier                   = true   
```

## 启动 GC-周期策略（Heuristics）

Heuristics 相关参数
```java
    ccstr ShenandoahGCHeuristics                   = adaptive                             {experimental} {default}
    uintx ShenandoahInitFreeThreshold              = 70                                   {experimental} {default}
    uintx ShenandoahMinFreeThreshold               = 10                                   {experimental} {default}
    uintx ShenandoahAllocSpikeFactor               = 5                                    {experimental} {default}
    uintx ShenandoahGarbageThreshold               = 60                                   {experimental} {default}
    uintx ShenandoahFreeThreshold                  = 10                                   {experimental} {default}
    uintx ShenandoahAllocationThreshold            = 0                                    {experimental} {default}
    ccstr ShenandoahUpdateRefsEarly                = adaptive                             {experimental} {default}
```

Heuristics 主要用于告诉 Shenandoah 何时启动一个 GC-周期。 其中` -XX:ShenandoahGCHeuristics=<name>`用于选择不同的策略

- adaptive：动态的 (默认)，学习观察先前的 GC-周期，然后启动下一个 GC-周期
    - -XX:ShenandoahInitFreeThreshold   触发​​“学习”集合的初始阈值

    - -XX:ShenandoahMinFreeThreshold    触发 GC 的可用空间阈值

    - -XX:ShenandoahAllocSpikeFactor    保留堆大小因子

    - -XX:ShenandoahGarbageThreshold    区域标记为收集之前包含的垃圾百分比

- static：静态的，根据堆占用率和分配压力决定启动 GC-周期
    - -XX:ShenandoahFreeThreshold   启动 GC-周期时可用堆的百分比

    - -XX:ShenandoahAllocationThreshold    设置自上一个 GC-周期以来，在启动新的 GC-周期之前分配的内存百分比

    - -XX:ShenandoahGarbageThreshold    区域标记为收集之前包含的垃圾百分比

- compact：紧凑型，连续的，只要分配发生，就会连续运行 GC-周期，并在上一个周期结束后立即开始下一个周期。通常会产生吞吐量开销，但会最快的进行空间回收

    - -XX:ConcGCThreads     并发 GC 线程的数量（应减少，为用户线程使用）

    - -XX:ShenandoahAllocationThreshold     设置自上一个 GC-周期以来，在启动新的 GC-周期之前分配的内存百分比

- passive：用于诊断，一旦可用内存用完，将触发「Stop The World」GC

- aggressive：用于诊断，一直处于激活状态。尽快完成上一个后启动新的 GC-周期（有点类似“compact”）


## 失败模式
Shenandoah 这样的并发 GC，依赖于比应用程序分配的更快。如果分配压力很高，并且在 GC 运行时没有足够的空间来吸收分配，则最终会发生分配失败。Shenandoah 有一个优雅的降级模式：

- Pacing：(<10 ms) Pacer 用于在 GC 不够快的时候去「暂停」正在分配对象的线程，当 GC 速度跟上来就解除对这些线程的「暂停」，「暂停」不是无期限的，取决于 ShenandoahPacingMaxDelay(单位毫秒) 参数，一旦超过该参数值就会取消「暂停」。
当分配压力大的时候，Pacer 就无能为力了，这个时候就会进入下一个模式。  
-XX：+ ShenandoahPacing 默认启用

- Degenerated GC：(<100 ms) 如果 GC-周期开始得太晚，或者发生了非常大的分配峰值，则可能会发生 Degenerated GC。在这个模式下，Shenandoah 使用的线程数取之于 ParallelGCThreads 而非 ConcGCThreads  
-XX：+ ShenandoahDegeneratedGC 默认启用

- Full GC：(>100 ms）当 Degenerated GC 之后还没有足够的内存，则进入 Full GC 周期并将堆压缩到最大，它会尽可能地进行然后释放内存以确保不发生 OOM

## 参考
> 鉴于资料有限情况，本文章遗留较多问题，比如参数的含义、失败模式下 Degenerated GC 的处理过程，后续深入了解后修正补充。

- 有关《 Java JVM JDK11 前的 7 个垃圾收集器》参考本专栏文章
- 《深入理解 Java 虚拟机：JVM 高级特性与最佳实践（第 3 版）》周志明 著
- [OpenJDK-Shenandoah](https://wiki.openjdk.java.net/display/shenandoah/main)
- [JDK12 ShenandoahGC小试牛刀](https://cloud.tencent.com/developer/article/1405874)
- [可视化 ShenandoahGC 工具 ](http://icedtea.classpath.org/hg/shenandoah-visualizer/)