
[[toc]]  
## volatile
介绍volatile的内存语义及volatile内存语义的实现

## volatile的特性
Java的volatile关键字用于标记一个变量“应当存储在主存”。更确切地说，每次读取volatile变量，都应该从主存读取，而不是从CPU缓存读取。每次写入一个volatile变量，应该写到主存中，而不是仅仅写到CPU缓存。

实际上，从Java 5开始，volatile关键字除了保证volatile变量从主存读写外，还提供了更多的保障。
### 变量可见性问题
Java的volatile关键字能保证变量修改后，对各个线程是可见的

## volatile写-读建立的happens-before关系
从JSR-133开始(即从JDK5开始)，volatile变量的写-读可以实现线程之间的通信。从内存语义的角度来说：
- volatile的写-读与锁的释放-获取有相同的内存效果:
- volatile写和锁的释放有相同的内存语义;volatile读与锁的获取有相同的内存语义。

```java
public class VolatileExample {
    int a = 0;  // 普通共享变量
    volatile boolean flag = false; // volatile共享变量

    public void writer() {       // 写线程A操作
        a = 1;                   //1
        flag = true;              //2
    }

    public void reader() {       // 读线程B操作
        if (flag) {               //3
            int i = a;           //4
            System.out.printf(String.valueOf(i));
            // do ...
        }
    }
}
```

假设线程A执行writer()方法之后，线程B执行reader()方法。根据happens-before规则，这个过程建立的happens-before关系可以分为3类:
1. 根据程序次序规则，1 happens-before 2;3 happens-before 4。 
2. 根据volatile规则，2 happens-before 3。 
3. 根据happens-before的传递性规则，1 happens-before 4。 

上述happens-before关系的图形化表现形式如下：  
![volatile-happens-before关系](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/volatile-happens-before关系.png)

在上图中，每一个箭头链接的两个节点，代表了一个happens-before关系。
- 黑色箭头表示程 序顺序规则;
- 橙色箭头表示volatile规则;
- 蓝色箭头表示组合这些规则后提供的happens-before保证。
***
这里A线程写一个volatile变量后，B线程读同一个volatile变量。A线程在写volatile变量之 前所有可见的共享变量，在B线程读同一个volatile变量后，将立即变得对B线程可见。

## volatile写-读的内存语义
1. volatile写的内存语义：当写一个volatile变量时，JMM会把该线程对应的本地内存中的共享变量值刷新到主内存
2. volatile读的内存语义：当读一个volatile变量时，JMM会把该线程对应的本地内存置为无效。线程接下来将从主内存中读取共享变量。

![volatile写-读的内存语义](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/volatile写-读的内存语义.png)

如果我们把volatile写和volatile读两个步骤综合起来看的话，在读线程B读一个volatile变量后，写线程A在写这个volatile变量之前所有可见的共享变量的值都将立即变得对读线程B可见。
***
下面对volatile写和volatile读的内存语义做个总结。 
- 线程A写一个volatile变量，实质上是线程A向接下来将要读这个volatile变量的某个线程发出了(其对共享变量所做修改的)消息。 
- 线程B读一个volatile变量，实质上是线程B接收了之前某个线程发出的(在写这个volatile变量之前对共享变量所做修改的)消息。
- 线程A写一个volatile变量，随后线程B读这个volatile变量，这个过程实质上是线程A通过主内存向线程B发送消息。

## volatile内存语义的实现？
JMM如何实现volatile写/读的内存语义？基础概念提到过重排序分为编译器重排序和处理器重排序。为了实现volatile内存语义，JMM会分别限制这两种类型的重排序类型。

该表为JMM针对编译器制定的volatile重排序规则：  
![volatile重排序规则表](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/volatile重排序规则表.png)

- 当第二个操作是volatile写时，不管第一个操作是什么，都不能重排序。这个规则确保volatile写之前的操作不会被编译器重排序到volatile写之后。 
- 当第一个操作是volatile读时，不管第二个操作是什么，都不能重排序。这个规则确保volatile读之后的操作不会被编译器重排序到volatile读之前。
- 当第一个操作是volatile写，第二个操作是volatile读时，不能重排序。

***

对于编译器来说，发现一个最优布置来最小化插入屏障的总数几乎不可能。为此，JMM采取保守策略。下面是基于保守策略的JMM内存屏障插入策略：
- 在每个volatile写操作的前面插入一个StoreStore屏障。
- 在每个volatile写操作的后面插入一个StoreLoad屏障。
- 在每个volatile读操作的后面插入一个LoadLoad屏障。
- 在每个volatile读操作的后面插入一个LoadStore屏障。  

上述内存屏障插入策略非常保守，但它可以保证在任意处理器平台，任意的程序中都能得到正确的volatile内存语义。  
***
在实际执行时，只要不改变volatile写-读的内存语义，编译器可以根据具体情况省略不必要的屏障。  
《final域的内存语义#final语义在处理器中的实现》提到过，X86处理器仅会对写-读操作做重排序。X86不会对读-读、读-写和写-写操作做重排序，因此在X86处理器中会省略掉这3种操作类型对应的内存屏障。  
在X86中，JMM仅需在volatile写后面插入一个StoreLoad屏障即可正确实现volatile写-读的内存语义。  
这意味着在X86处理器中volatile写的开销比volatile读的开销会大很多(因为执行StoreLoad屏障开销会比较大)。

### volatile写插入内存屏障后生成的指令序列
volatile写插入内存屏障后生成的指令序列示意图如下：

![volatile写插入内存屏障后生成的指令序列示意图](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/volatile写插入内存屏障后生成的指令序列示意图.png)

图中的StoreStore屏障可以保证在volatile写之前，其前面的所有普通写操作已经对任意处理器可见了。这是因为StoreStore屏障将保障上面所有的普通写在volatile写之前刷新到主内存。  

volatile写后面的StoreLoad屏障作用是避免volatile写与后面可能有的volatile读/写操作重排序。  
因为编译器常常无法准确判断在一个volatile写的后面 是否需要插入一个StoreLoad屏障(比如，一个volatile写之后方法立即return)。
为了保证能正确实现volatile的内存语义，JMM在采取了保守策略:在每个volatile写的后面，或者在每个volatile 读的前面插入一个StoreLoad屏障。
从整体执行效率的角度考虑，JMM最终选择了在每个volatile写的后面插入一个StoreLoad屏障。因为volatile写-读内存语义的常见使用模式是:一个写线程写volatile变量，多个读线程读同一个volatile变量。当读线程的数量大大超过写线程时，选择在volatile写之后插入StoreLoad屏障将带来可观的执行效率的提升。从这里可以看到JMM在实现上的一个特点:首先确保正确性，然后再去追求执行效率。

### volatile读插入内存屏障后生成的指令序列
volatile读插入内存屏障后生成的指令序列示意图如下：

![volatile读插入内存屏障后生成的指令序列示意图](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/volatile读插入内存屏障后生成的指令序列示意图.png)

图中的LoadLoad屏障用来禁止处理器把上面的volatile读与下面的普通读重排序。LoadStore屏障用来禁止处理器把上面的volatile读与下面的普通写重排序。

## JSR-133为什么要增强volatile的内存语义

## 何时使用volatile

## volatile的性能考量

## 参考
- [http://tutorials.jenkov.com/java-concurrency/volatile.html](http://tutorials.jenkov.com/java-concurrency/volatile.html)