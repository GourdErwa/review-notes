> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程 ](https://review-notes.top/language/java-concurrency/)

[toc]
## CountDownLatch 是什么
CountDownLatch 允许一个或多个线程等待其他线程完成操作。

## CountDownLatch 如何使用
- CountDownLatch 的构造方法需要传入一个计数值，计数值即需要等待的线程数量。
- 任务封装为线程模式异步运行，每个任务完成后调用 countDown 方法（计数值 -1）
- 调用 await 方法，当前线程进入等待状态
- 计数值为 0 时，将从 await 方法返回，继续执行后续逻辑


我们模拟一个方法，可以解析 excel 工作簿 ，每个工作簿解析由单独线程完成，全部完成后返回执行结果，伪代码如下：
```java
public class CountDownLatchExample {
    // 线程池
    private final ExecutorService executor = Executors.newFixedThreadPool(2);

    //  解析 excel 工作簿，sheets 为多个工作簿
    public boolean resolveExcel(List<Object> sheets) {

        // 每个工作簿解析为一个计数
        final CountDownLatch latch = new CountDownLatch(sheets.size());

        // 每个工作簿封装为一个工作线程提交到线程池，完成后计数 -1
        sheets.forEach(o ->
            executor.submit(() -> {
                log.info("解析工作簿... {}", o);
                latch.countDown(); // 完成后计数 -1
            }));

        try {
            return latch.await(2, TimeUnit.MINUTES); // 等待 2 min
        } catch (InterruptedException e) {
            log.warn("解析超时，当前计数[{}]", latch.getCount());
        }
        return false;
    }
}
```

## CountDownLatch 实现原理
部分关键源码解读，需要 AbstractQueuedSynchronizer（AQS） 基础知识：
```java
public class CountDownLatch {
    // 基于 AQS 实现的共享式同步状态相关操作
    private static final class Sync extends AbstractQueuedSynchronizer

    // 创建 CountDownLatch ，需指定计数器
    public CountDownLatch(int count)
    
    // 进入等待状态。
    // 共享式的获取同步状态，响应中断
    public void await() throws InterruptedException
    
    // 进入等待状态，在 await 基础上支持超时等待。
    public boolean await(long timeout, TimeUnit unit) throws InterruptedException 
    
    // 当前计数 -1 ，底层表现为，同步状态值 -1 
    public void countDown()

    // 获取当前计数结果 ，底层表现为，当前同步状态值
    public long getCount()
}
```

主要逻辑为：
- 初始化一个共享式锁，初始化时同步状态设置为计数值 N（理解为：初始化后已经被 N 个线程持有锁了）
- 调用 wait 方法后，当前线程进入等待状态，等待同步状态为 0 时获取锁
- 每个线程完成后调用 countDown 方法，即同步状态 -1
- 所有线程完成后，同步状态为 0，wait 方法所在线程获取锁继续执行

## CountDownLatch 和 join 的区别
join 用于让当前执行线程等待 join 线程执行结束。其实现原理是不停检查 join 线程是否存活，如果 join 线程存活则让当前线程永远等待。

- 调用 join 方法需要等待 thread 执行完毕才能继续向下执行
- CountDownLatch 只需要检查计数器的值为零就可以继续向下执行

相比之下，CountDownLatch 更加灵活一些，可以实现一些更加复杂的业务场景。

## 应用场景
- 需要等待多个线程*完成后继续执行*的场景。


