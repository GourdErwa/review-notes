> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-jvm) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-jvm)，欢迎 Star，转载请附上原文出处链接和本声明。

Java JVM-虚拟机专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java JVM-虚拟机 ](https://review-notes.top/language/java-jvm/)

[toc]

## 前言
实际代码执行过程中经常遇到 OOM 相关异常，本篇内容基于 JDK13 总结各种 OOM 相关联内存区域。方便定位是哪一块内存区域的问题，然后进行参数调优。

## OutOfMemoryError 相关异常
一般情况下，OutOfMemoryError 异常后会跟随「Java heap space」描述。具体的异常定位还需要参考调用链「at ...」部分来定位。

OutOfMemoryError 涉及的异常情况较多，可使用查找定位本节内容列出的异常情况。

### Java 堆内存溢出
可通过 `-Xms20m -Xmx20m` 设置堆大小。

```java
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
	at io.gourd.java.jvm.oom.HeapOOM$OomObj.<init>(HeapOOM.java:19)
	at io.gourd.java.jvm.oom.HeapOOM.main(HeapOOM.java:27)
```

### 字符串常量池溢出
自 JDK 7 起，原本存放在永久代的字符串常量池被移至 Java 堆之中，所以在 JDK 7 及以上版本，限制方法区的容量对该测试用例来说是毫无意义的。

> 永久代和元空间只是《Java 虚拟机规范》方法区规范的实现，如果还在纠结这些概念可参考我 jvm 专栏的《运行时内存数据区域》内容

```java
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
    at java.util.HashMap.resize(HashMap.java:704)
    at java.util.HashMap.putVal(HashMap.java:663)

// 或者

Exception in thread 「main」 java.lang.OutOfMemoryError: Java heap space 
    at java.base/java.lang.Integer.toString（Integer.java:440） 
    at java.base/java.lang.String.valueOf（String.java:3058）
```

### 方法区出现内存溢出 Metaspace 或者 PermGen space
当前的很多主流框架，如 Spring、Hibernate 对类进行增强时，都会使用到 CGLib 这类字节码技术，当增强的类越多，就需要越大的方法区以保证动态生成的新类型可以载入内存。

> PermGen space 是 JDK8 前永久代的异常，Metaspace 是 JDK8 后的元空间异常，其实都是虚拟机规范方法区的标准实现
```java
Caused by: java.lang.OutOfMemoryError: PermGen space  --- JDK8 以上 Metaspace
    at java.lang.ClassLoader.defineClass1(Native Method)
    at java.lang.ClassLoader.defineClassCond(ClassLoader.java:632)
    at java.lang.ClassLoader.defineClass(ClassLoader.java:616)
```
- -XX：MaxMetaspaceSize：设置元空间最大值，默认是-1，即不限制，或者说只受限于本地内存大小。

- -XX：MetaspaceSize：指定元空间的初始空间大小，以字节为单位，达到该值就会触发垃圾收集进行类型卸载，同时收集器会对该值进行调整：如果释放了大量的空间，就适当降低该值；如果释放了很少的空间，那么在不超过-XX：MaxMetaspaceSize（如果设置了的话）的情况下，适当提高该值。

- -XX：MinMetaspaceFreeRatio：作用是在垃圾收集之后控制最小的元空间剩余容量的百分比，可减少因为元空间不足导致的垃圾收集的频率。类似的还有-XX：Max-MetaspaceFreeRatio，用于控制最大的元空间剩余容量的百分比。

### 创建线程导致内存溢出 unable to create native thread
虚拟机的栈内存允许动态扩展，当扩展栈容量无法申请到足够的内存时，将抛出 OutOfMemoryError 异常

```java
Exception in thread "main" java.lang.OutOfMemoryError: unable to create native thread
```

### 本地交换空间 request size bytes for reason. Out of swap space?
当本机堆分配失败且本机堆可能接近耗尽时，Java HotSpot VM 代码会报告这个明显的异常。
```java
 java.lang.OutOfMemoryError: request size bytes for reason. Out of swap space?
```

### 直接内存溢出 allocateMemory
直接内存（Direct Memory）的容量大小可通过 -XX：MaxDirectMemorySize 参数来指定。根据异常链 `allocateMemory` 方法跟踪定位。

如果不去指定，则默认与 Java 堆最大值（由 -Xmx 指定）一致
```java
Exception in thread "main" java.lang.OutOfMemoryError
    at sun.misc.Unsafe.allocateMemory(Native Method)
    at io.gourd.java.jvm.oom.DirectMemoryOOM.main(DirectMemoryOOM.java:25)
```
### GC Overhead limit exceeded
Java 进程超出 98% 的时间在做垃圾回收工作，工作中恢复了不到 2% 的堆空间。
```java
java.lang.OutOfMemoryError: GC Overhead limit exceeded
```
一般情况下：增加堆大小

也可以使用 -XX:-UseGCOverheadLimit 来关闭该异常

### 数组创建溢出 Requested array size exceeds VM limit
请求的数组大小超过 VM 限制，表示程序将创建一个大于堆大小的数组。

比如堆为 256M，程序试图创建一个 512M 的数组。
```java
 java.lang.OutOfMemoryError: Requested array size exceeds VM limit
```
一般情况下增加堆大小或者控制数组大小。

### 本地方法分配失败 reason stack_trace_with_native_method
堆栈跟踪中顶部的帧是本机方法，那么这表明本机方法遇到了分配失败。

分配失败是在 Java 本机接口 (JNI) 或本机方法中检测到的，而不是在 JVM 代码中。
```java
 java.lang.OutOfMemoryError: reason stack_trace_with_native_method
```

### 压缩类空间 Compressed class space
在 64 位平台上，类元数据的指针可以用 32 位偏移量表示 (UseCompressedOops，默认开启)，类元数据可用的空间量将固定在 CompressedClassSpaceSize
```java
 java.lang.OutOfMemoryError: Compressed class space
```
一般情况下增加压缩空间`-XX: CompressedClassSpaceSize=4g`或者关闭使用压缩。
> 注意:类元数据不止一种，即对象头信息-类型指针和其他元数据。只有对象头信息-类型指针存储在压缩类空间中。其他元数据存储在 Metaspace 中。参考本专栏《对象的创建与访问过程》详细了解。

## StackOverflowError 相关异常
线程请求的栈深度大于虚拟机所允许的最大深度，将抛出 StackOverflowError 异常

栈容量只能由 -Xss 参数来设定。关于虚拟机栈和本地方法栈在《Java 虚拟机规范》中描述了两种异常：
- 线程请求的栈深度大于虚拟机所允许的最大深度，将抛出 StackOverflowError 异常。
- 虚拟机的栈内存允许动态扩展，当扩展栈容量无法申请到足够的内存时，将抛出 OutOfMemoryError 异常。参考「方法区出现内存溢出」。

## 说明
相关测试代码参考-[源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-jvm/src/main/java/io/gourd/java/jvm/oom)

实际生产过程中我们可以选择更多的工具进行运行监控、分析 dump 文件：
- [推荐 Memory Analyzer (MAT)](https://www.eclipse.org/mat/)
- [jhsdb](https://docs.oracle.com/javase/9/tools/jhsdb.htm)
- [jconsole](http://openjdk.java.net/tools/svc/jconsole/)
- [推荐 Flight Recorder-飞行记录仪](https://docs.oracle.com/javacomponents/jmc-5-4/jfr-runtime-guide/run.htm#JFRUH176)
- [Java Mission Control](https://www.oracle.com/technetwork/java/javaseproducts/mission-control/java-mission-control-1998576.html)
- [推荐 jprofiler-付费 ](https://www.ej-technologies.com/products/jprofiler/overview.html)

> 更多 JDK 相关命令详细用法可参考  [Java JVM JDK13 诊断命令处理工具 jps,jstat,jinfo,jmap,jstack,jcmd](https://blog.csdn.net/xiaohulunb/article/details/103887785)

更多故障诊断及调优，参考本专栏 [Java JVM（JDK13）-专栏文章目录汇总](https://blog.csdn.net/xiaohulunb/article/details/103828570)。

## 参考
- [Understand the OutOfMemoryError Exception](https://docs.oracle.com/en/java/javase/13/troubleshoot/troubleshoot-memory-leaks.html#GUID-19F6D28E-75A1-4480-9879-D0932B2F305B)