
[[toc]]  
## volatile 的特性
Java 的 volatile 关键字用于标记一个变量“应当存储在主存”。更确切地说，每次读取 volatile 变量，都应该从主存读取，而不是从 CPU 缓存读取。每次写入一个 volatile 变量，应该写到主存中，而不是仅仅写到 CPU 缓存。

实际上，从 Java 5 开始，volatile 关键字除了保证 volatile 变量从主存读写外，还提供了更多的保障。
### 变量可见性问题
Java 的 volatile 关键字能保证变量修改后，对各个线程是可见的

## 写-读建立的 happens-before 关系
从 JSR-133 开始 (即从 JDK5 开始)，volatile 变量的写-读可以实现线程之间的通信。从内存语义的角度来说：
- volatile 的写-读与锁的释放-获取有相同的内存效果:
- volatile 写和锁的释放有相同的内存语义；volatile 读与锁的获取有相同的内存语义。

```java
public class VolatileExample {
    int a = 0;  // 普通共享变量
    volatile boolean flag = false; // volatile 共享变量

    public void writer() {       // 写线程 A 操作
        a = 1;                   //1
        flag = true;             //2
    }

    public void reader() {       // 读线程 B 操作
        if (flag) {              //3
            int i = a;           //4
            System.out.printf(String.valueOf(i));
            // do something ...
        }
    }
}
```

假设线程 A 执行 writer() 方法之后，线程 B 执行 reader() 方法。    
根据 happens-before 规则，这个过程建立的 happens-before 关系可以分为 3 类:
1. 根据程序次序规则，1 happens-before 2;3 happens-before 4。 
2. 根据 volatile 规则，2 happens-before 3。 
3. 根据 happens-before 的传递性规则，1 happens-before 4。 

上述 happens-before 关系的图形化表现形式如下：  
<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/volatile-happens-before关系.png" width="450px">
</div>

在上图中，每一个箭头链接的两个节点，代表了一个 happens-before 关系。
- **黑色箭头**：表示程序顺序规则;
- **橙色箭头**：表示 volatile 规则;
- **蓝色箭头**：表示组合这些规则后提供的 happens-before 保证。
***
这里 A 线程写一个 volatile 变量后，B 线程读同一个 volatile 变量。A 线程在写 volatile 变量之 前所有可见的共享变量，在 B 线程读同一个 volatile 变量后，将立即变得对 B 线程可见。

## 写-读的内存语义
1. volatile 写的内存语义：当写一个 volatile 变量时，JMM 会把该线程对应的本地内存中的共享变量值刷新到主内存
2. volatile 读的内存语义：当读一个 volatile 变量时，JMM 会把该线程对应的本地内存置为无效。线程接下来将从主内存中读取共享变量。

<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/volatile写-读的内存语义.png" width="450px">
</div>

如果我们把 volatile 写和 volatile 读两个步骤综合起来看的话，在读线程 B 读一个 volatile 变量后，写线程 A 在写这个 volatile 变量之前所有可见的共享变量的值都将立即变得对读线程 B 可见。
***
下面对 volatile 写和 volatile 读的内存语义做个总结。 
- 线程 A 写一个 volatile 变量，实质上是线程 A 向接下来将要读这个 volatile 变量的某个线程发出了 (其对共享变量所做修改的) 消息。 
- 线程 B 读一个 volatile 变量，实质上是线程 B 接收了之前某个线程发出的 (在写这个 volatile 变量之前对共享变量所做修改的) 消息。
- 线程 A 写一个 volatile 变量，随后线程 B 读这个 volatile 变量，这个过程实质上是线程 A 通过主内存向线程 B 发送消息。

## 内存语义的实现？
JMM 如何实现 volatile 写/读的内存语义？基础概念提到过重排序分为编译器重排序和处理器重排序。为了实现 volatile 内存语义，JMM 会分别限制这两种类型的重排序类型。

该表为 JMM 针对编译器制定的 volatile 重排序规则：  
<div align="left">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/volatile重排序规则表.png">
</div>

