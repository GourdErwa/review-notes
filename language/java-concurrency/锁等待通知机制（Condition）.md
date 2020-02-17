> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程 ](https://review-notes.top/language/java-concurrency/)

[toc]
## Condition 是什么
Condition 定义了等待/通知两种类型的方法，当前线程调用这些方法时，需要提前获取到 Condition 对象关联的锁。

Condition 对象是由 Lock 对象 (调用 Lock 对象的 newCondition() 方法) 创建出来的，Condition 是依赖 Lock 对象的。

## Condition 提供方法说明
```java
public interface Condition {

    // 当前线程进入等待。
    // 其他线程调用该 Condition 的 signal/signalAll 方法是被唤醒
    // 其他线程调用 interrupt 方法中断当前线程
    // 如果当前等待线程从 await 返回，表示该线程已经获取了 Condition 对象所在的锁
    void await() throws InterruptedException;
    
    // 在 await 方法基础上取消了响应中断的处理
    void awaitUninterruptibly();
    
    // 在 await 方法基础上支持超时返回
    long awaitNanos(long nanosTimeout) throws InterruptedException;
    
    // 在 await 方法基础上支持超时返回
    boolean await(long time, TimeUnit unit) throws InterruptedException;
    
    // 在 await 方法基础上支持超过截止时间返回
    boolean awaitUntil(Date deadline) throws InterruptedException;


    // 唤醒一个等待在 Condition 上的线程，该线程从等待方法返回前必须获得与 Condition 相关联的锁
    void signal();
    
    // 唤醒所有等待在 Condition 上的线程，能够从等待方法返回的线程必须获得与 Condition 相关联的锁
    void signalAll();
}
```
## Condition 实现分析

### Condition 实现分析-等待队列
- 同步队列：同步队列是 AQS 中等待获取同步状态的队列。请阅读参考《锁-AbstractQueuedSynchronizer 介绍》及原理两篇内容。
- 等待队列：等待队列是一个 FIFO 的队列，在队列中的每个节点都包含了一个线程引用，该线程就是在 Condition 对象上等待的线程。


Condition 拥有首尾节点的引用，而新增节点只需要将原有的尾节点 nextWaiter 指向它，并且更新尾节点即可。
如果一个线程调用了 Condition.await 方法，那么该线程将会释放锁、构造成节点加入等待队列并进入等待状态。

上述节点引用更新的过程并没有使用 CAS 保证，原因在于调用 await 方法的线程必定是获取了锁的线程，也就是说该过程是由锁来保证线程安全的。

```java
    public class ConditionObject implements Condition, java.io.Serializable {
        /** 首节点. */
        private transient Node firstWaiter;
        /** 尾节点. */
        private transient Node lastWaiter;
        ...
    }
```

与监视器（wait/notify）的队列区别：
- 在 Object 的监视器（wait/notify）模型上，一个对象拥有一个同步队列和等待队列
- 并发包中的 Lock(确切地说是同步器 AQS) 拥有一个同步队列和多个等待队列

### Condition 实现分析-等待
调用 Condition 的 await 方法 (或以 await 开头的方法)，会使当前线程进入等待队列并释放锁，同时线程状态变为等待状态。  
当从 await 方法返回时，当前线程一定获取了 Condition 相关联的锁。

如果从队列的角度看 await 方法，当调用 await 方法时，相当于同步队列的首节点 (获取了锁的节点) 移动到 Condition 的等待队列中。

```java
    public final void await() throws InterruptedException {
        if (Thread.interrupted())
            throw new InterruptedException();
        Node node = addConditionWaiter(); // 当前线程加入等待队列
        int savedState = fullyRelease(node); // 释放同步状态，也就是释放锁
        int interruptMode = 0;
        while (!isOnSyncQueue(node)) {
            LockSupport.park(this); // 进入等待状态
            if ((interruptMode = checkInterruptWhileWaiting(node)) != 0)
                break;
        }

        // 唤醒节点的线程开始尝试获取同步状态
        if (acquireQueued(node, savedState) && interruptMode != THROW_IE)
            interruptMode = REINTERRUPT;
        if (node.nextWaiter != null) // clean up if cancelled
            unlinkCancelledWaiters();
        if (interruptMode != 0)
            reportInterruptAfterWait(interruptMode);
    }
```
主要逻辑为：
- 调用 await 方法的线程已经成功获取了锁的线程，也就是同步队列中的首节点。
- 该方法会将当前线程构造成节点并加入等待队列中，然后释放同步状态，唤醒同步队列中的后继节点，然后当前线程会进入等待状态。
- 当等待队列中的节点被唤醒，则唤醒节点的线程开始尝试获取同步状态。
- 如果不是通过其他线程调用 Condition.signal 方法唤醒，而是对等待线程进行中断，则会抛出 InterruptedException。

### Condition 实现分析-通知
调用 Condition 的 signal 方法，将会唤醒在等待队列中等待时间最长的节点 (首节点)，在唤醒节点之前，会将节点移到同步队列中。
```java
    public final void signal() {
        if (!isHeldExclusively()) //  当前线程必须是获取了锁的线程
           throw new IllegalMonitorStateException();
        Node first = firstWaiter; // 获取等待队列的首节点
        if (first != null)
            doSignal(first);
    }

    private void doSignal(Node first) {
        do {
            if ((firstWaiter = first.nextWaiter) == null)
                lastWaiter = null;
            first.nextWaiter = null;
        } while (!transferForSignal(first) &&
            (first = firstWaiter) != null);
    }    
    
    final boolean transferForSignal(Node node) {
        if (!node.compareAndSetWaitStatus(Node.CONDITION, 0))
            return false;

        Node p = enq(node); // 等待队列中的头节点线程安全地移动到同步队列
        int ws = p.waitStatus;
        if (ws > 0 || !p.compareAndSetWaitStatus(ws, Node.SIGNAL)) // 节点状态更改为待唤醒状态
            LockSupport.unpark(node.thread); // 唤醒节点
        return true;
    }    
```
主要逻辑为：
- 调用 signal 方法条件是当前线程必须获取了锁，因此做了 isHeldExclusively 检查。
- 调用同步器的 enq 方法，等待队列中的头节点线程安全地移动到同步队列。
- 当节点移动到同步队列后，当前线程再使用 LockSupport 唤醒该节点的线程。
- 被唤醒后的线程，将从 await 方法中的 while 循环中退出（isOnSyncQueue 方法返回 true，节点已经在同步队列中)，进而调用同步器的 acquireQueued 方法加入到获取同步状态的竞争中。
- 成功获取同步状态 (或者说锁) 之后，被唤醒的线程将从先前调用的 await 方法返回后继续执行后续的代码。

