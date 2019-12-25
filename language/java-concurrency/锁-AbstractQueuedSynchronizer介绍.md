> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程](https://review-notes.top/language/java-concurrency/)

[[toc]]
## 队列同步器介绍
队列同步器 AbstractQueuedSynchronizer(*以下简称同步器或者 AQS*)，是用来构建锁或者其他同步组件的基础框架，它使用了一个 int 成员变量表示同步状态，通过内置的 FIFO 队列来完成资源获取线程的排队工作，并发包的作者 (Doug Lea) *期望它能够成为实现大部分同步需求的基础*。

### 如何使用？
同步器的主要使用方式是继承，子类通过继承同步器并实现它的抽象方法来管理同步状态，在抽象方法的实现过程中免不了要对同步状态进行更改，这时就需要使用同步器提供的 3 个方法 (getState()、setState(int newState) 和 compareAndSetState(int expect,int update)) 来进行操作，因为它们能够保证状态的改变是安全的。

子类推荐被定义为自定义同步组件的静态内部类，同步器自身没有实现任何同步接口，它仅仅是定义了若干同步状态获取和释放的方法来供自定义同步组件使用，
同步器既可以支持独占式地获取同步状态，也可以支持共享式地获取同步状态，这样就可以方便实现不同类型的同步组件 (ReentrantLock、 ReentrantReadWriteLock 和 CountDownLatch 等)。

### 同步器与锁的关系
同步器是实现锁 (也可以是任意同步组件) 的关键，在锁的实现中聚合同步器，利用同步器实现锁的语义。可以这样理解二者之间的关系:
- 锁是面向使用者的，它定义了使用者与锁交互的接口 (比如可以允许两个线程并行访问)，隐藏了实现细节;
- 同步器面向的是锁的实现者，它简化了锁的实现方式，屏蔽了同步状态管理、线程的排队、等待与唤醒等底层操作。锁和同步器很好地隔离了使用者和实现者所需关注的领域。

## 同步器方法说明
### 操作同步状态的方法
重写同步器指定的方法时，需要使用同步器提供的如下 3 个方法来访问或修改同步状态。
```java
// 获取当前同步状态
protected final int getState()
// 设置当前同步状态
protected final void setState(int newState)
// 使用 CAS 设置当前状态，该方法能够保证状态设置的原子性
protected final boolean compareAndSetState(int expect, int update)
```
### 继承时可重写的方法
实现自定义同步组件时，将会重写同步器提供的方法，用于完成特定的需求。
```java
// 独占式获取状态。实现需要查询当前状态是否符合预期，然后再使用 CAS 设置同步状态
protected boolean tryAcquire(int arg)
// 独占式释放状态，等待获取同步状态的线程将有机会获取同步状态
protected boolean tryRelease(int arg)

// 共享式获取状态，返回≥0 的值表示成功，反之获取失败
protected int tryAcquireShared(int arg)
// 共享式释放同步状态
protected boolean tryReleaseShared(int arg)

// 在独占式模式下判断是否被线程占用
protected boolean isHeldExclusively()
```
### 默认提供的模板方法
同步器提供的模板方法基本上分为 3 类:
- 独占式同步状态获取与释放
- 共享式同步状态获取与释放
- 同步状态和查询同步队列中的等待线程情况

自定义同步组件将使用同步器提供的模板方法来实现自己的同步语义。以下为 AQS 模板方法：
```java
// ---------------------- 独占式相关操作 ----------------------

// 独占模式获取，忽略中断。调用一次重写的 tryAcquire 方法，在成功时返回。
// 否则，线程进入同步队列等待，直到调用 tryAcquire 成功为止。
// 这种方法可以用来实现方法 Lock.lock
public final void acquire(int arg) {
        if (!tryAcquire(arg) &&
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
            selfInterrupt();
    }

// 与 acquire(int arg) 相同，但是该方法响应中断
public final void acquireInterruptibly(int arg) throws InterruptedException...

// 与 acquireInterruptibly(int arg) 相同，支持超时返回
public final boolean tryAcquireNanos(int arg, long nanosTimeout) throws InterruptedException...

// 独占式的释放同步状态，该方法会在释放同步状态后将同步队列中的第一个节点包含的线程唤醒
public final boolean release(int arg)


// ---------------------- 共享式相关操作 ----------------------

// 共享式的获取同步状态，与独占式获取的主要区别是同一时刻可以有多个线程获取同步状态
public final void acquireShared(int arg) {
        if (tryAcquireShared(arg) < 0)
            doAcquireShared(arg);
    }
// 与 acquireShared(int arg) 相同，但是该方法响应中断
public final void acquireSharedInterruptibly(int arg) throws InterruptedException

// 与 acquireSharedInterruptibly(int arg) 相同，支持超时返回
public final boolean tryAcquireNanos(int arg, long nanosTimeout) throws InterruptedException

// 共享式的释放同步状态
public final boolean releaseShared(int arg)
```

## 基于同步器的独占式锁的实现示例
参考*同步器方法说明*中的内容我们定义一个独占式锁，定义一个 Sync 继承于 AQS。所有与锁相关的语义交于 Sync 完成。
```java
public class MutexLockExample implements Lock {

    // 静态内部类，自定义同步器，重写 AQS 的方法
    private static class Sync extends AbstractQueuedSynchronizer {
        // 是否处于占用状态
        @Override
        protected boolean isHeldExclusively() {
            return getState() == 1;
        }

        // 当状态为 0 的时候获取锁
        @Override
        public boolean tryAcquire(int acquires) {
            if (compareAndSetState(0, 1)) {
                setExclusiveOwnerThread(Thread.currentThread());
                return true;
            }
            return false;
        }

        // 释放锁，将状态设置为 0
        @Override
        protected boolean tryRelease(int releases) {
            if (getState() == 0) throw new IllegalMonitorStateException();
            setExclusiveOwnerThread(null);
            setState(0);
            return true;
        }

        // 返回一个 Condition，每个 condition 都包含了一个 condition 队列
        protected Condition newCondition() {
            return new ConditionObject();
        }
    }

    // 将 Lock 方法的实现代理到 Sync 实现
    private final Sync sync = new Sync();

    @Override
    public void lock() { sync.acquire(1); }
    @Override
    public void lockInterruptibly() throws InterruptedException {
        sync.acquireInterruptibly(1);
    }
    @Override
    public boolean tryLock() { return sync.tryAcquire(1); }
    @Override
    public boolean tryLock(long timeout, TimeUnit unit) throws InterruptedException {
        return sync.tryAcquireNanos(1, unit.toNanos(timeout));
    }
    public boolean isLocked() { return sync.isHeldExclusively(); }
    @Override
    public void unlock() { sync.release(1); }
    @Override
    public Condition newCondition() { return sync.newCondition(); }
}
```
## 同步器如何维护线程状态？
同步器的实现依赖于一个 FIFO 队列，那么队列中的元素 Node 就是保存着线程引用和线程状态的容器，每个线程对同步器的访问，都可以看做是队列中的一个节点（Node）。  
节点是构成同步队列的基础，同步器拥有首节点 (head) 和尾节点 (tail)，没有成功获取同步状态的线程将会成为节点加入该队列的尾部。首节点的线程在释放同步状态时，将会唤醒后继节点，而后继节点将会在获取同步状态成功时将自己设置为首节点。

```
     +------+  prev +-----+  prev +-----+       +-----+
head |      | <---- |     | <---- |     | <---- |     |  tail
     +------+       +-----+       +-----+       +-----+
```
### 节点（Node）介绍
AbstractQueuedSynchronizer#Node 的主要包含以下成员变量：
```java
static final class Node {
    /**
     * 表示节点的状态。其中包含的状态有：
     * CANCELLED，值为 1，表示当前的线程被取消；
     * SIGNAL，   值为-1，表示当前节点的后继节点包含的线程需要运行，也就是 unpark；
     * CONDITION，值为-2，表示当前节点在等待 condition，也就是在 condition 队列中；
     * PROPAGATE，值为-3，表示当前场景下后续的 acquireShared 能够得以执行；
     * 值为 0，不是以上状态时（新节点入队时的默认状态）
     */
    volatile int waitStatus;

    // 前驱节点，比如当前节点被取消，那就需要前驱节点和后继节点来完成连接。
    volatile Node prev;

    // 后继节点。
    volatile Node next;

    // 入队列时的当前线程。
    volatile Thread thread;

    // 存储 condition 队列中的后继节点。
    Node nextWaiter;
}
```
### 首节点尾节点设置
源码参考：
```java
public abstract class AbstractQueuedSynchronizer
    extends AbstractOwnableSynchronizer
    implements java.io.Serializable {

    // 设置首节点方法
    private void setHead(Node node) {
            head = node;
            node.thread = null;
            node.prev = null;
    }

    // 设置尾节点方法
    private Node enq(Node node) {
            for (;;) {
                Node oldTail = tail;
                if (oldTail != null) {
                    node.setPrevRelaxed(oldTail);
                    if (compareAndSetTail(oldTail, node)) { // CAS 操作
                        oldTail.next = node;
                        return oldTail;
                    }
                } else {
                    initializeSyncQueue();
                }
            }
    }
}
```
#### 设置首节点方法说明
通过获取同步状态成功的线程来完成，由于只有一个线程能够成功获取到同步状态。
因此设置头节点的方法并不需要使用 CAS 来保证，它只需要将首节点设置成为原首节点的后继节点并断开原首节点的 next 引用即可
#### 设置尾节点方法说明
由于线程无法获取到同步状态时，转而被构造成节点并加入到同步队列，可能存在多个线程一起设置为尾节点的动作，必须保证线程安全。
因此内部通过方法 compareAndSetTail 设置，它需要传递当前线程“认为”的尾节点和当前节点，只有设置成功后，当前节点才正式与之前的尾节点建立关联。

## 总结思考
- AQS 的作用？
- AQS 提供的模板方法分为哪 3 大类？
- AQS#Node 干什么用的？AQS 内部怎么维护他的添加和移除操作？

《锁-AbstractQueuedSynchronizer原理》中将详细分析 AQS 的实现原理。该篇仅作为 AQS 知识点介绍。
## 参考
- 并发编程的艺术

