module.exports = [
    {
        title: "并发编程-基础",
        collapsable: false,
        sidebarDepth: 1,
        children: [
            ['内存模型-基础概念', '内存模型-基础概念'],
            ['内存模型-顺序一致性', '内存模型-顺序一致性'],
            ['并发编程-CAS实现原理', 'CAS实现原理'],
            ['内存模型-原子操作', '原子操作'],
            ['内存模型-final域的内存语义', 'final域的内存语义'],
            ['并发关键字-volatile', '并发关键字-volatile'],
            ['并发关键字-synchronized', '并发关键字-synchronized'],
            ['锁的内存语义', '锁的内存语义'],
            ['并发操作比较（CAS、volatile、synchronized、Lock）', '并发操作比较（CAS、volatile、synchronized、Lock）'],
            ['原子操作类（atomic包）', '原子操作类（atomic包）']
        ]
    },
    {
        title: "并发编程-锁",
        collapsable: false,
        sidebarDepth: 1,
        children: [
            ['锁-Lock接口简介', '锁-Lock接口简介'],
            ['锁-AbstractQueuedSynchronizer介绍', '锁-AbstractQueuedSynchronizer介绍'],
            ['锁-AbstractQueuedSynchronizer原理', '锁-AbstractQueuedSynchronizer原理'],
            ['锁-重入锁（ReentrantLock）', '锁-重入锁（ReentrantLock）'],
            ['锁-读写锁（ReentrantReadWriteLock）', '锁-读写锁（ReentrantReadWriteLock）'],
            ['锁相关工具类（LockSupport）', '锁相关工具类（LockSupport）'],
            ['锁等待通知机制（Condition）', '锁等待通知机制（Condition）'],
            ['锁-死锁问题及解决方案', '锁-死锁问题及解决方案'],
            ['锁类型总结', '锁类型总结']
        ]
    },
    {
        title: "并发编程-线程",
        collapsable: false,
        sidebarDepth: 1,
        children: [
            ['线程简介', '线程简介'],
            ['线程等待通知机制（wait、notify）', '线程等待通知机制（wait、notify）'],
            ['线程等待操作比较（sleep、wait、park、Condition）', '线程等待操作比较（sleep、wait、park、Condition）'],
            ['线程关键类-ThreadLocal', '线程关键类-ThreadLocal'],
            ['线程池简介', '线程池简介'],
            ['线程池-Executor框架', '线程池-Executor框架'],
        ]
    }
];