> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-jvm) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-jvm)，欢迎 Star，转载请附上原文出处链接和本声明。

Java JVM-虚拟机专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java JVM-虚拟机 ](https://review-notes.top/language/java-jvm/)

[[toc]]

## 前言
实际代码执行过程中经常遇到 OOM 相关异常，本篇内容总结各种 OOM 相关联内存区域。方便定位是哪一块内存区域的问题，然后进行参数调优。

实际生产过程中我们可以使用 dump 文件进行分析，或者使用一些可视化故障处理工具
- [jhsdb](https://docs.oracle.com/javase/9/tools/jhsdb.htm)
- [jconsole](http://openjdk.java.net/tools/svc/jconsole/)
- [Java Mission Control](https://www.oracle.com/technetwork/java/javaseproducts/mission-control/java-mission-control-1998576.html)
- [jprofiler](https://www.ej-technologies.com/products/jprofiler/overview.html)

## OutOfMemoryError 相关异常
一般情况下，OutOfMemoryError 异常后会跟随「Java heap space」描述，如果「Java heap space」一样情况下，可查看异常的调用链「at ...」来定位。

### Java 堆内存溢出
可通过 `-Xms20m -Xmx20m` 设置堆大小。

```java
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
	at io.gourd.java.jvm.oom.HeapOOM$OomObj.<init>(HeapOOM.java:19)
	at io.gourd.java.jvm.oom.HeapOOM.main(HeapOOM.java:27)
```

### 字符串常量池溢出
自 JDK 7 起，原本存放在永久代的字符串常量池被移至 Java 堆之中，所以在 JDK 7 及以上版本，限制方法区的容量对该测试用例来说是毫无意义的。

```java
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
    at java.util.HashMap.resize(HashMap.java:704)
    at java.util.HashMap.putVal(HashMap.java:663)

// 或者

Exception in thread 「main」 java.lang.OutOfMemoryError: Java heap space 
    at java.base/java.lang.Integer.toString（Integer.java:440） 
    at java.base/java.lang.String.valueOf（String.java:3058）
```

### 方法区出现内存溢出
当前的很多主流框架，如 Spring、Hibernate 对类进行增强时，都会使用到 CGLib 这类字节码技术，当增强的类越多，就需要越大的方法区以保证动态生成的新类型可以载入内存。

```java
Caused by: java.lang.OutOfMemoryError: PermGen space
    at java.lang.ClassLoader.defineClass1(Native Method)
    at java.lang.ClassLoader.defineClassCond(ClassLoader.java:632)
    at java.lang.ClassLoader.defineClass(ClassLoader.java:616)
```
- -XX：MaxMetaspaceSize：设置元空间最大值，默认是-1，即不限制，或者说只受限于本地内存大小。

- -XX：MetaspaceSize：指定元空间的初始空间大小，以字节为单位，达到该值就会触发垃圾收集进行类型卸载，同时收集器会对该值进行调整：如果释放了大量的空间，就适当降低该值；如果释放了很少的空间，那么在不超过-XX：MaxMetaspaceSize（如果设置了的话）的情况下，适当提高该值。

- -XX：MinMetaspaceFreeRatio：作用是在垃圾收集之后控制最小的元空间剩余容量的百分比，可减少因为元空间不足导致的垃圾收集的频率。类似的还有-XX：Max-MetaspaceFreeRatio，用于控制最大的元空间剩余容量的百分比。

### 创建线程导致内存溢出
虚拟机的栈内存允许动态扩展，当扩展栈容量无法申请到足够的内存时，将抛出 OutOfMemoryError 异常

```java
Exception in thread "main" java.lang.OutOfMemoryError: unable to create native thread
```

### 直接内存溢出
直接内存（Direct Memory）的容量大小可通过 -XX：MaxDirectMemorySize 参数来指定

如果不去指定，则默认与 Java 堆最大值（由 -Xmx 指定）一致
```java
Exception in thread "main" java.lang.OutOfMemoryError
    at sun.misc.Unsafe.allocateMemory(Native Method)
    at io.gourd.java.jvm.oom.DirectMemoryOOM.main(DirectMemoryOOM.java:25)
```

## StackOverflowError 相关异常

线程请求的栈深度大于虚拟机所允许的最大深度，将抛出 StackOverflowError 异常

栈容量只能由 -Xss 参数来设定。关于虚拟机栈和本地方法栈在《Java 虚拟机规范》中描述了两种异常：
- 线程请求的栈深度大于虚拟机所允许的最大深度，将抛出 StackOverflowError 异常。
- 虚拟机的栈内存允许动态扩展，当扩展栈容量无法申请到足够的内存时，将抛出 OutOfMemoryError 异常。参考「方法区出现内存溢出」。

## 说明
相关测试代码参考-[源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-jvm/src/main/java/io/gourd/java/jvm/oom)