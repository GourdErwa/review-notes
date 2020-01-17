> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

## 自我面试
- 背书式的学习对技术的提升帮助很小。

- 本篇内容不涉及答案，答案需要去相关专栏学习。

- 把面试看作是费曼学习法中的回顾、授课环节。
    - 首先我们能讲给自己听，如果不满意再回炉学习总结，如此反复。
    - 我们试着在一年以后再回顾这些知识。

**专栏学习地址：**    
- CSDN-同步发布 [Java 并发编程专栏 ](https://blog.csdn.net/xiaohulunb/article/details/103828570)
- 个人技术博客-同步发布 [Java 并发编程专栏 ](https://review-notes.top/language/java-concurrency/)

## 并发编程面试题-内存模型
- 内存模型
    - 定义
    - 为什么要有内存模型
    - 为什么要重排序，重排序在什么时候排
    - 如何约束重排序规则
    - happens-before
- 什么是顺序一致性
- CAS 实现的原理，是阻塞还是非阻塞方式？什么时候用，使用时需要考虑的问题
- 处理器和 Java 分别怎么保证原子操作
- 保证了原子性就能保证可见性吗？
- final 内存语义？什么时候用，使用时需要考虑的问题
- volatile 内存语义，什么时候用，用的时候需要考虑什么问题
- synchronized 内存语义，什么时候用，和锁比较一下优缺点
- synchronized 中涉及的锁升级流程
- 锁的内存语义，举例说明，加锁失败时候的处理流程
- 比较下 CAS 、volatile 、synchronized、Lock 区别
- 原子操作类底层实现机制？自增操作是怎么保证原子性的？

## 并发编程面试题-线程
- 线程的状态有哪些
- 如何在 Java 中实现线程？
- 如何在 Java 中启动一个线程？
- 设计线程中断的意义是什么
- Java 中 interrupted 和 isInterrupted 方法的区别？
- 如何停止一个线程？
- 线程 join 方法干什么用？
- 有三个线程 T1，T2，T3，怎么确保它们按顺序执行？
- 线程的等待通知机制实现机制？
- 为什么应该在循环中检查等待条件?
- 为什么 wait 和 notify 方法要在同步块中调用？
- 为什么 wait, notify 和 notifyAll 这些方法不在 thread 类里面？
- ThreadLocal 是什么，怎么实现的
- 线程池是什么，提交一个任务进去，处理流程？
- Executor 框架介绍
- JUC 包中提供了哪些配置好的线程池，差异化是什么
- 什么是 FutureTask？

## 并发编程面试题-锁
- Lock 接口提供了哪些实现类
- AQS 是什么，提供了哪些方法
- AQS 中独占锁和共享锁的操作流程大体描述一下
- 重入锁有什么好处，什么时候考虑用
- 读写锁有什么好处，什么时候考虑用？读锁是什么类型的锁，写锁呢？
- 说下读写锁里的锁降级流程，什么时候可以考虑用这个机制
- park 方法是怎么实现的
- 锁的等待通知机制 Condition 是怎么实现的，有了线程的等待通知机制为什么还要设计 Condition？
- 死锁怎么产生的，如何避免
- 说说 Java 中有哪些锁
- sleep、wait、park、Condition 都能让线程等待，有什么区别？

## 并发编程面试题-容器与工具
- 阻塞和非阻塞有什么区别，他们可以用什么方式实现
- 队列（Queue）提供哪些操作
- 阻塞队列提供了哪些获取元素的方法，有什么区别？
- 阻塞队列有哪些实现？为什么要分有界无界？
- CountDownLatch 怎么实现的，什么时候考虑用？
- CyclicBarrier 怎么实现的，什么时候考虑用？
- Semaphore 怎么实现的，什么时候考虑用？
- 如何在两个线程间共享数据？
- Exchanger 怎么实现的，什么时候考虑用？
- ConcurrentHashMap 实现？
- fork/join 框架是什么？

## 更多面试题
- [Java 并发编程面试题 ](https://review-notes.top/interview/java/)
- [Java-JVM 虚拟机面试题 ](https://review-notes.top/interview/java/)
