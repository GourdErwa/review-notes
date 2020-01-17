> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-jvm) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-jvm)，欢迎 Star，转载请附上原文出处链接和本声明。

Java JVM-虚拟机专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java JVM-虚拟机 ](https://review-notes.top/language/java-jvm/)

[[toc]]
## 一、为什么 new 指令后执行 dup 指令？

在做字节码分析时，发现每次 new 指令后跟随着 dup 指令，这 2 个指令的说明：
- new 创建一个对象, 并将其引用引用值压入栈顶

- dup 复制栈顶数值并将复制值压入栈顶


**1.创建对象的指令执行顺序）**

一般我们创建一个对象使用 `new Object();` ，构造函数隐式的返回当前对象。
1. 创建一个 Object 类型的对象

2. 调用 Object 的构造函数 invokespecial<>

3. 返回一个 Object 的实例引用

这三步对应字节码顺序为：
```
1. new               // 创建对象后，保留一个引用，结果为： ref
2. dup               // 赋值引用后，保留两个引用，结果为： ref,ref
3. invokespecial     // 调用了构造方法用一个引用，结果为： ref
```
**2.原因总结）**

如果不使用 `dup` 复制，被构造函数指令使用后，最终无法返回实例引用。

> 一个不复制的实现方式：  
如果不进行 dup 复制指令在 new 指令后直接将引用存入局部变量表中，后续使用时做推送至栈顶操作也可以。
但是这样在构造函数执行时，最少的一次推送至栈顶操作。（当前是不会这么做的）

## 二、构造函数返回值操作分析

new 指令后，会执行构造函数，使用了第一个引用。

- 程序做赋值操作。第二个引用会保存到局部变量表槽位中。比如：Object o = new Object()

- 程序不做赋值操作，直接操作对象的成员。则直接使用第二个引用。比如：new Object().toString()

- 程序不对这个对象操作，第二个引用被 `pop` 指令弹出

**字节码实战验证：**

声明一个 class 进行字节码分析
```java
public class NewDupCode {
    private int a;
    public NewDupCode(int a) {
        this.a = a;
    }
}    
```
1. 创建对象并返回对象实例
```java
    public NewDupCode newDupCode() {
        return new NewDupCode(1);
    }
    Code:
      stack=4, locals=1, args_size=1
         0: new           #4 // class NewDupCode
         3: dup
         4: iconst_1
         5: ldc           #5 // String 2
         7: invokespecial #6 // 调用构造函数使用 1 个
        10: areturn          // 返回值使用 1 个
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      11     0  this   LNewDupCode;
```
2. 程序做赋值操作
```java
    public int voidUseNewDupCode() {
        final NewDupCode o = new NewDupCode(1);
        return o.a + o.hashCode();
    }
    Code:
      stack=4, locals=2, args_size=1
         0: new           #4 // class NewDupCode
         3: dup
         4: iconst_1
         5: ldc           #5 // String 2
         7: invokespecial #6 // 调用构造函数使用 1 个
        10: astore_1         // 赋值给 o 时，将栈顶引用型数值 o 存入槽位 1（2 个用完）
        11: aload_1          // 将 o 引用类型本地变量推送至栈顶，出来准备取值
        12: getfield      #2  
        15: aload_1          // 将 o 引用类型本地变量推送至栈顶，出来准备取值
        16: invokevirtual #7 
        19: iadd
        20: ireturn
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      21     0  this   LNewDupCode;
           11      10     1     o   LNewDupCode; // new 以后赋值给 o 存入槽位    
```
3. 程序不做赋值操作，直接操作对象的成员
```java
    public int voidUseNonRefNewDupCode() {
        return new NewDupCode(1).a;
    } 
    Code:
      stack=4, locals=1, args_size=1
         0: new           #4 // class NewDupCode
         3: dup
         4: iconst_1
         5: ldc           #5 // String 2
         7: invokespecial #6 // 调用构造函数使用 1 个
        10: getfield      #2 // 剩余 1 个，直接用于字段取值 Field a:I
        13: ireturn
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      14     0  this   LNewDupCode;    
```
4. 程序不对这个对象操作，只进行一个 new 操作
```java
    public void voidNewDupCode() {
        new NewDupCode(1);
    }
    Code:
      stack=4, locals=1, args_size=1
         0: new           #4 // class  NewDupCode
         3: dup
         4: iconst_1
         5: ldc           #5 // String 2
         7: invokespecial #6 // 调用构造函数使用 1 个
        10: pop              // 弹出 1 个
        11: return
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      12     0  this   L //NewDupCode;    
```

## 参考
- [关于JVM字节码中dup指令的问题？ R大](https://www.zhihu.com/question/52749416)

## 本专栏更多相关笔记
- [运行时内存数据区域 ](https://gourderwa.blog.csdn.net/article/details/103822458)

- [Java JVM 运行时栈帧结构、字节码分析实战](https://gourderwa.blog.csdn.net/article/details/103979966)

- [Java JVM 字节码指令，指令表收录](https://gourderwa.blog.csdn.net/article/details/103976523)

- [Java JVM 从方法调用的角度分析重载、重写的本质](https://gourderwa.blog.csdn.net/article/details/103995120)