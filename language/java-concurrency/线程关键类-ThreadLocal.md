> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程](https://review-notes.top/language/java-concurrency/)

[[toc]]
## ThreadLocal 是什么
ThreadLocal 提供了线程内存储变量的能力，这些变量不同之处在于每一个线程读取的变量是对应的、互相独立的。通过 get 和 set 方法就可以得到当前线程对应的值。

## ThreadLocal 怎么用
- 通过 set(T) 方法来设置一个值
- 在当前线程下再通过 get() 方法获取到原先设置的值

## ThreadLocal 怎么实现的
ThreadLocal 表示每个线程存储的数据类型 T ，每个线程在一个 ThreadLocal 实例上只能存储一个值。

> 如果我们在线程上要存储多个数据值时，可以创建多个 ThreadLocal 实例。

<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/ThreadLocal-结构图.jpeg">
</div>

源码解析：
- ThreadLocal set/get 方法源码解析：
```java
public class ThreadLocal<T> {
    public void set(T value) {
        Thread t = Thread.currentThread(); // 获取当前线程
        ThreadLocalMap map = getMap(t);    // 获取当前线程内部维护的 threadLocals
        if (map != null) {                 // 如果为空进行初始化，不为空进行设值
            map.set(this, value);
        } else {
            createMap(t, value);
        }
    }
    
    ThreadLocalMap getMap(Thread t) {     // 获取当前线程内部维护的 threadLocals
        return t.threadLocals;
    }
    
    void createMap(Thread t, T firstValue) {  // 初始化线程内部维护的 threadLocals
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }
    
    public T get() {                       
        Thread t = Thread.currentThread();   // 获取当前线程
        ThreadLocalMap map = getMap(t);
        if (map != null) {
            ThreadLocalMap.Entry e = map.getEntry(this); // 不为空时获取对应 value
            if (e != null) {
                @SuppressWarnings("unchecked")
                T result = (T)e.value;
                return result;
            }
        }
        return setInitialValue(); // 为空时获取初始化的 value 返回，初始化 value 默认为 null
    }
}  
```

***

- ThreadLocalMap set/getEntry  方法源码解析：
```java
private void set(ThreadLocal<?> key, Object value) {

    Entry[] tab = table;
    int len = tab.length;
    int i = key.threadLocalHashCode & (len-1);  //获取索引值

    for (Entry e = tab[i]; 
        e != null;
        e = tab[i = nextIndex(i, len)]) { // 遍历 tab 如果已经存在则更新值
       ThreadLocal<?> k = e.get();

       if (k == key) {
         e.value = value;
         return;
       }

       if (k == null) {
         replaceStaleEntry(key, value, i);
         return;
       }
    }

    tab[i] = new Entry(key, value); // 如果上面没有遍历成功则创建新值
    int sz = ++size;
    if (!cleanSomeSlots(i, sz) && sz >= threshold) // 满足条件数组扩容 *2
       rehash();
}

private Entry getEntry(ThreadLocal<?> key) {
    int i = key.threadLocalHashCode & (table.length - 1); //获取索引值
    Entry e = table[i];
    if (e != null && e.get() == key)
        return e;
    else
    return getEntryAfterMiss(key, i, e);
}
```

***

- 为什么通过 `int i = key.threadLocalHashCode & (len-1);` 获取索引值？
```java
public class ThreadLocal<T> {
    private final int threadLocalHashCode = nextHashCode();

    private static AtomicInteger nextHashCode =
        new AtomicInteger();

    private static final int HASH_INCREMENT = 0x61c88647;

    private static int nextHashCode() {
        return nextHashCode.getAndAdd(HASH_INCREMENT);
    }
}
```
因为 static 的原因，在每次 new ThreadLocal 时因为 threadLocalHashCode 的初始化，会使 threadLocalHashCode 值自增一次，增量为 0x61c88647。

0x61c88647 是斐波那契散列乘数,它的优点是通过它散列 (hash) 出来的结果分布会比较均匀，可以很大程度上避免 hash 冲突。

> 以初始容量 16 为例，hash 并与 15 位运算计算数组下标结果如下:
>
>hashCode => 数组下标
>- 0x61c88647 => 7
>- 0xc3910c8e => 14
>- 0x255992d5 => 5
>- 0x8722191c => 12
>- 0xe8ea9f63 => 3
>- 0x4ab325aa => 10
>- 0xac7babf1 => 1
>- 0xe443238 => 8
>- 0x700cb87f => 15

## 应用场景
- 某些数据是以线程为作用域并且不同线程具有不同的数据副本的时候，就可以考虑采用 ThreadLocal
- 线程之间的通信
- AOP 切面编程，记录线程执行耗时情况

## 参考
- 并发编程的艺术
- [简书-ThreadLocal](https://www.jianshu.com/p/3c5d7f09dfbd)