> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程 ](https://review-notes.top/language/java-concurrency/)

[toc]
## CAS 是什么
CAS 是英文单词 Compare And Swap 的缩写，翻译过来就是比较并替换。Java 的 compareAndSet(jdk13)/compareAndSwap(jdk1.8) 相关方法调用简称为 CAS。

CAS 机制当中使用了 3 个基本操作数：内存地址 V，旧的预期值 A，要修改的新值 B。更新一个变量的时候，只有当变量的预期值 A 和内存地址 V 当中的实际值相同时，才会将内存地址 V 对应的值修改为 B。

CAS 操作的是乐观锁，每次不加锁而是假设没有冲突而去完成某项操作，如果因为冲突失败就重试，直到成功为止。

> JDK 文档对 compareAndSet() 方法说明：如果当前状态值等于预期值，则以原子方式将同步状态 设置为给定的更新值。此操作具有 volatile 读和写的内存语义。

## CAS 方法解读
以 Unsafe#compareAndSetInt 方法为例进行说明
```java
    @HotSpotIntrinsicCandidate
    public final native boolean compareAndSwapInt(Object o, long offset,
                                                 int expected,
                                                 int x);
```
方法解读：
- o 是操作的对象
- offset 是 o 对象中某字段在内存中的偏移量（比如对象 AtomicInteger 中有一个 `volatile int value` 的字段）
- 读取传入对象 o 在内存中偏移量为 offset 位置的值与期望值 expected 作比较。
- 相等就把 x 值赋值给 offset 位置的值。方法返回 true。
- 不相等，就取消赋值，方法返回 false。

***

实际使用示例（AtomicInteger#compareAndSet）：
```java
public class AtomicInteger extends Number implements java.io.Serializable {
    // Unsafe 类定义
    private static final Unsafe unsafe = Unsafe.getUnsafe();
    // 获取变量 value 在内存中对应的地址偏移量
    private static final long valueOffset;

    static {
        try {
            valueOffset = unsafe.objectFieldOffset // 内存中对应的地址偏移量获取
                (AtomicInteger.class.getDeclaredField("value"));
        } catch (Exception ex) { throw new Error(ex); }
    }
    private volatile int value;
        
    // expectedValue 预期值、newValue 修改值
    public final boolean compareAndSet(int expect, int update) {
        return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
    }
```
## CAS 实现原理
分析 Java 中`Unsafe#compareAndSwapInt`方法。  
native 方法最终调用实现`hotspot/src/os_cpu/linux_x86/vm/atomic_linux_x86.inline.hpp`中`Atomic::cmpxchg`实现
```c
inline jint Atomic::cmpxchg(jint exchange_value, volatile jint* dest, jint compare_value) {
  int mp = os::is_MP();
  __asm__ volatile (LOCK_IF_MP(%4) "cmpxchgl %1,(%3)"
                    : "=a" (exchange_value)
                    : "r" (exchange_value), "a" (compare_value), "r" (dest), "r" (mp)
                    : "cc", "memory");
  return exchange_value;
}
```
程序会根据当前处理器的类型来决定是否为 cmpxchg 指令添加 lock 前缀。
- 如果程序是在多处理器上运行，就为 cmpxchg 指令加上 lock 前缀 (Lock Cmpxchg)。
- 如果程序是在单处理器上运行，就省略 lock 前缀 (单处理器自身会维护单处理器内的顺序一致性，不需要 lock 前缀提供的内存屏障效果)。

***

intel 的手册对 lock 前缀的说明如下：
1. 确保对内存的读-改-写操作原子执行。在 Pentium 及 Pentium 之前的处理器中，带有 lock 前缀的指令在执行期间会锁住总线，使得其他处理器暂时无法通过总线访问内存。很显然，这会带来昂贵的开销。从 Pentium 4、Intel Xeon 及 P6 处理器开始，Intel 使用缓存锁定 (Cache Locking) 来保证指令执行的原子性。缓存锁定将大大降低 lock 前缀指令的执行开销。
2. 禁止该指令，与之前和之后的读和写指令重排序。
3. 把写缓冲区中的所有数据刷新到内存中。

上面的第 2 点和第 3 点所具有的内存屏障效果，足以同时实现 volatile 读和 volatile 写的内存语义。

经过上面的分析，现在我们终于能明白为什么 JDK 文档说 CAS 同时具有 volatile 读和 volatile 写的内存语义了。

## CAS 实现原子操作的三大问题
### 问题一：ABA 问题
因为 CAS 需要在操作值的时候，检查值有没有发生变化，如果没有发生变化则更新，但是如果一个值原来是 A，变成了 B，又变成了 A，那么使用 CAS 进行检查时会发现它的值没有发生变化，但是实际上却变化了。

ABA 问题的解决思路就是使用版本号。在变量前面 追加上版本号，每次变量更新的时候把版本号加 1，那么 A→B→A 就会变成 1A→2B→3A。从 Java 1.5 开始，JDK 的 Atomic 包里提供了一个类 AtomicStampedReference 来解决 ABA 问题。
这个类的 compareAndSet 方法的作用是首先检查当前引用是否等于预期引用，并且检查当前标志是否等于预期标志，如果全部相等，则以原子方式将该引用和该标志的值设置为给定的更新值。

### 问题二：循环时间长开销大
自旋 CAS 如果长时间不成功，会给 CPU 带来非常大的执行开销。  
如果 JVM 能支持处理器提供的 pause 指令，那么效率会有一定的提升。
pause 指令有两个作用:
1. 它可以延迟流水线执行指令 (de-pipeline)，使 CPU 不会消耗过多的执行资源，延迟的时间取决于具体实现的版本，在一些处理器上延迟时间是零;
2. 它可以避免在退出循环的时候因内存顺序冲突 (Memory Order Violation) 而引起 CPU 流水线被清空 (CPU Pipeline Flush)，从而提高 CPU 的执行效率。

### 问题三：只能保证一个共享变量的原子操作
当对一个共享变量执行操作时，我们可以使用循环 CAS 的方式来保证原子操作，但是对多个共享变量操作时，循环 CAS 就无法保证操作的原子性，这个时候就可以**用锁**。

还有一个取巧的办法，就是把多个共享变量**合并成一个共享变量来操作**。比如，有两个共享变量 i=2，j=a，合并一下 ij=2a，然后用 CAS 来操作 ij。从 Java 1.5 开始，JDK 提供了 AtomicReference 类来保证引用对象之间的原子性，就可以把多个变量放在一个对象里来进行 CAS 操作。

## 使用场景
- 参考 `CAS 实现原子操作的三大问题`，保证存在问题与需求不会冲突
- 我们在并发修改单个变量时，是否需要**先比较再修改**（!!!重点），如果不需要那 `volatile` 是否满足需求 ？

## 参考
- 并发编程的艺术
- [Java CAS 原理剖析 ](https://juejin.im/post/5a73cbbff265da4e807783f5)