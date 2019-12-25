> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程](https://review-notes.top/language/java-concurrency/)

[[toc]]
## 为什么要设计 Lock 接口
锁是用来控制多个线程访问共享资源的方式，一般来说，一个锁能够防止多个线程同时访问共享资源 (但是有些锁可以允许多个线程并发的访问共享资源，比如读写锁)。

在 Lock 接口出现之前，Java 程序是靠 synchronized 关键字实现锁功能的，而 Java SE 5 之后，并发包中新增了 Lock 接口 (以及相关实现类) 用来实现锁功能，它提供了与 synchronized 关键字类似的同步功能，
只是在使用时需要显式地获取和释放锁。虽然它缺少了 (通过 synchronized 块或者方法所提供的) 隐式获取释放锁的便捷性，但是却拥有了锁获取与释放的可操作性、可中断的获取锁以及超时获取锁等多种 synchronized 关键字所不具备的同步特性。

使用 synchronized 关键字将会隐式地获取锁，但是它将锁的获取和释放固化了，也就是先获取再释放。当然，这种方式简化了同步的管理，可是扩展性没有显示的锁获取和释放来的好。


例如，针对一个场景，手把手进行锁获取和释放，先获得锁 A，然后再获取锁 B，当锁 B 获得后，释放锁 A 同时获取锁 C，当锁 C 获得后，再释放 B 同时获取锁 D，以此类推。这种场景下，synchronized 关键字就不那么容易实现了，而使用 Lock 却容易许多。

> 有关并发关键字及锁的比较参考前面文章《并发操作比较（CAS、volatile、synchronized、Lock）》，有关锁的内存语义参考前面文章《锁的内存语义》

## 如何使用 Lock
- 不要将获取锁的过程写在 try 块中，因为如果在获取锁 (自定义锁的实现) 时发生了异常，异常抛出的同时，也会导致锁无故释放。
- 在 finally 块中释放锁，目的是保证在获取到锁之后，最终能够被释放。


正确的使用方式：
```java
Lock lock = new ReentrantLock();
lock.lock();
try {
 // 业务逻辑处理
} finally {
  lock.unlock();
}
```

## Lock 的 API 说明
```java
public interface Lock {

    // 阻塞地获取锁，直到获取到锁才返回，而且是不可中断的。
    void lock();

    // 可中断地获取锁，与 lock() 方法的不同之处，在于该方法在阻塞等待锁的过程中会响应中断。
    void lockInterruptibly() throws InterruptedException;

    // 尝试非阻塞地获取锁，即调用该方法后，立刻返回，成功获取锁，返回 true，失败则返回 false。
    boolean tryLock();
    
    // 可中断的超时获取锁，在以下 3 种情况下会返回：
    // 1. 当前线程在指定时间内获得了锁；
    // 2. 当前线程在指定时间内被中断；
    // 3. 指定时间结束（超时结束），返回 false；
    boolean tryLock(long time, TimeUnit unit) throws InterruptedException;
    
    // 释放锁
    void unlock();

    // 等待通知组件，当前线程只有获得了锁，才能调用该组件的 wait() 方法，调用后，线程将会释放锁
    Condition newCondition();
}
```
## Lock 接口的实现及依赖

<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/类图关系-Lock.png">
</div>

图例：
- +红色线表示内部类
- 绿色虚线表示接口实现关系
- 蓝色实线表示类继承关系

***
Lock 接口的实现类主要有：
- 重入锁（ReentrantLock）
- 读锁（ReadLock）
- 写锁（WriteLock）

Lock 接口的实现基本都是通过聚合了一个同步器（AbstractQueuedSynchronizer 缩写为 AQS）的子类来完成线程访问控制的。《并发编程-锁》中我们逐个分析上图中的内容。