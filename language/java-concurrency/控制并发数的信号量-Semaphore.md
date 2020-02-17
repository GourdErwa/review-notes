> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程 ](https://review-notes.top/language/java-concurrency/)

[toc]
## Semaphore 是什么
Semaphore(信号量) 是用来控制同时访问特定资源的线程数量，它通过协调各个线程，以保证合理的使用公共资源。

## Semaphore 如何使用
我们模拟一个数据库连接池，池中连接需要根据实际情况控制并发连接。
- 获取连接时拿到一个许可。acquire 方法。
- 释放时归还许可。release 方法。

```java
public abstract class SemaphoreExample {

    private final Object[] connections; // 数据库可用连接
    private final Semaphore available = new Semaphore(10, true); // 信号量

    // 控制访问数量的方式获取可用连接，达到访问数量最大值时，阻塞
    public Object getConnection() throws InterruptedException {
        available.acquire();
        return getNextAvailableConnection();
    }

    // 放回连接
    public void putConnection(Object x) {
        if (markAsUnused(x))
            available.release();
    }

    abstract Object getNextAvailableConnection();

    abstract boolean markAsUnused(Object connection);
}
```
Semaphore 还提供一些其他方法：
- intavailablePermits ：返回此信号量中当前可用的许可证数
- intgetQueueLength ：返回正在等待获取许可证的线程数
- booleanhasQueuedThreads ：是否有线程正在等待获取许可证
- reducePermits ：减少 reduction 个许可证
- getQueuedThreads ：返回所有等待获取许可证的线程集合

## Semaphore 实现原理
因为 Semaphore 支持公平与非公平选择，内部实现机制为：
- 内部基于 AbstractQueuedSynchronizer（AQS）实现一个公平与非公平公共的父类 Sync ，用于管理同步状态
- Sync 主要使用共享式锁相关模板方法
- FairSync 继承 Sync 用于处理公平问题
- NonfairSync 继承 Sync 用于处理非公平问题

主要处理逻辑为：
- 初始化 Semaphore 后，同步状态值设置为许可数量
- 调用 acquire 方法后，许可数量 -1（同步状态值-1）
- 调用 release 方法后，许可数量 +1（同步状态值+1）

## 应用场景
- 流量控制，特别是公用资源有限的应用场景
- 控制线程执行顺序，比如初始化一个许可证数量为 0 的信号量，在其他条件未释放许可时永远不可执行。
- 可参考本专栏《LeetCode-xx（多线程）》相关练习题
