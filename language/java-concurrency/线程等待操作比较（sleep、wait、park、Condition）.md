> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程 ](https://review-notes.top/language/java-concurrency/)

[toc]

## 知识回顾
本节内容需要基础知识点如下，可参考本专栏文章：
- 《线程等待通知机制（wait、notify）》
- 《锁相关工具类（LockSupport）》
- 《锁等待通知机制（Condition）》

我们可以把线程的等待通知机制看着是线程的通信交流，执行某一块代码时，因为条件不满足进入等待状态，其他线程修改条件后唤醒继续执行。

本节内容为个人学习理解整理，可能存在偏差，欢迎讨论。

## 比较
- 实现原理（底层）
    - sleep：native 方法，内核定时器触发
    - wait：native 方法，配合 synchronized 的 monitorenter 和 monitorexit 指令
    - park：native 方法，二元信号量
    - Condition：AQS 维护等待队列与同步队列

- 编码操作
    - sleep：Thread.sleep 静态方法
    - wait：使用 synchronized 加锁的对象，Object 的 wait/notify
    - park：LockSupport.park/unpark
    - Condition：由 Lock 对象 newCondition 方法创建，wait/signal

- 等待时是否释放锁
    - sleep：不释放
    - wait：释放
    - park：释放
    - Condition：释放

- 超时等待
    - sleep：支持
    - wait：支持
    - park：支持
    - Condition：支持

- 等待过程中断
    - sleep：支持
    - wait：支持
    - park：支持
    - Condition：支持

- 唤醒操作
    - sleep：不支持，定时器唤醒
    - wait：支持，notify/notifyAll
    - park：支持，unpark
    - Condition：支持，signal/signalAll

- 等待操作精准性
    - sleep：当前线程
    - wait：当前线程
    - park：指定具体的线程
    - Condition：当前线程

- 唤醒操作精准性
    - wait：notify 随机唤醒一个线程，notifyAll 唤醒所有等待的线程
    - park：unpark 唤醒指定的线程
    - Condition：signal 随机唤醒一个线程，signalAll 唤醒所有等待的线程

- 执行顺序
    - park：unpark 可以在 park 前执行。可以先调用 unpark 方法释放一个许可证，后面线程调用 park 方法时，发现已经许可证了，就可以直接获取许可证而不用进入休眠状态了
    - wait/notify：保证 wait 方法比 notify 方法先执行。如果 notify 方法比 wait 方法晚执行的话，就会导致因 wait 方法进入休眠的线程接收不到唤醒通知的问题
    - Condition：保证 wait 方法比 signal 方法先执行。

