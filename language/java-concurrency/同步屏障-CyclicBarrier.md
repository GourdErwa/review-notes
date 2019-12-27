> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程 ](https://review-notes.top/language/java-concurrency/)

[[toc]]
## CyclicBarrier 是什么
CyclicBarrier 的字面意思是可循环使用的屏障。主要是让一组线程到达一个"屏障"时被阻塞，直到最后一个线程到达屏障时，屏障才会开门，所有被屏障拦截的线程才会继续运行。

***
我们举一个抽象的例子：
- 有一个密室项目，有 5 个密道的门，每道门默认情况下是密封的
- 有 10 个人参与该项目
- 项目的规定是，找到门后必须等待所有参与的人到齐后，门才可以打开，然后进入下一个密道

该例子中：
- 密道的门即：屏障
- 人到齐后才可以开门进入下一个密道即：到达屏障时，屏障才会开门，所有被屏障拦截的线程才会继续运行

## CyclicBarrier 如何使用
- 构造方法参数说明 `CyclicBarrier(int parties, Runnable barrierAction)`
    - parties 是参与线程的个数
    - 第二个构造方法有一个 Runnable 参数，这个参数的意思是最后一个到达线程要做的任务
- getNumberWaiting 方法可以获得阻塞的线程数量
- isBroken 方法用来了解阻塞的线程是否被中断
- reset 方法用于重置状态

***

下面示例中模拟了 5 道门（屏障），线程的睡眠表示每个人找下一道门花费的时间：
- 以上述抽象例子的密室项目为例：
- 每个人花费一定的时间寻找当前的密道门
- 所有人找到当前密道门时，密道门才打开，进入下一密道
```java
public class CyclicBarrierExample {
    // 线程池
    private final ExecutorService executor = Executors.newFixedThreadPool(5);

    // 密室项目 , people 参与人数
    public void resolveExcel(int people) {

        final CyclicBarrier latch = new CyclicBarrier(people);
        for (int i = 0; i < people; i++) {
            int pName = i;
            executor.submit(() -> {
                log.info("{} , 进入密室...", pName);
                try {
                    latch.await(); // 第一道门

                    // 模拟一个随机时间，作为迷宫的寻找时间
                    Thread.sleep(new Random().nextInt(1000)); 
                    latch.await(); // 第二道门

                    Thread.sleep(new Random().nextInt(1000));
                    latch.await(); // 第三道门

                    Thread.sleep(new Random().nextInt(1000));
                    latch.await(); // 第四道门

                    Thread.sleep(new Random().nextInt(1000));
                    latch.await(); // 第五道门
                } catch (InterruptedException | BrokenBarrierException e) {
                    log.info("等待过程异常");
                }

                log.info("{} , 逃出密室...", pName);
            });
        }
    }
}
```

## CyclicBarrier 实现原理
CyclicBarrier 内部使用 ReentrantLock 与 Condition 维护等待状态，放行状态。
- ReentrantLock 用于正确修改维护等待状态的变量
- Condition 用于线程的等待通知机制实现

主要处理逻辑：
- 调用 await 的线程判断当前等待数量是否等于屏障放行数量
- 如果不可以放行，当前计数-1，当前线程进入等待状态
- 如果可以放行，重置等待相关变量数据，唤醒所有等待的线程
- 如果调用 reset 方法重置后，等待的状态将变为破坏，等待中的线程将抛出 BrokenBarrierException 异常

## 应用场景
- 可以用于多线程计算数据，最后合并计算结果的场景。
- 如果计算发生错误，可以重置计数器，并让线程重新执行一次。

## CyclicBarrier 与 CountDownLatch 区别
- CountDownLatch 计数器是一次性的，CyclicBarrier 计数器是可循环利用的。
- CountDownLatch 参与的线程的职责是不一样的，有的在倒计时（工作的线程），有的在等待倒计时结束（启动工作的线程）。CyclicBarrier 参与的线程职责是一样的。
