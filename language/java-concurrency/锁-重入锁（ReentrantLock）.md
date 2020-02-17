> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程](https://review-notes.top/language/java-concurrency/)

[toc]
## 重入锁-ReentrantLock
重入锁 ReentrantLock，就是支持重进入的锁，它表示该锁能够支持一个线程对资源的重复加锁（排他锁）。除此之外，该锁的还支持获取锁时的公平和非公平性选择。

ReentrantLock 虽然没能像 synchronized 关键字一样*支持隐式的重进入*，但是在调用 lock 方法时，已经获取到锁的线程，能够再次调用 lock 方法获取锁而不被阻塞。

## 公平和非公平选择
这里提到一个锁获取的公平性问题，如果在绝对时间上，先对锁进行获取的请求一定先被满足，那么这个锁是公平的，反之，是不公平的。

公平的获取锁，也就是等待时间最长的线程最优先获取锁，也可以说锁获取是顺序的。
ReentrantLock 提供了一个构造函数，能够控制锁是否是公平的。

## 重入机制需要解决的问题
重进入是指任意线程在获取到锁之后能够再次获取该锁而不会被锁所阻塞，该特性的实现需要解决以下两个问题：
1. 线程再次获取锁。锁需要去识别获取锁的线程是否为当前占据锁的线程，如果是，则再次成功获取。
2. 锁的最终释放。线程重复 n 次获取了锁，随后在第 n 次释放该锁后，其他线程能够获取到该锁。


在代码层面，锁的最终释放要求锁：
- 锁被获取是，计数自增，计数表示当前锁被重复获取的次数；
- 锁被释放时，计数自减，当计数等于 0 时表示锁已经成功释放。

## 如何使用？
以下代码演示一个非公平锁对 value 的并发操作
```java
@Slf4j
public class ReentrantLockExample {
    int value = 0;
    private final ReentrantLock lock = new ReentrantLock(false);

    public void writer() {
        lock.lock();        // 获取锁
        try {
            //value++;
            lock.lock(); // 再次获取锁(重入)
            try {
                value++;
                log.info("当前线程持有锁数 = {}", lock.getHoldCount()); // 2
            } finally {
                lock.unlock();  // 释放锁
            }
        } finally {
            lock.unlock();  // 再次释放锁
        }
    }
}
```

## 实现机制分析
因为 ReentrantLock 支持公平与非公平选择，内部实现机制为：
- 内部基于 AbstractQueuedSynchronizer（AQS）实现一个公平与非公平公共的父类 Sync ，用于管理同步状态
- FairSync 继承 Sync 用于处理公平问题
- NonfairSync 继承 Sync 用于处理非公平问题

具体代码相关分析参考《锁的内存语义》一节内容，此处不做重复分析，在了解了 AQS 原理的基础上更容易分析该锁的执行机制。

公平和非公平实现主要的区别在于公平锁加锁时调用 hasQueuedPredecessors 方法取出等待队列的前驱节点。

## 优缺点
事实上，公平的锁机制往往没有非公平的效率高，但是，并不是任何场景都是以 TPS 作为唯一的指标。

- 公平锁能够减少“饥饿”发生的概率，等待越久的请求越是能够得到优先满足。
- 非公平性锁虽然可能造成线程“饥饿”，但极少的线程切换，保证了其更大的吞吐量。

## 使用场景
> 如果在 synchronized 关键字不能满足的需求上我们考虑使用 Lock，相关比较参考或者回忆文章《并发操作比较（CAS、volatile、synchronized、Lock）》内容

此处直接简要对比 synchronized 、ReentrantLock 即可分析使用场景。

实际代码逻辑中是否需要中断、状态感知、锁独特的功能判断。
- 锁中断操作
    - synchronized：不支持中断操作
    - ReentrantLock：支持中断，支持超时中断

- 锁功能性
    - synchronized：独占锁、可重入锁
    - ReentrantLock：可重入锁、公平非公平选择 ...

- 锁状态感知
    - synchronized：无法判断是否拿到锁
    - ReentrantLock：可以判断是否拿到锁

> 比如一个需要并发的类有多个加锁的方法，方法直接互相调用，如果非重入锁，那每次调用时都需要竞争锁