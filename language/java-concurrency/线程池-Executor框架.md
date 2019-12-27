> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程](https://review-notes.top/language/java-concurrency/)

[[toc]]
## Executor 框架是什么
Java 线程的创建与销毁需要一定的开销，因此为每一个任务创建一个新线程来执行，线程的创建与开销将浪费大量计算资源。而且，如果不对创建线程的数量做限制，可能会导致系统负荷太高而崩溃。

Java 的线程既是工作单元，也是执行机制。JDK1.5 之后，工作单元与执行机制分离，工作单元包括 Runnable 和 Callable，执行机制由 Executor 框架负责。

## Executor 框架的两级调度模型
在 HotSpot VM 的线程模型中，Java 线程被一对一映射为本地操作系统线程。
- Java 线程启动时会创建一个本地操作系统线程。
- 当该 Java 线程终止时，这个操作系统线程也会被回收。操作系统会调度所有线程并将它们分配给可用的 CPU。

***
两级调度模型描述为：
- 在上层，Java 多线程程序通常把应用分解为若干个任务，然后使用用户级的调度器 (Executor 框架) 将这些任务映射为固定数量的线程;
- 在底层，操作系统内核将这些线程映射到硬件处理器上。

## Executor 框架组成
Executor 框架主要由 3 大部分组成如下：
1. **任务的提交**：包括被执行任务需要实现的接口:Runnable 接口或 Callable 接口。
2. **任务的执行**：包括任务执行机制的核心接口 Executor，以及继承自 Executor 的 ExecutorService 接口。Executor 框架有两个关键类实现了 ExecutorService 接口 (ThreadPoolExecutor 和 ScheduledThreadPoolExecutor)。
3. **任务的结果**：异步计算的结果，包括接口 Future 和实现 Future 接口的 FutureTask 类。

### 任务的执行核心类说明
任务的执行，核心接口 Executor 一些基础类类图：
<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/类图关系-Executor.png">
</div>

下面是这些类和接口的简介：
- Executor : 是一个接口，它是 Executor 框架的基础，它将任务的提交与任务的执行分离开
- ExecutorService : 继承 Executor 接口，提供了任务的提交和停止的方法
- AbstractExecutorService : 是 ExecutorService 的抽象实现
- ThreadPoolExecutor : 是 AbstractExecutorService 的核心实现类，用来执行被提交的任务
- ScheduledExecutorService ： 继承 ExecutorService 接口，额外提供了可以在给定的延迟后运行命令，或者定期执行命令的 schedule 方法
- ScheduledThreadPoolExecutor : 是 ScheduledExecutorService 的核心实现类，它比 Timer 更灵活，功能更强大
- ForkJoinPool : 支持将一个任务拆分成多个“小任务”并行计算，再把多个“小任务”的结果合并成总的计算结果

### 任务提交与结果返回核心类说明
任务的提交`Runnable 接口或 Callable 接口`与任务的结果 `Future 接口`关系图：
<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/类图关系-Future.png">
    <p> 类图关系-Future </p>
</div>

下面是这些类和接口的简介：
- Runnable 接口: 任务方法无返回结果，可以被 ExecutorService 接口执行。
- Callable 接口: 任务方法有返回结果，可以被 ExecutorService 接口执行。
- Future 接口: 实现类代表异步计算的结果。
    - FutureTask 代表异步计算的结果
    - ScheduledFutureTask 代表异步计算的结果，提供了`getDelay`任务剩余的延迟时间、`isPeriodic`任务是否为周期性任务

## Executors 工厂方法类说明
Executors 是一个静态的工厂方法类，提供快速创建线程池等操作。
- new XX 方法，使用常用的配置设置创建 ExecutorService
    - newFixedThreadPool-固定线程数的线程池
    - newSingleThreadExecutor-单个线程的线程池
    - newCachedThreadPool-根据需要创建新线程的线程池
- new XX 方法，使用常用的配置设置创建 ScheduledExecutorService
    - newScheduledThreadPool-ScheduledExecutorService
    - newSingleThreadScheduledExecutor-单个线程的 ScheduledExecutorService
- unconfigurableXX 方法，包装一个不可配置的线程池
    - unconfigurableExecutorService
    - unconfigurableScheduledExecutorService

> 以下关于各类线程池的创建无特殊说明，创建方法都是指 Executors 中的静态方法
## ThreadPoolExecutor 详解
### FixedThreadPool
FixedThreadPool 被称为可重用固定线程数的线程池。Executors 提供的静态创建方法如下：
```java
    public static ExecutorService newFixedThreadPool(int nThreads) {
        return new ThreadPoolExecutor(nThreads, nThreads,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>());
    }
```
#### 参数设置说明
- corePoolSize 和 maximumPoolSize 都被设置为创建 FixedThreadPool 时指定的参数 nThreads。   
当线程池中的线程数大于 corePoolSize 时，keepAliveTime 为多余的空闲线程等待新任务的最长时间，超过这个时间后多余的线程将被终止。   
- keepAliveTime 设置为 0L，意味着多余的空闲线程会被立即终止。
- FixedThreadPool 使用无界队列 LinkedBlockingQueue 作为线程池的工作队列（队列的容量为 Integer.MAX_VALUE）。 
#### 优缺点
- 优点是多任务并行运行，最大并行运行线程数量是固定的
- 优点是能够保证所有的任务都被执行，永远不会拒绝新的任务
- 缺点是队列数量没有限制，在任务执行时间无限延长的这种极端情况下会造成内存问题
   
#### 使用无界队列作带来的影响
1. 当线程池中的线程数达到 corePoolSize 后，新任务将在无界队列中等待，因此线程池中的线程数不会超过 corePoolSize。 
2. 由于 1，使用无界队列时 maximumPoolSize 将是一个无效参数。 
3. 由于 1 和 2，使用无界队列时 keepAliveTime 将是一个无效参数。 
4. 由于使用无界队列，运行中的 FixedThreadPool（未执行方法 shutdown 或 shutdownNow）不会拒绝任务（不会调用 RejectedExecutionHandler.rejectedExecution 方法）。

### SingleThreadExecutor
SingleThreadExecutor 是使用单个线程的线程池。Executors 提供的静态创建方法如下：
```java
    public static ExecutorService newSingleThreadExecutor(ThreadFactory threadFactory) {
        return new FinalizableDelegatedExecutorService
            (new ThreadPoolExecutor(1, 1,
                                    0L, TimeUnit.MILLISECONDS,
                                    new LinkedBlockingQueue<Runnable>(),
                                    threadFactory));
    }
```
#### 参数设置及影响说明
- corePoolSize 和 maximumPoolSize 被设置为 1。其他参数与 FixedThreadPool 相同。
- 使用无界队列 LinkedBlockingQueue 作为线程池的工作队列（队列的容量为 Integer.MAX_VALUE）。

> SingleThreadExecutor 使用无界队列作为工作队列对线程池带来的影响与 FixedThreadPool 相同。

#### 优缺点
- 优点是适用于在逻辑上需要单线程处理任务的场景，最大并行运行线程数量固定为1
- 优点是能够保证所有的任务都被执行，永远不会拒绝新的任务
- 缺点是队列数量没有限制，在任务执行时间无限延长的这种极端情况下会造成内存问题

### CachedThreadPool
CachedThreadPool 是一个会根据需要创建新线程的线程池。Executors 提供的静态创建方法如下：
```java
    public static ExecutorService newCachedThreadPool() {
        return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                      60L, TimeUnit.SECONDS,
                                      new SynchronousQueue<Runnable>());
    }
```
#### 参数设置及影响说明
- corePoolSize 被设置为 0，即 corePool 为空；
- maximumPoolSize 被设置为 Integer.MAX_VALUE，即 maximumPool 是无界的。
- keepAliveTime 设置为 60L，意味着 CachedThreadPool 中的空闲线程等待新任务的最长时间为 60 秒，空闲线程超过 60 秒后将会被 终止。
- SynchronousQueue 是一个没有容量的阻塞队列。每个插入操作必须等待另一个线程的对应移除操作，反之亦然。
- CachedThreadPool 使用 SynchronousQueue，把主线程提交的任务传递给空闲线程执行。

> FixedThreadPool 和 SingleThreadExecutor 使用无界队列 LinkedBlockingQueue 作为线程池的工作队列。   
> CachedThreadPool 使用没有容量的 SynchronousQueue 作为线程池的工作队列，但 CachedThreadPool 的 maximumPool 是无界的。
> 这意味着，如果主线程提交任务的速度高于 maximumPool 中线程处理任务的速度时，CachedThreadPool 会不断创建新线程。极端情况下，CachedThreadPool 会因为创建过多线程而耗尽 CPU 和内存资源。

#### 优缺点
- 优点是多任务并行运行，最大并行运行线程数量是不固定的，随着新任务到达可持续创建新的线程
- 优点是能够保证所有的任务都被执行，永远不会拒绝新的任务
- 缺点是极端情况下，处理速度小于任务提交速度时，会因为创建过多线程而耗尽 CPU 和内存资源

## ScheduledThreadPoolExecutor 详解
ScheduledThreadPoolExecutor 继承自 ThreadPoolExecutor。它主要用来在给定的延迟之后运行任务，或者定期执行任务。
>ScheduledThreadPoolExecutor 的功能与 Timer 类似，但 ScheduledThreadPoolExecutor 功能更强大、更灵活。Timer 对应的是单个后台线程，而 ScheduledThreadPoolExecutor 可以在构造函数中指定多个对应的后台线程数。

Executors 提供的静态创建方法如下：
```java
    public ScheduledThreadPoolExecutor(int corePoolSize) {
        super(corePoolSize, Integer.MAX_VALUE, 
              0, NANOSECONDS,
              new DelayedWorkQueue());
    }
```
DelayQueue 是一个无界队列，所以 maximumPoolSize 在 ScheduledThreadPoolExecutor 中没有什么意义（设置 maximumPoolSize 的大小没有什么效果）。 

ScheduledThreadPoolExecutor 的执行主要分为两大部分:
1. 当调用 scheduleAtFixedRate 方法或者 scheduleWithFixedDelay 方法时，会向 DelayQueue 添加一个实现了 RunnableScheduledFuture 接口的 ScheduledFutureTask。
2. 线程池中的线程从 DelayQueue 中获取 ScheduledFutureTask，然后执行任务。

### ScheduledThreadPoolExecutor 如何获取执行任务
ScheduledFutureTask 主要包含 3 个成员变量，如下：
- long 型成员变量 time，表示这个任务将要被执行的具体时间。 
- long 型成员变量 sequenceNumber，表示这个任务被添加到 ScheduledThreadPoolExecutor 中的序号。
- long 型成员变量 period，表示任务执行的间隔周期。 

DelayQueue 封装了一个 PriorityQueue，这个 PriorityQueue 会对队列中的 ScheduledFutureTask 进行排序。
排序时，time 小的排在前面（时间早的任务将被先执行）。
如果两个 ScheduledFutureTask 的 time 相同，就比较 sequenceNumber，sequenceNumber 小的排在前面（也就是说，如果两个任务的执行时间相同，那么先提交的任务将被先执行）

### ScheduledThreadPoolExecutor 与 ThreadPoolExecutor 比较
ScheduledThreadPoolExecutor 为了实现周期性的执行任务，对 ThreadPoolExecutor 做了如下的修改。
- 使用 DelayQueue 作为任务队列。
- 获取任务的方式不同。
- 执行周期任务后，增加了额外的处理。

## FutureTask 详解
### FutureTask 的状态转换
```java
    private static final int NEW          = 0;//新建
    private static final int COMPLETING   = 1;//完成
    private static final int NORMAL       = 2;//正常
    private static final int EXCEPTIONAL  = 3;//异常
    private static final int CANCELLED    = 4;//取消
    private static final int INTERRUPTING = 5;//中断中
    private static final int INTERRUPTED  = 6;//中断
```
可能的状态转换:
* 新建-> 完成-> 正常
* 新建-> 完成-> 异常
* 新建-> 取消
* 新建-> 中断中-> 中断

### FutureTask 的实现
#### FutureTask.get 方法执行过程
```java
public V get() throws InterruptedException, ExecutionException {
     int s = state;
     if (s <= COMPLETING)
         s = awaitDone(false, 0L);
     return report(s);
}

private int awaitDone(boolean timed, long nanos)
        throws InterruptedException {
    // 计算等待截止时间
    final long deadline = timed ? System.nanoTime() + nanos : 0L;
    WaitNode q = null;
    boolean queued = false;
    for (;;) {
        // 1. 判断阻塞线程是否被中断,如果被中断则在等待队
        // 列中删除该节点并抛出 InterruptedException 异常
        if (Thread.interrupted()) {
            removeWaiter(q);
            throw new InterruptedException();
        }
 
        // 2. 获取当前状态，如果状态大于 COMPLETING
        // 说明任务已经结束 (要么正常结束，要么异常结束，要么被取消)
        // 则把 thread 显示置空，并返回结果
        int s = state;
        if (s > COMPLETING) {
            if (q != null)
                q.thread = null;
            return s;
        }
        // 3. 如果状态处于中间状态 COMPLETING
        // 表示任务已经结束但是任务执行线程还没来得及给 outcome 赋值
        // 这个时候让出执行权让其他线程优先执行
        else if (s == COMPLETING) // cannot time out yet
            Thread.yield();
        // 4. 如果等待节点为空，则构造一个等待节点
        else if (q == null)
            q = new WaitNode();
        // 5. 如果还没有入队列，则把当前节点加入 waiters 首节点并替换原来 waiters
        else if (!queued)
            queued = UNSAFE.compareAndSwapObject(this, waitersOffset,
                    q.next = waiters, q);
        else if (timed) {
            // 如果需要等待特定时间，则先计算要等待的时间
            // 如果已经超时，则删除对应节点并返回对应的状态
            nanos = deadline - System.nanoTime();
            if (nanos <= 0L) {
                removeWaiter(q);
                return state;
            }
            // 6. 阻塞等待特定时间
            LockSupport.parkNanos(this, nanos);
        }
        else
            // 6. 阻塞等待直到被其他线程唤醒
            LockSupport.park(this);
    }
}
```
get 方法源码解析：
- 判断任务当前的 state <= COMPLETING 是否成立。前面分析过，COMPLETING 状态是任务是否执行完成的临界状态。
- 如果成立，表明任务还没有结束 (这里的结束包括任务正常执行完毕，任务执行异常，任务被取消)，则会调用 awaitDone 进行阻塞等待。
- 如果不成立表明任务已经结束，调用 report 返回结果。

awaitDone 方法源码解析：
awaitDone 中有个死循环，每一次循环都会：
1. 判断调用 get 的线程是否被其他线程中断，如果是的话则在等待队列中删除对应节点然后抛出 InterruptedException 异常。
2. 获取任务当前状态，如果当前任务状态大于 COMPLETING 则表示任务执行完成，则把 thread 字段置 null 并返回结果。
3. 如果任务处于 COMPLETING 状态，则表示任务已经处理完成 (正常执行完成或者执行出现异常)，但是执行结果或者异常原因还没有保存到 outcome 字段中。这个时候调用线程让出执行权让其他线程优先执行。
4. 如果等待节点为空，则构造一个等待节点 WaitNode。
5. 如果第四步中新建的节点还没如队列，则 CAS 的把该节点加入 waiters 队列的首节点。
6. 阻塞等待。


假设当前 state=NEW 且 waiters 为 NULL,也就是说还没有任何一个线程调用 get 获取执行结果，这个时候有两个线程 threadA 和 threadB 先后调用 get 来获取执行结果。再假设这两个线程在加入阻塞队列进行阻塞等待之前任务都没有执行完成且 threadA 和 threadB 都没有被中断的情况下 (因为如果 threadA 和 threadB 在进行阻塞等待结果之前任务就执行完成或线程本身被中断的话，awaitDone 就执行结束返回了)，执行过程是这样的，以 threadA 为例:

- 第一轮 for 循环，执行的逻辑是 q == null,所以这时候会新建一个节点 q。第一轮循环结束。
- 第二轮 for 循环，执行的逻辑是!queue，这个时候会把第一轮循环中生成的节点的 next 指针指向 waiters，然后 CAS 的把节点 q 替换 waiters。也就是把新生成的节点添加到 waiters 链表的首节点。如果替换成功，queued=true。第二轮循环结束。
- 第三轮 for 循环，进行阻塞等待。要么阻塞特定时间，要么一直阻塞知道被其他线程唤醒。

#### FutureTask.run 方法执行过程 
```java
public void run() {
    // 1. 状态如果不是 NEW，说明任务或者已经执行过，或者已经被取消，直接返回
    // 2. 状态如果是 NEW，则尝试把当前执行线程保存在 runner 字段中
    // 如果赋值失败则直接返回
    if (state != NEW ||
        !UNSAFE.compareAndSwapObject(this, runnerOffset,
                                     null, Thread.currentThread()))
        return;
    try {
        Callable<V> c = callable;
        if (c != null && state == NEW) {
            V result;
            boolean ran;
            try {
                // 3. 执行任务
                result = c.call();
                ran = true;
            } catch (Throwable ex) {
                result = null;
                ran = false;
                // 4. 任务异常
                setException(ex);
            }
            if (ran)
                // 4. 任务正常执行完毕
                set(result);
        }
    } finally {
        // runner must be non-null until state is settled to
        // prevent concurrent calls to run()
        runner = null;
        // state must be re-read after nulling runner to prevent
        // leaked interrupts
        int s = state;
        // 5. 如果任务被中断，执行中断处理
        if (s >= INTERRUPTING)
            handlePossibleCancellationInterrupt(s);
    }
}
```
1. 判断当前任务的 state 是否等于 NEW,如果不为 NEW 则说明任务或者已经执行过，或者已经被取消，直接返回。
2. 如果状态为 NEW 则接着会通过 unsafe 类把任务执行线程引用 CAS 的保存在 runner 字段中，如果保存失败，则直接返回。
3. 执行任务。
4. 如果任务执行发生异常，则调用 setException 方法保存异常信息
## 总结思考
- Executor 是什么，实现类有什么
- Executor 如何创建？
- Executors 静态方法提供的线程池类型有哪些，默认参数是什么？
- 支持定期或周期任务和一般的 Executor 有什么区别？
- ScheduledThreadPoolExecutor 如何获取待执行的任务？
- FutureTask 的运行、取消、获取操作实现原理
## 参考
- 并发编程的艺术
- [FutureTask 源码解析 ](https://www.cnblogs.com/linghu-java/p/8991824.html)