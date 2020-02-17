> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程 ](https://review-notes.top/language/java-concurrency/)

[toc]
## Fork/Join 框架是什么
是 Java 7 提供的一个用于并行执行任务的框架，是一个把大任务分割成若干个小任务，最终汇总每个小任务结果后得到大任务结果的框架。

- Fork 就是把一个大任务切分为若干子任务并行的执行。
- Join 就是合并这些子任务的执行结果，最后得到这个大任务的结果。

Fork/Join 框架根据工作窃取算法设计，那么什么是工作窃取算法呢？

### 工作窃取算法介绍
工作窃取算法（work-stealing）是指某个线程从其他队列里窃取任务来执行。

#### 为什么需要使用工作窃取算法呢?
假如我们有若干线程一起计算，可能有效线程的计算早早结束，结束的线程与其等着，不如去帮其他线程干活，于是它就去其他线程的队列里窃取一个任务来执行。
而在这时它们会访问同一个队列，所以为了减少窃取任务线程和被窃取任务线程之间的竞争，通常会使用双端队列维护：
- 被窃取任务线程永远从双端队列的头部拿任务执行。
- 窃取任务的线程永远从双端队列的尾部拿任务执行。

#### 优缺点：
- 优点：充分利用线程进行并行计算，减少了线程间的竞争。
- 缺点：在某些情况下还是存在竞争，比如双端队列里只有一个任务时。并且该算法会消耗了更多的系统资源，比如创建多个线程和多个双端队列。

## Fork/Join 框架的设计

- Fork，分割任务。首先我们需要有一个 fork 类来把大任务分割成子任务，有可能子任务还是很大，所以还需要不停地分割，直到分割出的子任务足够小。抽象类 ForkJoinTask 提供了 2 个子抽象类：
    - RecursiveAction：用于没有返回结果的任务。
    - RecursiveTask：用于有返回结果的任务。

- Join，执行任务并合并结果。分割的子任务分别放在双端队列里，然后几个启动线程分别从双端队列里获取任务执行。子任务执行完的结果都统一放在一个队列里，启动一个线程从队列里拿数据，然后合并这些数据。
    - ForkJoinPool：ForkJoinTask 需要通过 ForkJoinPool 来执行。

## Fork/Join 框架实现原理
#### Fork 处理逻辑
- 如果当前线程是 ForkJoinWorkerThread 类型的线程则任务提交到依赖的 ForkJoinPool 中执行
- 否则使用一个静态公用的 ForkJoinPool 执行
- 提交过程为：把当前任务存放在 ForkJoinTask 数组队列里。然后再调用 ForkJoinPool 的 signalWork 方法唤醒或创建一个工作线程来执行任务。

方法源码参考：
```java
    // ForkJoinTask.ForkJoinTask 方法
    public final ForkJoinTask<V> fork() {
        Thread t;
        if ((t = Thread.currentThread()) instanceof ForkJoinWorkerThread)
            ((ForkJoinWorkerThread)t).workQueue.push(this);
        else
            ForkJoinPool.common.externalPush(this);
        return this;
    }

    // WorkQueue.push 方法
    final void push(ForkJoinTask<?> task) {
        ForkJoinTask<?>[] a; ForkJoinPool p;
        int b = base, s = top, n;
        if ((a = array) != null) {    // ignore if queue removed
            int m = a.length - 1;     // fenced write for task visibility
            U.putOrderedObject(a, ((m & s) << ASHIFT) + ABASE, task);
            U.putOrderedInt(this, QTOP, s + 1);
            if ((n = s - b) <= 1) {
                if ((p = pool) != null)
                    p.signalWork(p.workQueues, this);
            }
            else if (n >= m)
                growArray();
        }
    }    
```

#### Join 处理逻辑
任务状态有 4 种:已完成 (NORMAL)、被取消 (CANCELLED)、信号 (SIGNAL) 和出现异常 (EXCEPTIONAL)。

- 调用 doJoin 方法，得到当前任务的状态来判断返回什么结果
- 如果任务状态是已完成，则直接返回任务结果。
- 如果任务状态是被取消，则直接抛出 CancellationException。
- 如果任务状态是抛出异常，则直接抛出对应的异常。
- 在 doJoin 方法里，首先通过查看任务的状态，看任务是否已经执行完成。
    - 如果执行完成，则直接返回任务状态;
    - 如果没有执行完，则从任务数组里取出任务并执行。
         - 如果任务顺利执行完成，则设置任务状态为 NORMAL，
         - 如果出现异常，则记录异常，并将任务状态设置为 EXCEPTIONAL。

ForkJoinTask.join/doJoin 方法源码参考：
```java
    public final V join() {
        int s;
        if ((s = doJoin() & DONE_MASK) != NORMAL)
            reportException(s);
        return getRawResult();
    }

    private int doJoin() {
        int s; Thread t; ForkJoinWorkerThread wt; ForkJoinPool.WorkQueue w;
        return (s = status) < 0 ? s :
            ((t = Thread.currentThread()) instanceof ForkJoinWorkerThread) ?
            (w = (wt = (ForkJoinWorkerThread)t).workQueue).
            tryUnpush(this) && (s = doExec()) < 0 ? s :
            wt.pool.awaitJoin(w, this, 0L) :
            externalAwaitDone();
    }    
```

## Fork/Join 框架代码实战
实战内容为：计算 1+2+3+...+100，如果加数之间差值大于等于 10 则拆分为子任务

```java
@Slf4j
@Getter
@AllArgsConstructor
public class ForkJoinExample extends RecursiveTask<Integer> {

    private static final int THRESHOLD = 10;  // 阈值
    private int start;
    private int end;

    @Override
    protected Integer compute() {
        int sum = 0;
        boolean canCompute = (end - start) <= THRESHOLD;
        if (canCompute) {
            for (int i = start; i <= end; i++) {
                sum += i;
            }
        } else {
            // 如果任务大于阈值，就分裂成两个子任务计算
            int middle = (start + end) / 2;
            final ForkJoinExample leftTask = new ForkJoinExample(start, middle);
            final ForkJoinExample rightTask = new ForkJoinExample(middle + 1, end);
            leftTask.fork();
            rightTask.fork();

            // 等待子任务执行完，并得到其结果
            int leftResult = leftTask.join();
            int rightResult = rightTask.join();
            // 合并子任务
            sum = leftResult + rightResult;
        }
        return sum;
    }

    public static void main(String[] args) {
        final ForkJoinPool forkJoinPool = new ForkJoinPool();
        // 生成一个计算任务，负责计算
        final ForkJoinExample task = new ForkJoinExample(1, 100);
        // 异步执行一个任务
        final Future<Integer> result = forkJoinPool.submit(task);
        // final Integer r2 = forkJoinPool.invoke(task); // 同步执行
        try {
            log.info("sum = {}", result.get());
        } catch (InterruptedException | ExecutionException ignored) {
        }
    }
}
```

## 应用场景
- 可以采用"分而治之"的算法场景
- 计算密集型的任务
