> 专栏原创出处：[源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，转载请附上原文出处链接和本声明。

[[toc]]  
## 1 final 域的内存语义
对 final 域的读和写更像是普通的变量访问。下面将介绍 final 域的内存语义。  

```java
public class FinalExample {
    int i;                        //普通变量
    final int j;                   //final 变量
    final int[] intArray;          //final 是引用类型
    static FinalExample obj;

    public FinalExample() {       //构造函数
        i = 1;                    //写普通域
        j = 2;                    //写 final 域
        intArray = new int[2];    //写 final 引用类型域步骤 1
        intArray[0] = 1;          //写 final 引用类型域步骤 2
        intArray[1] = 2;          //写 final 引用类型域步骤 3
    }

    public static void writer() { //写线程 A 执行
        obj = new FinalExample();
    }

    public static void reader() {  //读线程 B 执行
        FinalExample object = obj; //读对象引用
        int a = object.i;          //读普通域
        int b = object.j;          //读 final 域
        int c = object.intArray[0];//读 final 引用类型域
    }
}
```
## 2 final 域的重排序规则
对于 final 域，编译器和处理器要遵守两个重排序规则。

1. 在构造函数内对一个 final 域的写入，与随后把这个被构造对象的引用赋值给一个引用变量，这两个操作之间不能重排序。
2. 初次读一个包含 final 域的对象的引用，与随后初次读这个 final 域，这两个操作之间不能重排序。


## 3 写 final 域的重排序规则
写 final 域的重排序规则禁止把 final 域的写重排序到构造函数之外。这个规则的实现包含下面 2 个方面。
1. JMM 禁止编译器把 final 域的写重排序到构造函数之外。
2. 编译器会在 final 域的写之后，构造函数 return 之前，插入一个 StoreStore 屏障。这个屏障禁止处理器把 final 域的写重排序到构造函数之外。

***
分析`示例代码 FinalExample`中`writer`方法包含 2 个操作（省略引用类型 final 域分析）：
1. 构造一个 FinalExample 对象
2. 构造出来对象赋值给 obj

假设执行顺序为：线程 A-> 线程 B
- 写普通域的操作被编译器重排序到了构造函数之外，读线程 B 错误地读取了普通变量 i 初始化之前的值。
- 写 final 域的操作，被写 final 域的重排序规则“限定”在了构造函数之内，读线程 B 正确地读取了 final 变量初始化之后的值

实际的执行时序可能如图：  
<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/final-写final域的重排序规则.png" width="550px">
</div>

**总结为**：在对象引用为任意线程可见之前，对象的 final 域已经被 正确初始化过了，而普通域不具有这个保障

## 4 读 final 域的重排序规则
读 final 域的重排序规则是，在一个线程中，初次读对象引用与初次读该对象包含的 final 域，JMM 禁止处理器重排序这两个操作 (注意，这个规则仅仅针对处理器)。编译器会在读 final 域操作的前面插入一个 LoadLoad 屏障

***
分析`示例代码 FinalExample`中`reader`方法包含 3 个操作（省略引用类型 final 域分析）：
1. 初次读引用变量 obj。 
2. 初次读引用变量 obj 指向对象的普通域 j。 
3. 初次读引用变量 obj 指向对象的 final 域 i。

假设执行顺序为：线程 A-> 线程 B
- 读对象的普通域的操作被处理器重排序到读对象引用之前。读普通域时，该域还没有被写线程 A 写入，这是一个错误的读取操作。
- 读 final 域的重排序规则会把读对象 final 域的操作“限定”在读对象引用之后，此时该 final 域已经被 A 线程初始化过了，这是一个正确的读取操作。

实际的执行时序可能如图：  
<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/final-读final域的重排序规则.png" width="550px">
</div>
**总结为**：在读一个对象的 final 域之前，一定会先读包含这个 final 域的对象的引用

## 5 final 域为引用类型
对于引用类型，写 final 域的重排序规则对编译器和处理器增加了如下约束:  
在构造函数内对一个 final 引用的对象的成员域的写入，与随后在构造函数外把这个被构造对象的引用赋值给一个引用变量，这两个操作之间不能重排序。

`示例代码 FinalExample`中以下 3 个步骤为构造函数中对一个 final 引用的对象的成员域的写入操作，任何一个操作不可与`obj = new FinalExample()`操作重排序
>intArray = new int[2];    //写 final 引用类型域步骤 1  
>intArray[0] = 1;          //写 final 引用类型域步骤 2  
>intArray[1] = 2;          //写 final 引用类型域步骤 3  
## 6 为什么 final 引用不能从构造函数内“逸出”
前面提到过，写 final 域的重排序规则可以确保：`在引用变量为任意线程可见之前，该引用变量指向的对象的 final 域已经在构造函数中被正确初始化过了`。  
其实要得到这个效果，还需要一个保证：`在构造函数内部，不能让这个被构造对象的引用为其他线程可见，也就是对象引用不能在构造函数中“逸出”`。
```java
class FinalReferenceEscapeExample {
    final int i;
    static FinalReferenceEscapeExample obj;

    public FinalReferenceEscapeExample() {
        i = 1;                              //1 写 final 域
        obj = this;                         //2 this 引用在此“逸出”
    }

    public static void writer() {
        new FinalReferenceEscapeExample();
    }

    public static void reader() {
        if (obj != null) {                   //3
            int temp = obj.i;                //4
        }
    }
}
```
Find-Bugs 针对`obj = this`坏味道代码检测[静态变量在构造函数初始化问题 ](http://findbugs.sourceforge.net/bugDescriptions.html#ST_WRITE_TO_STATIC_FROM_INSTANCE_METHOD)

实际的执行时序可能如图：  
<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/final-final引用不能从构造函数内溢出.png" width="550px">
</div>
::: warning
**总结为**：被构造对象的引用在构造函数**不要发生**“逸出”问题！!
:::
## 7 final 语义在处理器中的实现
说明 final 语义在处理器中的具体实现。上面我们提到：
- 写 final 域的重排序规则会要求编译器在 final 域的写之后，构造函数 return 之前插入一个 StoreStore 障屏。
- 读 final 域的重排序规则要求编译器在读 final 域的操作前面插入一个 LoadLoad 屏障。  
### 7.1 X86 处理器实现
- 由于 X86 处理器不会对写-写操作做重排序，所以在 X86 处理器中，写 final 域需要的 StoreStore 障屏会被省略掉。
- 由于 X86 处理器不会对存在间接依赖关系的操作做重排序， 所以在 X86 处理器中，读 final 域需要的 LoadLoad 屏障也会被省略掉。  
**总结为**：在 X86 处理器中，final 域的读/写不会插入任何内存屏障!

## 8 JSR-133 为什么要增强 final 的语义
在旧的 Java 内存模型中，一个最严重的缺陷就是线程可能看到 final 域的值会改变。比如：
- 一个线程当前看到一个整型 final 域的值为 0(还未初始化之前的默认值)，过一段时间之后这个线程再去读这个 final 域的值时，却发现值变为 1(被某个线程初始化之后的值)。
- String 的值可能会改变。
***
为了修补这个漏洞，JSR-133 专家组增强了 final 的语义。通过为 final 域增加写和读重排序规则，可以为 Java 程序员提供初始化安全保证: 只要对象是正确构造的 (被构造对象的引用在构造函数中没有“逸出”)，那么不需要使用同步 (指 lock 和 volatile 的使用) 就可以保证任意线程都能看到这个 final 域在构造函数中被初始化之后的值。

## 参考
- 《Java 并发编程的艺术》