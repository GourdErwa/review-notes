> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程](https://review-notes.top/language/java-concurrency/)

[toc]
## 线程等待/通知机制简介
假设有两个线程，一个生产数据，一个消费数据。如何保证生产线程生产出数据后通知给消费线程，消费线程在没有数据可被消费情况下等待有数据呢？

一般的做法是采用轮询方法，一直 while 循环（中间睡眠几毫秒）判断是否有数据。该办法可能存在的问题是
1. 难以确保及时性。在睡眠时，基本不消耗处理器资源，但是如果睡得过久，就不能及时发现条件已经变化，也就是及时性难以保证。
2. 难以降低开销。如果降低睡眠的时间，比如休眠 1 毫秒，这样消费者能更加迅速地发现条件变化，但是却可能消耗更多的处理器资源，造成了无端的浪费。

***
Java 通过内置的等待/通知机制能够很好地解决这个矛盾并实现所需的功能。

等待/通知机制，是指一个线程 A 调用了对象 O 的 wait 方法进入等待状态，而另一个线程 B 调用了对象 O 的 notify 或者 notifyAll 方法，线程 A 收到通知后从对象 O 的 wait 方法返回，进而执行`后续操作`。上述两个线程通过对象 O 来完成交互，而对象上的 wait 和 notify/notifyAll 的 关系就如同开关信号一样，用来完成等待方和通知方之间的交互工作。

> 此处定义 **对象 O**、**等待的后续操作** 是关键理解点 ， 阅读本节内容后深入思考总结 **等待/通知的经典范式及应用场景** 内容 。本节内容所指等待/通知机制均指 wait/notify。

## 怎么实现线程等待/通知机制
Object 作为所有对象的父类，其中与等待通知机制相关几个方法如下：

- wait : 调用该方法线程进入 WAITING 状态，只有等待其他线程的通知或者被中断才会返回（调用后会释放锁，sleep 不会）
- wait（超时设置） : 在 wait 方法的基础上增加了超时，达到超时设置后如果没有通知或者中断也会返回
- notify : 通知一个在对象上等待的线程 A（调用过 wait 方法的线程），使其从 wait 方法返回，前提是该线程 A 获取到了对象锁。（多线程存在锁竞争）
- notifyAll : 通知所有等待在该对象上的线程

## 代码实战分析
例子中，创建了两个线程-WaitThread 和 NotifyThread，前者检查 flag 值是否为 false，如果符合要求，进行后续操作，否则在 lock 上等待，后者在睡眠了一段时间 后对 lock 进行通知。
> 等待方 (消费者) 和通知方 (生产者)
```java
public class WaitAndNotifyExample {

    public static boolean FLAG = true;
    public static final Object LOCK = new Object();

    public static void main(String[] args) {
        new Thread(new Wait(), "[WaitThread]").start();
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException ignored) {
        }
        new Thread(new Notify(), "[NotifyThread]").start();
    }
}

class Wait implements Runnable {
    @Override
    public void run() {
        synchronized (LOCK) {
            final String threadName = Thread.currentThread().getName();
            while (FLAG) {
                System.out.println(new Date() + threadName + " FLAG = true , wait...");
                try {
                    LOCK.wait();
                } catch (InterruptedException ignored) {
                }
            }
            System.out.println(new Date() + threadName + " FLAG = false，开始继续工作");
        }
    }
}

class Notify implements Runnable {
    @Override
    public void run() {
        synchronized (LOCK) {
            final String threadName = Thread.currentThread().getName();
            System.out.println(new Date() + threadName + " 持有锁，发出通知");
            LOCK.notifyAll();
            FLAG = false;
            try {
                TimeUnit.SECONDS.sleep(5);
            } catch (InterruptedException ignored) {
            }
            synchronized (LOCK) { // 再次加锁，目的：测试调用 notifyAll 方法后被唤醒的线程是否立即执行
                System.out.println(new Date() + threadName + " 再次拿到锁. sleep @ ");
                try {
                    TimeUnit.SECONDS.sleep(5);
                } catch (InterruptedException ignored) {
                }
            }
        }
    }
}
```
最终打印：
> Thu Dec 19 15:41:33 CST 2019[WaitThread] FLAG = true , wait...    
> Thu Dec 19 15:41:34 CST 2019[NotifyThread] 持有锁，发出通知   
> Thu Dec 19 15:41:39 CST 2019[NotifyThread] 再次拿到锁. sleep @     
> Thu Dec 19 15:41:44 CST 2019[WaitThread] FLAG = false，开始继续工作

***
执行细节说明：
1. 使用 wait、notify 和 notifyAll 时需要先对调用对象加锁。
2. 调用 wait 方法后，线程状态由 RUNNING 变为 WAITING，并将当前线程放置到对象的等待队列。
3. notify 或 notifyAll 方法调用后，等待线程依旧不会从 wait() 返回，需要调用 notify 或 notifyAll 的线程释放锁之后，等待线程才有机会从 wait 返回。      
4. notify 方法将等待队列中的一个等待线程从等待队列中移到同步队列中，而 notifyAll 方法则是将等待队列中所有的线程全部移到同步队列，被移动的线程状态由 WAITING 变为 BLOCKED。
5. 从 wait 方法返回的前提是获得了调用对象的锁。
***
<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/WaitNotify-运行过程.png" height="480px">
    <p> WaitNotify-运行过程 </p>
</div>

## 线程等待/通知的经典范式
范式分为两部分，分别针对等待方 (消费者) 和通知方 (生产者)。

### 等待方遵循原则
1. 获取对象的锁
2. 如果条件不满足执行处理逻辑，那么调用对象的 wait 方法（被通知后仍要检查条件）。
3. 条件满足则执行对应的逻辑

伪代码：
```
synchronized(对象) { 
    while(条件判断) { // 循环判断条件是否满足，条件不满足时进入等待状态
        对象.wait(); // wait 后释放锁，其他线程拿到锁后执行对于逻辑
    } 
    对应的处理逻辑    // 其他线程调用 notify、notifyAll 后并释放锁后，继续运行该处代码
 }
```
### 通知方遵循原则 
1. 获得对象的锁
2. 改变条件（e.g. flag）
3. 通知所有等待在对象上的线程

伪代码：
```
synchronized(对象) { 
    改变条件 
    对象.notifyAll();
 }
```

### 为什么 wait/notify 需要在同步块里执行？
参考上面的经典范式，如果没有在同步块里：
- 等待方条件判断不符合时将执行 wait 方法
- 在执行 wait 方法前通知方刚好改变了条件并执行 notifyAll 方法
- 然后等待方执行了 wait 方法（可能永远不会被唤醒了，本来应该被唤醒的）

总结为：用 synchronized 确保在条件判断和 notify 之间不要调用 wait。保证线程的通信交流。

## 应用场景
多线程执行时，线程内部逻辑需要等待其他线程执行后满足条件**才执行 wait 方法后续的逻辑**

tip：Thread.join 是等待指定的一个线程执行完成后才执行后续的逻辑，wait 是未指定具体线程，可任意线程唤醒。

## 总结思考
- 等待通知机制关键点：需要竞争锁
- 等待通知机制关键点：等待时会释放锁，释放后别的线程竞争锁，竞争胜出的可以执行逻辑，执行后唤醒等待的线程，等待的线程继续执行在 wait 方法后的逻辑代码
- 为什么等待很多时候在 while 循环里？
- 为什么 wait/notify 需要在同步块里执行？
- 线程等待状态时底层是怎么处理的？唤醒的时候底层怎么处理？
- [生产消费者-等待通知+synchronized 实例 ](https://github.com/GourdErwa/java-advanced/blob/master/java-concurrency/src/main/java/io/gourd/java/concurrency/app/pc/WaitSynchronized.java)

## 参考
- 有关线程等待操作相关操作区别，参考本专栏《线程等待操作（sleep、wait、park、Condition）区别》
- 并发编程的艺术
- [Java: Why wait must be called in a synchronized block](https://programming.guide/java/why-wait-must-be-in-synchronized.html)