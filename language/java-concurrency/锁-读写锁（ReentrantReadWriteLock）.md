> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程](https://review-notes.top/language/java-concurrency/)

[toc]

## 读写锁-ReentrantReadWriteLock
之前提到锁 (ReentrantLock、synchronized) 基本都是排他锁。

读写锁在同一时刻可以允许多个读线程访问，但是在写线程访问时，所有的读线程和其他写线程均被阻塞。


读写锁维护了一对锁，一个读锁和一个写锁，通过分离读锁和写锁，使得并发性相比一般的排他锁有了很大提升。


除了保证写操作对读操作的可见性以及并发性的提升之外，读写锁能够简化读写交互场景的编程方式。本章内容无特殊说明，读写锁表示 ReentrantReadWriteLock。

### 不用读写锁怎么实现读写交互
在没有读写锁支持的 (Java 5 之前) 时候，如果需要完成上述工作就要使用 Java 的等待通知机制。

当写操作开始时，所有晚于写操作的读操作均会进入等待状态，只有写操作完成并进行通知之后，所有等待的读操作才能继续执行 (写操作之间依靠 synchronized 关键进行同步)，这样做的目的是使读操作能读取到正确的数据，不会出现脏读。

### 读写锁-特性
- 公平性：支持公平非公平选择，默认非公平
- 重入性：读线程获取读锁后可以再次获取读锁。写线程获取写锁后可以**再次获取写锁和读锁**
- 锁降级：遵循获取写锁-> 获取读锁-> 释放写锁的次序，最终写锁降级为读锁
- 写锁是一个支持重进入的排它锁
- 读锁是一个支持重进入的共享锁

### 读写锁-使用示例
```java
@Slf4j
public class ReentrantReadWriteLockExample {

    private final Map<String, String> cache = new HashMap<>(100); // 内存数据

    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    private final Lock readLock = lock.readLock(); // 读锁
    private final Lock writeLock = lock.writeLock(); // 写锁

    public String get(String key) { // 读操作
        readLock.lock();
        try {
            return cache.get(key);
        } finally {
            readLock.unlock();
        }
    }

    public void put(String key, String value) { // 写操作
        writeLock.lock();
        try {
            cache.put(key, value);
        } finally {
            writeLock.unlock();
        }
    }

    // ReentrantReadWriteLock 提供锁状态相关方法示例
    public void logLockStatus() {
        // e.g. 一个线程重入了 n 次读锁，那么 getReadHoldCount = 1，getReadLockCount = n
        log.info("当前读锁被获取的次数 = {}", lock.getReadLockCount());
        
        log.info("当前线程获取读锁的次数 = {}", lock.getReadHoldCount());
        
        log.info("写锁是否被获取 = {}", lock.isWriteLocked());
        
        log.info("写锁被获取的次数 = {}", lock.getWriteHoldCount());
    }
}
```

## 读写锁实现分析
因为读写锁支持公平与非公平选择，内部实现机制为：
- 内部基于 AbstractQueuedSynchronizer（AQS）实现一个公平与非公平公共的父类 Sync ，用于管理同步状态
- FairSync 继承 Sync 用于处理公平问题
- NonfairSync 继承 Sync 用于处理非公平问题
- ReadLock 实现 Lock 接口，内部聚合 Sync
- WriteLock 实现 Lock 接口，内部聚合 Sync

读写锁的构造函数如下：
```java
    public ReentrantReadWriteLock(boolean fair) {
        sync = fair ? new FairSync() : new NonfairSync();
        readerLock = new ReadLock(this);
        writerLock = new WriteLock(this);
    }
```

***

分析 ReentrantReadWriteLock 的实现，主要包括以下章节:
- 同步状态字段设计
- 写锁的获取与释放
- 读锁的获取与释放
- 锁降级

### 同步状态字段设计
读写锁的自定义同步器需要在同步状态 (一个整型变量) 上维护多个读线程和一个写线程的状态，使得该状态的设计成为读写锁实现的关键。

读写锁对于同步状态的实现是在一个整形变量上通过“按位切割使用”：将变量切割成两部分，
- 高 16 位表示读
- 低 16 位表示写。

<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/读写锁状态划分方式示例.png" height="320px">
</div>

假设当前同步状态值为 S，get 和 set 的操作如下：
- 获取写状态：S&0x0000FFFF，将高 16 位全部抹去
- 获取读状态：S>>>16，无符号补 0，右移 16 位
- 写状态加 1：S + 1
- 读状态加 1：S +（1<<16）即 S + 0x00010000

在代码层的判断中，S 不等于 0 时，当写状态 (S&0x0000FFFF) 等于 0 时，则读 状态 (S>>>16) 大于 0，即读锁已被获取。

### 写锁的获取与释放
写锁是一个支持重进入的排它锁。
- 重入性：如果当前线程已经获取了写锁，则增加写状态。
- 排他性：如果当前线程在获取写锁时，读锁已经被获取 (读状态不为 0) 或者该线程不是已经获取写锁的线程，则当前线程进入等待状态。

#### 写锁的获取
分析 ReentrantReadWriteLock.Sync#tryAcquire 方法：
```java
    protected final boolean tryAcquire(int acquires) {
        Thread current = Thread.currentThread();
        int c = getState();
        int w = exclusiveCount(c); // 根据同步状态获取写锁的个数
        if (c != 0) { // 如果当前有写锁或者读锁
            // 如果写锁为 0 或者当前线程不是独占线程（不符合重入），返回 false
            if (w == 0 || current != getExclusiveOwnerThread())
                return false;
            if (w + exclusiveCount(acquires) > MAX_COUNT) // 写锁的个数超了最大值，抛出异常
                throw new Error("Maximum lock count exceeded");
            setState(c + acquires); // 重入获取
            return true;
        }
        // 如果当前没有写锁或者读锁，或者写线程应该阻塞或者 CAS 失败，返回 false
        if (writerShouldBlock() || !compareAndSetState(c, c + acquires))
            return false;
        setExclusiveOwnerThread(current); // 否则将当前线程置为获得写锁的线程
        return true;
    }
```
#### 写锁的释放
写锁的释放与 ReentrantLock 的释放过程基本类似，每次释放均减少写状态，当写状态为 0 时表示写锁已被释放，从而等待的读写线程能够继续访问读写锁，同时前次写线程的修改对后续读写线程可见。

### 读锁的获取与释放
读锁是一个支持重进入的共享锁，它能够被多个线程同时获取，在没有其他写线程访问 (或者写状态为 0) 时，读锁总会被成功地获取，而所做的也只是 (线程安全的) 增加读状态。
- 重入性：如果当前线程已经获取了读锁，则增加读状态。
- 与写锁互斥性：如果当前线程在获取读锁时，写锁已被*其他线程*获取 (写锁被自己获取时可以进行锁降级)，则进入等待状态。
#### 读锁的获取
分析 ReentrantReadWriteLock.Sync#tryAcquireShared 方法：
```java
    protected final int tryAcquireShared(int unused) {
        Thread current = Thread.currentThread();
        int c = getState();
        // 一.如果当前有写线程并且本线程不是写线程，不符合重入
        if (exclusiveCount(c) != 0 &&
            getExclusiveOwnerThread() != current)
            return -1;
        int r = sharedCount(c); // 获取读锁数量

        // 二.如果读不应该阻塞并且读锁的个数小于最大值 MAX_COUNT，并且可以成功更新状态值，成功
        if (!readerShouldBlock() &&
            r < MAX_COUNT &&
            compareAndSetState(c, c + SHARED_UNIT)) { 
            if (r == 0) { // 如果当前读锁为 0
                firstReader = current; // 第一个读线程就是当前线程
                firstReaderHoldCount = 1;
            } else if (firstReader == current) { // 如果当前线程重入了，firstReaderHoldCount++
                firstReaderHoldCount++;
            } else { // 当前读线程和第一个读线程不同，记录每一个线程读的次数
                ReentrantReadWriteLock.Sync.HoldCounter rh = cachedHoldCounter;
                if (rh == null ||
                    rh.tid != LockSupport.getThreadId(current))
                    cachedHoldCounter = rh = readHolds.get();
                else if (rh.count == 0)
                    readHolds.set(rh);
                rh.count++;
            }
            return 1;
        }
        return fullTryAcquireShared(current); // 三.第二步不满足时，循环尝试
    }
```
#### 读锁的释放
读锁的每次释放 (线程安全的，可能有多个读线程同时释放读锁) 均减少读状态，减少的值是 (1<<16)。

### 锁降级
锁降级指的是写锁降级成为读锁。锁降级是指把持住 (当前拥有的) 写锁，再获取到读锁，随后释放 (先前拥有的) 写锁的过程。
> 如果当前线程拥有写锁，然后将其释放，最后再获取读锁，这种分段完成的过程**不能称之为锁降级**。

#### 锁降级有什么用?
1. 保证数据的可见性：
    - 如果当前线程不获取读锁而是直接释放写锁，假设此刻另一个线程 (记作线程 T) 获取了写锁并修改了数据，那么当前线程无法感知线程 T 的数据更新。
    - 如果当前线程获取读锁，即遵循锁降级的步骤，则线程 T 将会被阻塞，直到当前线程使用数据并释放读锁之后，线程 T 才能获取写锁进行数据更新。
2. 提高性能：
    - 存在一个事务性的写操作，分 N 段完成，比较耗时（事务不允许被其他写中断）
    - 每完成一段操作后让降级为读锁进行读取操作
    - 事务全部完成后释放写锁

#### 为什么不支持锁升级？
不支持锁升级(把持读锁、获取写锁，最后释放读锁的过程)。目的也是保证数据可见性，如果读锁已被多个线程获取，其中任意线程成功获取了写锁并更新了数据，则其更新对其他获取到读锁的线程是不可见的。

## 应用场景
- 适用于读取数据的频率远远大于写数据的频率的场合

## 总结
- 读锁的存在意味着不允许其他写操作的存在
- 读锁是一个支持重进入的共享锁
- 写锁是一个支持重进入的排它锁
- 锁降级的意义？

## 参考
- 并发编程的艺术
