> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程 ](https://review-notes.top/language/java-concurrency/)

[[toc]]
## Exchanger 是什么
Exchanger(交换者) 是一个线程间协作的工具类，用于进行线程间的数据交换。

它提供一个同步点，在这个同步点，两个线程可以交换彼此的数据。
这两个线程通过 exchange 方法交换数据：
- 如果第一个线程先执行 exchange 方法，它会一直等待第二个线程也执行 exchange 方法
- 当两个线程都到达同步点时，这两个线程就可以交换数据，将本线程生产出来的数据传递给对方。

***

**注意**：
- 如果偶数个线程执行，可以交换
- 如果奇数个线程执行，可能会剩余最后一个线程一直等待

## Exchanger 如何使用
我们模拟一个示例：
- 比如 2 个计算异步执行，但是他们在执行一段逻辑后需要对方的中间计算结果。
- 在需要对方结果的方法处，调用 exchange 方法即可等待获取。
- 都执行了 exchange 方法后 2 个中间计算结果交换完成。

```java
public class ExchangerExample {
    private final Exchanger<String> exchanger = new Exchanger<>();

    class TypeA implements Runnable {
        public void run() {
            log.info("TypeA 执行计算逻辑...");
            String a = "TypeA 中间计算结果";
            try {
                String exchange = exchanger.exchange(a);
                log.info("获取 TypeB ={}", exchange);
                // 获取 TypeB 内容后继续处理
            } catch (InterruptedException ignored) {
            }
        }
    }

    class TypeB implements Runnable {
        public void run() {
            log.info("TypeB 执行计算逻辑...");
            String b = "TypeB 中间计算结果";
            try {
                String exchange = exchanger.exchange(b);
                log.info("获取 TypeA ={}", exchange);
                // 获取 TypeA 内容后继续处理
            } catch (InterruptedException ignored) {
            }
        }
    }
}
```

如果两个线程有一个没有执行 exchange 方法，则会一直等待，可以使用 `public V exchange(V x, long timeout, TimeUnit unit)` 设置最大等待时长。
## Exchanger 实现原理
Exchanger 用于线程之间两两交换数据，在多线程下，互相交换数据的两个线程是不确定的。


- 在竞争比较小的时候，采用单槽位进行交换数据。当线程来交换数据时，发现槽位为空，则自己在这里等待，否则就和槽位进行交换数据，同时会唤醒等待的线程。
- 在竞争比较激烈的情况下，就会转到多槽位的交换。
    - 当一个线程来交换的时候，如果”第一个”槽位是空的，那么自己就在那里等待
    - 如果发现”第一个”槽位有等待线程，那么就直接交换，如果交换失败，说明其它线程在进行交换，那么就往后挪一个槽位，
    如果有数据就交换，没数据就等一会，但是不会阻塞在这里。在这里等了一会，发现还没有其它线程来交换数据，那么就往“第一个”槽位的方向挪，
    如果反复这样过后，挪到了第一个槽位，没有线程来交换数据了，那么自己就在”第一个”槽位阻塞等待。

> 第一个槽位并不是指的数组中的第一个，而是逻辑第一个，因为存在伪共享，多槽位中，部分空间没有被利用。

- 更多源码详细分析参考 [Java 并发 --- Exchanger 源码分析 ](https://blog.csdn.net/u014634338/article/details/78385521)

## 应用场景
- 遗传算法
- 交互管道流设计