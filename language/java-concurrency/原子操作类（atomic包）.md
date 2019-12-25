> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程](https://review-notes.top/language/java-concurrency/)

[[toc]]
## 原子操作类说明
当程序更新一个变量时，如果是多线程同时更新这个变量，可能得到的结果与期望值不同。我们可以用 `并发关键字-volatile`、`并发关键字-synchronized`、`Lock` 来解决并发读写问题。

但是从性能及语义上可能存在以下问题：
- volatile 不能保证组合操作的原子性（比如自增操作）
- synchronized 和 Lock 比较重量级

从 java1.5 开始，jdk 提供了 java.util.concurrent.atomic 包，这个包中的原子操作类，提供了一种用法简单，性能高效，线程安全的更新一个变量的方式。
atomic 包里提供原子更新类型分别是：原子更新基本类型，原子更新数组，原子更新引用，原子更新属性，这些类都是使用 Unsafe 实现的包装类。

> 目前 jdk1.8 ， Atomic 开头的原子类，提供的方法、处理逻辑基本一致。差异部分表现在非数值类型的原子类支持自增自减操作。

> jdk1.8 中新增了高性能原子类，参考《高性能原子类》一节介绍。
## 原子更新基本类型
Atomic 包提供了以下 3 个类：
- AtomicBoolean：原子更新布尔类型。
- AtomicInteger：原子更新整型。
- AtomicLong：原子更新长整型。

***
**常用方法解释**

以上 3 个类提供的方法几乎一模一样，本节仅以 AtomicInteger 为例进行讲解。AtomicInteger 的常用方法如下:
- set : 设置为新值
- get : 获取当前的值
- getAndAdd : 设置为新值，返回旧值
- getAndIncrement : 设置为新值 (+1 操作)，返回旧值
- getAndDecrement : 设置为新值 (-1 操作)，返回旧值
- incrementAndGet : 设置为新值 (+1 操作)，返回新值
- decrementAndGet : 设置为新值 (-1 操作)，返回新值
- addAndGet : 设置为新值，返回新值
- lazySet : 最终会设置成新值，使用 lazySet 设置值后，可能导致其他 线程在之后的一小段时间内还是可以读到旧的值。[参考 ](http://ifeve.com/how-does-atomiclong-lazyset-work/)
- compareAndSet : 如果等于预期的值则设置为新值，返回是否设置成功

## 原子更新数组
原子的方式更新数组里的某个元素，Atomic 包提供了以下 3 个类：
- AtomicIntegerArray：原子更新整型数组里的元素。
- AtomicLongArray：原子更新长整型数组里的元素。
- AtomicReferenceArray：原子更新引用类型数组里的元素
***
**常用方法解释**

以上 3 个类提供的方法几乎一模一样，AtomicIntegerArray 与 AtomicInteger 常用方法基本一致，不同之处在于*基本类型类操作的是单个变量，数据类型操作的是某个下标对应的变量*。

因此在 AtomicInteger 方法的基础上增加了一个指定下标的参数，内部方法处理逻辑一致，举例说明：
```java
final AtomicInteger atomic = new AtomicInteger(1); // 基础数据类型
log.info("incrementAndGet return = {}", atomic.incrementAndGet());
log.info("get = {}", atomic.get());

final AtomicIntegerArray arrray = new AtomicIntegerArray(new int[]{1, 2, 3}); // 数组类型
log.info("incrementAndGet return = {}", arrray.incrementAndGet(1)); // 指定修改数组的下标
log.info("get = {}", arrray.get(1)); // 指定获取数组的下标
```
> 需要注意的是，数组 value 通过构造方法传递进去，然后 AtomicIntegerArray 会将当前数组复制一份，所以当 AtomicIntegerArray 对内部的数组元素进行修改时，不会影响传入的数组。
>
## 原子更新引用类型
Atomic 包提供了以下 3 个类：
- AtomicReference：原子更新引用类型。
- AtomicReferenceFieldUpdater：原子更新引用类型里的字段。
- AtomicMarkableReference：原子更新带有标记位的引用类型。可以原子更新一个布尔类型的标记位和引用类型。

支持的方法与 AtomicInteger 处理逻辑一致，举例说明：
```java
@Slf4j
public class AtomicRefExample {

    public static void main(String[] args) {
        final AtomicReference<User> reference = new AtomicReference<>(new User("liw", 28));
        final User user = reference.getAndSet(new User("Li.W", 28));
        log.info("user.getName() = {}", user.getName()); // liw
        log.info("reference.get().getName() = {}", reference.get().getName()); // Li.W


        final AtomicMarkableReference<User> markableReference =
            new AtomicMarkableReference<>(user, false);
        markableReference.compareAndSet(user, user, false, true);
        log.info("markableReference {},{}", markableReference.getReference(), markableReference.isMarked()); // true
    }

    @AllArgsConstructor
    @Getter
    private static class User {
        private String name;
        private int age;
    }
}
```
## 原子更新类属性
Atomic 包提供了以下 3 个类进行原子字段更新：
- AtomicIntegerFieldUpdater：原子更新整型的字段的更新器。
- AtomicLongFieldUpdater：原子更新长整型字段的更新器。
- AtomicStampedReference：原子更新带有版本号的引用类型。该类将整数值与引用关联起来，可用于原子的更新数据和数据的版本号，可以解决使用 CAS 进行原子更新时可能出现的 ABA 问题

要想原子地更新字段类需要两步。
1. 因为原子更新字段类都是抽象类，每次使用的时候必须使用静态方法 newUpdater 创建一个更新器，并且需要设置想要更新的类和属性。
2. 更新类的字段（属性）必须使用 public volatile 修饰符。

举例说明：
```java
@Slf4j
public class AtomicIntegerFieldUpdaterExample {

    public static void main(String[] args) {
        final AtomicIntegerFieldUpdater<User> updater =
            AtomicIntegerFieldUpdater.newUpdater(User.class, "age");
        final User user = new User("Li", 28);
        updater.set(user, 30);
        int increment = updater.incrementAndGet(user);

        log.info("increment return = {}", increment); // 31
    }
    @AllArgsConstructor
    @Getter
    private static class User {
        private String name;
        public volatile int age;
    }
}
```

## 高性能原子类
高性能原子类，是 java1.8 中增加的原子类，它们使用分段的思想，把不同的线程 hash 到不同的段上去更新，最后再把这些段的值相加得到最终的值，这些类主要有：

Striped64 下面四个类的子类：
- LongAccumulator： long 类型的聚合器，需要传入一个 long 类型的二元操作，可以用来计算各种聚合操作，包括加乘等。
- LongAdder： long 类型的累加器，LongAccumulator 的特例，只能用来计算加法，且从 0 开始计算。
- DoubleAccumulator： double 类型的聚合器，需要传入一个 double 类型的二元操作，可以用来计算各种聚合操作，包括加乘等。
- DoubleAdder： double 类型的累加器，DoubleAccumulator 的特例，只能用来计算加法，且从 0 开始计算。

这几个类的操作基本类似，其中 DoubleAccumulator 和 DoubleAdder 底层其实也是用 long 来实现的，基本用法如下：
```java
@Slf4j
public class Striped64Example {

    public static void main(String[] args) {
        final LongAdder longAdder = new LongAdder();
        longAdder.increment();
        longAdder.add(666);
        System.out.println(longAdder.sum());
        log.info("longAdder.sum() = {}", longAdder.sum()); // 667

        final LongAccumulator longAccumulator =
            new LongAccumulator((left, right) -> left + right * 2, 666);
        longAccumulator.accumulate(1);
        longAccumulator.accumulate(3);
        longAccumulator.accumulate(-4);
        log.info("longAccumulator.get() = {}", longAccumulator.get()); // 666
    }
}
```

## 总结思考
- Unsafe 的 CAS 操作？
- 原子操作是什么？
- ABA 的解决方法？
- CAS 操作存在的问题是？
- AtomicStampedReference 是怎么解决 ABA 的？
- AtomicInteger 怎么实现原子操作的？
- AtomicInteger 主要解决了什么问题？
- AtomicInteger 有哪些缺点？

- [死磕 java 并发包之 LongAdder 源码分析 ](https://mp.weixin.qq.com/s/_-z1Bz2iMiK1tQnaDD4N6Q)