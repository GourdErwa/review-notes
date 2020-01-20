> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-core) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-core)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 核心知识专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 核心知识 ](https://review-notes.top/language/java-core/)

[[toc]]

## 一、Oracle 官方对 null 的描述

[The Kinds of Types and Values](https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html#jls-4.1) 中说明，在实践中，程序员可以忽略 null 类型，而只是假装 null 只是可以是任何引用类型的特殊文字。

## 二、字节码中与 null 相关的指令
从字节码的角度看，仅有三个与 null 相关的指令：

- [aconst_null](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-6.html#jvms-6.5.aconst_null)：将 null 对象压入操作数堆栈

- [ifnull](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-6.html#jvms-6.5.ifnull)：为 null 时跳转

- [ifnonnull](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-6.html#jvms-6.5.ifnonnull)：不为 null 时跳转

HotSpot 对这 aconst_null 指令的实现，表明最终我们的 null 操作的是 c/c++ 中的「NULL」：
```c
CASE(_aconst_null): 
    SET_STACK_OBJECT(NULL, 0);  // 压栈操作
    UPDATE_PC_AND_TOS_AND_CONTINUE(1, 1);
```

**C++ Null 指针说明：**

在变量声明的时候，如果没有确切的地址可以赋值，为指针变量赋一个 NULL 值是一个良好的编程习惯。赋为 NULL 值的指针被称为空指针。

NULL 指针是一个定义在标准库中的值为零的常量。在大多数的操作系统上，程序不允许访问地址为 0 的内存，因为该内存是操作系统保留的。然而，内存地址 0 有特别重要的意义，它表明该指针不指向一个可访问的内存位置。但按照惯例，如果指针包含空值（零值），则假定它不指向任何东西。

## 三、Java 中对 null 的理解
我们声明一个对象，比如 `Object o;` 在声明时虚拟机不确定 o 这个引用指针到底哪一块数据区域，因此默认赋值给 null。表示有一个对象指针，但是还没有确定要指向哪里。

现在我们可能会想那我们声明后直接指向一个对象不行吗？是可以，这也是一个好习惯，能避免空指针异常。但是有时候我们确实需要在构造函数或者方法中根据其他变量的不同情况来确认对象的内容，或者确认不同的接口实现类。

假设我们不用 null 这个特殊的符号代替。我们让系统如何表示？用 -1？如果默认-1，那在操作对象的时候 -1 该不该参与运算！

索性就把内存地址里的 0 这个特殊的地址作为一个特殊标识。这个地址 0 受到系统保护，程序不能进行写操作。

## 总结

null 不是任何实例。null 仅仅是一个标识符，标识这个对象还没初始化。


可以试着编译下面的类，然后 `javap -c -p -v Null.class` 查看相关字节码
```java
public class Null {

    private Object o1 = null;

    private Object o2 = null;

    private Object[] nullObj = new Object[]{null, null};

    public boolean isNull(Object o) {
        boolean r = o == null;
        return r;
    }    
}
```
## 参考
- [C++ Null 指针 ](https://www.runoob.com/cplusplus/cpp-null-pointers.html)

- [what-is-null-in-java](https://stackoverflow.com/questions/2707322/what-is-null-in-java)

- [关于 aconst_null 和 nop 的一点疑惑？](https://www.zhihu.com/question/55437438)
## 专栏更多文章笔记
- [Java 核心知识-专栏文章目录汇总 ](https://gourderwa.blog.csdn.net/article/details/104020339)

- [Java 并发编程-专栏文章目录汇总 ](https://blog.csdn.net/xiaohulunb/article/details/103594468)

- [Java JVM（JDK13）-专栏文章目录汇总 ](https://blog.csdn.net/xiaohulunb/article/details/103828570)