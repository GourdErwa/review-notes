> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程](https://review-notes.top/language/java-concurrency/)

[toc]
## 知识点回顾
队列同步器 AbstractQueuedSynchronizer(*以下简称同步器或者 AQS*)。

- 基本概念介绍参考上篇内容《锁-AbstractQueuedSynchronizer 介绍》
- AQS 提供的模板方法基本上分为 3 类:
    - 独占式同步状态获取与释放（下文详细解释实现原理）
    - 共享式同步状态获取与释放（下文详细解释实现原理）
    - 同步状态和查询同步队列中的等待线程情况
- AQS#Node 节点等待状态定义（下文需多次使用该状态值进行说明）
```java
/**
 * 表示节点的状态。其中包含的状态有：
 * CANCELLED，值为 1，表示当前的线程被取消；
 * SIGNAL，   值为-1，表示当前节点的后驱节点包含的线程需要运行，也就是 unpark；
 * CONDITION，值为-2，表示当前节点在等待 condition，也就是在 condition 队列中；
 * PROPAGATE，值为-3，表示当前场景下后续的 acquireShared 能够得以执行；
 * 值为 0，不是以上状态时（新节点入队时的默认状态）
 */
volatile int waitStatus;
```
## 独占式同步状态获取与释放
### 独占式同步状态获取
通过调用同步器的 acquire 方法可以获取同步状态
> 该方法对中断不敏感，也就是由于线程获取同步状态失败后进入同步队列中，后续对线程进行中断操作时，线程不会从同步队列中移出

其主要逻辑是:
- 首先调用自定义同步器实现的 tryAcquire 方法，该方法保证线程安全的获取同步状态
- 如果同步状态获取失败，则构造同步节点并通过 addWaiter 方法将该节点加入到同步队列的尾部
- 最后调用 acquireQueued 方法，使得该节点以“死循环”的方式获取同步状态。
    - 如果获取不到，判断自己是否要进入等待状态，进入等待状态后唤醒主要依靠前驱节点的出队或阻塞线程被中断来实现。
    - 如果获取到，将自己设置为首节点


```java
    public final void acquire(int arg) {
        if (!tryAcquire(arg) &&     // 尝试获取同步状态（自定义重写该方法）
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg)) // 获取同步失败时，构造同步节点加入队列
            selfInterrupt();
        // 独占式 Node.EXCLUSIVE : 同一时刻只能有一个线程成功获取同步状态  
    }

    // 将节点添加至同步队列尾部
    private Node addWaiter(Node mode) { 
        Node node = new Node(mode);

        for (;;) {
            Node oldTail = tail;
            if (oldTail != null) {
                node.setPrevRelaxed(oldTail);
                if (compareAndSetTail(oldTail, node)) { // CAS 方法更新到队列尾部
                    oldTail.next = node;
                    return node;
                }
            } else {
                initializeSyncQueue(); // 初始化同步队列
            }
        }
    }

    final boolean acquireQueued(final Node node, int arg) {
        boolean interrupted = false;
        try {
            for (;;) {
                final Node p = node.predecessor(); // 获取当前节点的前一节点 p
                if (p == head && tryAcquire(arg)) { // 如果是头节点再次尝试获取同步状态
                    setHead(node);
                    p.next = null; // help GC
                    return interrupted;
                }
                // 判断是否可以进入等待状态（前一节点 waitStatus=Node.SIGNAL 时）
                if (shouldParkAfterFailedAcquire(p, node)) 
                    interrupted |= parkAndCheckInterrupt(); // 等待过程是否被中断
            }
        } catch (Throwable t) { // 异常情况下取消获取并做中断处理
            cancelAcquire(node); 
            if (interrupted)
                selfInterrupt();
            throw t;
        }
    }
```

### 独占式同步状态释放
释放同步状态，使得后续节点能 够继续获取同步状态。通过调用同步器的 release 方法可以释放同步状态，该方法在释放了同步状态之后，会唤醒其后驱节点 (使后驱节点重新尝试获取同步状态)

主要逻辑：
- 首先调用自定义同步器实现的 tryRelease 方法进行释放操作
- 如果释放成功尝试唤醒后续节点，唤醒逻辑为：
    - 当前头节点状态重置为 0
    - 依次循环寻找一个有效的节点进行唤醒

```java
    public final boolean release(int arg) {
        if (tryRelease(arg)) { // 自定义释放逻辑
            Node h = head;
            if (h != null && h.waitStatus != 0)
                unparkSuccessor(h); // 唤醒后续节点
            return true;
        }
        return false;
    }

    private void unparkSuccessor(Node node) {
        int ws = node.waitStatus;
        if (ws < 0) // 如果状态小于 0 ，尝试修改为 0
            node.compareAndSetWaitStatus(ws, 0);

        // 获取当前释放节点的后驱节点
        // 如果后驱节点为空或者等待状态>0 时,表示已被取消
        // 从后向前遍历寻找有效的节点进行唤醒。此时，再和 acquireQueued 方法联系起来
        Node s = node.next;
        if (s == null || s.waitStatus > 0) {
            s = null;
            for (Node p = tail; p != node && p != null; p = p.prev)
                if (p.waitStatus <= 0)
                    s = p;
        }
        if (s != null)
            LockSupport.unpark(s.thread); // 唤醒
    }
```
## 共享式同步状态获取与释放
共享式获取与独占式获取最主要的区别在于同一时刻能否有多个线程同时获取到同步状态（可重入锁）。

### 共享式同步状态获取
相对于独占的锁的 tryAcquire 返回 boolean 类型的值，共享锁的 tryAcquireShared 返回的是一个整型值：
- 如果该值小于 0，则代表当前线程获取共享锁失败
- 如果该值大于 0，则代表当前线程获取共享锁成功，并且接下来其他线程尝试获取共享锁的行为很可能成功
- 如果该值等于 0，则代表当前线程获取共享锁成功，但是接下来其他线程尝试获取共享锁的行为会失败

因此，只要该返回值大于等于 0，就表示获取共享锁成功。

```java
    public final void acquireShared(int arg) {
        if (tryAcquireShared(arg) < 0)
            doAcquireShared(arg);
    }

    private void doAcquireShared(int arg) {
        final Node node = addWaiter(Node.SHARED); // 构造一个共享式节点加入等待队列
        boolean interrupted = false;
        try {
        // 共享式获取的自旋过程中
        // 成功获取到同步状态并退出自旋的条件就是 tryAcquireShared 方法返回值大于等于 0
            for (;;) {
                final Node p = node.predecessor();
                if (p == head) {
                    int r = tryAcquireShared(arg);
                    if (r >= 0) { // 返回值大于等于 0 时，表示能够获取到同步状态
                        setHeadAndPropagate(node, r); // 设置头节点并尝试唤醒后驱节点（重点）
                        p.next = null; // help GC
                        return; 
                    }
                }
                if (shouldParkAfterFailedAcquire(p, node))
                    interrupted |= parkAndCheckInterrupt();
            }
        } catch (Throwable t) {
            cancelAcquire(node);
            throw t;
        } finally {
            if (interrupted)
                selfInterrupt();
        }
    }    
```

独占与共享获取同步状态主要差异：

1. 独占锁的 acquireQueued 调用的是 addWaiter(Node.EXCLUSIVE)，而共享锁调用的是 addWaiter(Node.SHARED)
2. 获取锁成功后的行为，对于独占锁而言，是直接调用了 setHead 方法，而共享锁调用的是 setHeadAndPropagate

```java
    private void setHeadAndPropagate(Node node, int propagate) {
        Node h = head; // 记录现在的头节点，后面 if 中重新赋值（处理多线程同时设置头节点情况）
        setHead(node);
        if (propagate > 0 || h == null || h.waitStatus < 0 ||
            (h = head) == null || h.waitStatus < 0) {
            Node s = node.next;
            // 在共享锁模式下，锁可以被多个线程所共同持有，既然当前线程已经拿到共享锁了，
            // 那么就可以直接通知后驱节点来拿锁，而不必等待锁被释放的时候再通知。
            if (s == null || s.isShared())
                doReleaseShared(); // 该方法参考《共享式同步状态释放》中解释
        }
    }
```
### 共享式同步状态释放
共享式释放同步状态之后，将会唤醒后续处于等待状态的节点。  
它和独占式主要区别在于 tryReleaseShared 方法必须确保同步状态线程安全释放，一般是通过循环和 CAS 来保证的，因为释放同步状态的操作会同时来自多个线程。

***
在共享锁模式下，头节点就是持有共享锁的节点，在它释放共享锁后，也应该唤醒它的后驱节点。唤醒方法 doReleaseShared 可能会同一个头节点调用 2 次：
- setHeadAndPropagate 方法中调用
- releaseShared 方法中调用，当前的头节点可能易主了

为什么要调用 2 次？
- 假设有 A/B/C 三个线程依次获取锁，谁拿到锁后同时设置为头节点，所以头节点可能依次为 A/B/C。
- 在多线程共享模式下，A/B 可能同时获取锁。A 拿到锁后，头节点为 A ，此时 B 重入进来拿到锁（A 此时还没释放）本应该头节点为 A 时确成了 B。这时头节点易主了。
- 因此在共享模式下获取锁后设置头节点后，针对当前头节点执行一次唤醒方法。
- 因此在释放过程中会对头节点进行判断，如果头节点被修改了就继续循环判断，执行唤醒方法。

```java
    public final boolean releaseShared(int arg) {
        if (tryReleaseShared(arg)) {
            doReleaseShared();
            return true;
        }
        return false;
    }

    private void doReleaseShared() {
        for (;;) {
            Node h = head;
            if (h != null && h != tail) { // 注意这里说明了队列至少有两个节点（2 个说明有一个可能会被唤醒）
                int ws = h.waitStatus;
                if (ws == Node.SIGNAL) { // 头节点的后驱节点需要被唤醒
                    if (!h.compareAndSetWaitStatus(Node.SIGNAL, 0))
                        continue;            // CAS 修改头节点状态为 0 
                    unparkSuccessor(h);      // 修改成功时进行唤醒操作
                }
                // 如果头节点状态已经是 0 时，尝试修改状态为 PROPAGATE
                // 如果尝试修改失败时说明说明有新的节点入队了，ws 的值被改为了 Node.SIGNAL
                else if (ws == 0 &&
                         !h.compareAndSetWaitStatus(0, Node.PROPAGATE))
                    continue;                
            }
            if (h == head)  // 如果 head 没有被修改跳出循环
                break;
        }
    }
```

## 超时获取同步状态
同步器支持以超时获取同步状态，即在指定的时间段内获取同步状态，如果获取到同步状态则返回 true，否则，返回 false。该方法提供了传统 Java 同步操作 (比如 synchronized 关键字) 所不具备的特性。

支持超时获取方法如下：
```java
// 独占式超时获取同步状态
public final boolean tryAcquireNanos(long arg, long nanosTimeout)
            throws InterruptedException

// 共享式超时获取同步状态  
public final boolean tryAcquireSharedNanos(long arg, long nanosTimeout)
            throws InterruptedException
```
### 响应中断的同步状态获取过程
- 在 Java 5 之前，当一 个线程获取不到锁而被阻塞在 synchronized 之外时，对该线程进行中断操作，此时该线程的中断标志位会被修改，但线程依旧会阻塞在 synchronized 上，等待着获取锁。
- 在 Java 5 中，同步器 提供了 acquireInterruptibly(int arg) 方法，这个方法在等待获取同步状态时，如果当前线程被中断，会立刻返回，并抛出 InterruptedException。

### 以独占式超时获取同步方法说明

针对超时获取，独占式获取同步状态 acquire 在流程上非常相似，其主要区别在于未获取到同步状态时的处理逻辑，在主要需要计算出需要睡眠的时间间隔 nanosTimeout，为了防止过早通知。

处理逻辑主要为：
- nanosTimeout 超时时间
- 超时截止时间 deadline = System.nanoTime() + nanosTimeout;
- for 中每次重新计算超时时间 nanosTimeout = deadline - System.nanoTime();
- 如果当前超时时间 < 1000 时一直自旋，不进入睡眠，否则睡眠超时时间

```java
    private boolean doAcquireNanos(long arg, long nanosTimeout)
            throws InterruptedException {
        if (nanosTimeout <= 0L)
            return false;
        final long deadline = System.nanoTime() + nanosTimeout; // 超时时间戳
        final Node node = addWaiter(Node.EXCLUSIVE);
        try {
            for (;;) {
                final Node p = node.predecessor();
                if (p == head && tryAcquire(arg)) {
                    setHead(node);
                    p.next = null; // help GC
                    return true;
                }
                // 计算需要等待时间（nanoseconds）
                nanosTimeout = deadline - System.nanoTime();
                if (nanosTimeout <= 0L) { // 等待时间 <= 0 表示已经超时，返回 false
                    cancelAcquire(node);
                    return false;
                }
                // 如果超时时间 > 1000L/nanoseconds 不进行睡眠一直循环
                if (shouldParkAfterFailedAcquire(p, node) &&
                    nanosTimeout > SPIN_FOR_TIMEOUT_THRESHOLD)
                    LockSupport.parkNanos(this, nanosTimeout); // 睡眠计算出的等待时间
                if (Thread.interrupted())
                    throw new InterruptedException();
            }
        } catch (Throwable t) {
            cancelAcquire(node);
            throw t;
        }
    }
```
## 总结思考
- 独占式同步状态获取与释放
    - 获取同步状态过程与获取失败时的处理
    - 释放同步状态过程与释放后唤醒等待节点的处理
- 共享式同步状态获取与释放
    - 与独占式同步状态的异同点
- 超时方式获取同步状态，时间的处理


## 参考
- 并发编程的艺术
- [逐行分析AQS源码(3)——共享锁的获取与释放](https://segmentfault.com/a/1190000016447307)