- 当第二个操作是 volatile 写时，不管第一个操作是什么，都不能重排序。这个规则确保 volatile 写之前的操作不会被编译器重排序到 volatile 写之后。 
- 当第一个操作是 volatile 读时，不管第二个操作是什么，都不能重排序。这个规则确保 volatile 读之后的操作不会被编译器重排序到 volatile 读之前。
- 当第一个操作是 volatile 写，第二个操作是 volatile 读时，不能重排序。

***

对于编译器来说，发现一个最优布置来最小化插入屏障的总数几乎不可能。为此，JMM 采取保守策略。下面是基于保守策略的 JMM 内存屏障插入策略：
- 在每个 volatile 写操作的前面插入一个 StoreStore 屏障。
- 在每个 volatile 写操作的后面插入一个 StoreLoad 屏障。
- 在每个 volatile 读操作的后面插入一个 LoadLoad 屏障。
- 在每个 volatile 读操作的后面插入一个 LoadStore 屏障。  

上述内存屏障插入策略非常保守，但它可以保证在任意处理器平台，任意的程序中都能得到正确的 volatile 内存语义。  
***
在实际执行时，只要不改变 volatile 写-读的内存语义，编译器可以根据具体情况省略不必要的屏障。  
《final 域的内存语义#final 语义在处理器中的实现》提到过，X86 处理器仅会对写-读操作做重排序。X86 不会对读-读、读-写和写-写操作做重排序，因此在 X86 处理器中会省略掉这 3 种操作类型对应的内存屏障。  
在 X86 中，JMM 仅需在 volatile 写后面插入一个 StoreLoad 屏障即可正确实现 volatile 写-读的内存语义。  
这意味着在 X86 处理器中 volatile 写的开销比 volatile 读的开销会大很多 (因为执行 StoreLoad 屏障开销会比较大)。

### 写插入内存屏障后生成的指令序列
volatile 写插入内存屏障后生成的指令序列示意图如下：

<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/volatile写插入内存屏障后生成的指令序列示意图.png" width="550px">
</div>

图中的 StoreStore 屏障可以保证在 volatile 写之前，其前面的所有普通写操作已经对任意处理器可见了。这是因为 StoreStore 屏障将保障上面所有的普通写在 volatile 写之前刷新到主内存。  

volatile 写后面的 StoreLoad 屏障作用是避免 volatile 写与后面可能有的 volatile 读/写操作重排序。  
因为编译器常常无法准确判断在一个 volatile 写的后面 是否需要插入一个 StoreLoad 屏障 (比如，一个 volatile 写之后方法立即 return)。
为了保证能正确实现 volatile 的内存语义，JMM 在采取了保守策略:在每个 volatile 写的后面，或者在每个 volatile 读的前面插入一个 StoreLoad 屏障。
从整体执行效率的角度考虑，JMM 最终选择了在每个 volatile 写的后面插入一个 StoreLoad 屏障。因为 volatile 写-读内存语义的常见使用模式是:一个写线程写 volatile 变量，多个读线程读同一个 volatile 变量。当读线程的数量大大超过写线程时，选择在 volatile 写之后插入 StoreLoad 屏障将带来可观的执行效率的提升。从这里可以看到 JMM 在实现上的一个特点:首先确保正确性，然后再去追求执行效率。

### 读插入内存屏障后生成的指令序列
volatile 读插入内存屏障后生成的指令序列示意图如下：

<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/volatile读插入内存屏障后生成的指令序列示意图.png" width="550px">
</div>

图中的 LoadLoad 屏障用来禁止处理器把上面的 volatile 读与下面的普通读重排序。LoadStore 屏障用来禁止处理器把上面的 volatile 读与下面的普通写重排序。

## JSR-133 为什么要增强 volatile 内存语义

## 何时使用 volatile ?

## volatile 的性能考量

## 参考
- [http://tutorials.jenkov.com/java-concurrency/volatile.html](http://tutorials.jenkov.com/java-concurrency/volatile.html)