> Condition 的 signalAll 方法，相当于对等待队列中的每个节点均执行一次 signal 方法，效果就是将等待队列中所有节点全部移动到同步队列中，并唤醒每个节点的线程。

### 实现总结
正常情况下，一块并发执行的代码，某个线程拿到锁后开始执行，全部执行完成后释放锁。如果没有等待通知机制我们只能中断线程来让他退出，但是中断的条件比较难以判断。而且中断后，剩余的逻辑无法执行。

类似于（wait/notify）的经典范式。锁机制聚合实现 AQS 提供了 Condition 条件，我们可以像（wait/notify）机制一样，在某个条件下等待，条件满足后唤醒，线程之间就可以通信交流了。

## 总结思考
- 为什么要设计 Condition，Object 的监视器（wait/notify）不能直接用在 Lock 上吗 ？  
    - wait/notify 通过配合 synchronized 的 Monitor 对象实现同步队列等待队列的操作。
    - Condition 通过 AQS 内部实现的同步队列等待队列的操作。

- 一个 Lock 返回多个 Condition 有什么用（lock.newCondition 每次创建一个 Condition 实例）？  
    - 多个 Condition 条件可以互相配合执行，我们把每个条件抽象为一个等待队列，这些等待队列什么时候加入同步队列是由其他的条件决定的。
    - e.g. 生产和消费是两个条件，生产力过剩时，生产需要等待，生产完成后通知消费者继续消费。消费品为空时，消费需要等待，消费完成后通知生产者继续生产。

- [Condition/ReentrantLock 实现的多生产者消费者](https://github.com/GourdErwa/java-advanced/blob/master/java-concurrency/src/main/java/io/gourd/java/concurrency/app/pc/ConditionReentrantLock.java)
## 参考
- 有关线程等待操作相关操作区别，参考本专栏《线程等待操作（sleep、wait、park、Condition）区别》
- 并发编程的艺术