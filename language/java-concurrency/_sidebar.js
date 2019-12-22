module.exports = [
    {
        title: "并发编程-基础篇",
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
            ['并发同步、锁定机制比较', '并发同步、锁定机制比较'],
            ['锁-死锁问题及解决方案', '死锁问题及解决方案'],
            ['锁类型总结', '锁类型总结'],
            ['原子操作类（atomic包）','原子操作类（atomic包）']
        ]
    },
    {
        title: "并发编程-线程篇",
        collapsable: false,
        sidebarDepth: 1,
        children: [
            ['线程简介', '线程简介'],
            ['线程等待通知机制', '线程等待通知机制'],
            ['线程关键类-ThreadLocal', '线程关键类-ThreadLocal'],
            ['线程池简介', '线程池简介'],
            ['线程池-Executor框架', '线程池-Executor框架']
        ]
    }
    // {
    //     title: "并发编程-线程",
    //     collapsable: true,
    //     sidebarDepth: 1,
    //     children: [
    //         ['并发关键类-atomic原子类', 'atomic原子类'],
    //         ['并发关键类-AbstractQueuedSynchronizer', 'AbstractQueuedSynchronizer'],
    //         ['并发关键类-ReentrantLock', 'ReentrantLock'],
    //         ['并发关键类-ReentrantReadWriteLock', 'ReentrantReadWriteLock'],
    //         ['并发关键类-StampedLock', 'StampedLock'],
    //         ['并发关键类-Condition', 'Condition'],
    //         ['并发关键类-CountDownLatch', 'CountDownLatch'],
    //         ['并发关键类-CyclicBarrier', 'CyclicBarrier']
    //     ]
    // },
    // {
    //     title: "并发编程-关键类分析",
    //     collapsable: true,
    //     sidebarDepth: 1,
    //     children: [
    //         ['并发关键类-atomic原子类', 'atomic原子类'],
    //         ['并发关键类-AbstractQueuedSynchronizer', 'AbstractQueuedSynchronizer'],
    //         ['并发关键类-ReentrantLock', 'ReentrantLock'],
    //         ['并发关键类-ReentrantReadWriteLock', 'ReentrantReadWriteLock'],
    //         ['并发关键类-StampedLock', 'StampedLock'],
    //         ['并发关键类-Condition', 'Condition'],
    //         ['并发关键类-CountDownLatch', 'CountDownLatch'],
    //         ['并发关键类-CyclicBarrier', 'CyclicBarrier']
    //     ]
    // }
];