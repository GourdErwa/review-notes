> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-jvm) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-jvm)，欢迎 Star，转载请附上原文出处链接和本声明。

Java JVM-虚拟机专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java JVM-虚拟机 ](https://review-notes.top/language/java-jvm/)

[toc]
## 一、前言

对于 invokedynamic 指令的实现需要方法句柄作为前提知识点。可参考 [Java JVM 动态方法调用之方法句柄 MethodHandle](https://gourderwa.blog.csdn.net/article/details/104024058)。

本文以 Lambda 表达式中运用 invokedynamic 的实现分析。

## 二、通过简单的代码分析
```java
class InvokeDynamicExample {
    public void lambda1() {
        Runnable runnable = () -> {
            int i = 1;
        };
        runnable.run();
    }
}
```
转为字节码后，关键字节码如下：
```java
{
  public void lambda1();
    Code:
      stack=1, locals=2, args_size=1
         0: invokedynamic #2,  0     // 生成动态调用站点
         5: astore_1
         6: aload_1
         7: invokeinterface #3,  1  // 调用 lambda 表达式
        12: return
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      13     0  this   LInvokeDynamicExample;
            6       7     1 runnable   Ljava/lang/Runnable;

  private static void lambda$lambda1$0(); // Runnable lambda 表达式默认生成的方法
    Code:
      stack=1, locals=1, args_size=0
         0: iconst_1
         1: istore_0
         2: return
}
BootstrapMethods:  // 引导方法
  0: #23 invokestatic   // 调用静态方法 LambdaMetafactory.metafactory() 返回 CallSite 对象
    Method arguments: // 静态方法关联参数
      #24 ()V
      #25 invokestatic InvokeDynamicExample.lambda$lambda1$0:()V
      #24 ()V
```

大体流程：

- javac 编译期间将 Lambda 表达式内容编译为一个新的方法，如果表达式与外部成员变量没有关联，编译为静态方法，否则编译为非静态方法。

  上述示例被编译为 `private static void lambda$lambda1$0` 静态方法。
- 代码执行 invokedynamic 指令时，将调用常量池对应的 BootstrapMethods(引导方法) ，引导方法返回一个动态调用站点对象 CallSite，该对象绑定了要执行的方法句柄。
 
  上述示例引导方法为 `#23 LambdaMetafactory.metafactory` ，该方法返回一个动态调用站点对象 CallSite
- 动态调用站点对象 CallSite 上绑定了 `lambda$lambda1$0` 方法相关的信息（参考字节码 #25）。

- 之后执行 `runnable.run();` 代码时，虚拟机则直接调用已经绑定了调用点所链接的 `lambda$lambda1$0` 方法。

## 参考
- 动态调用站点 CallSite 对象有关的更多字段类型可参考 AbstractValidatingLambdaMetafactory 类定义。

- [官方-Using the invokedynamic Instruction](https://docs.oracle.com/en/java/javase/13/vm/support-non-java-languages.html#GUID-5A6C7674-3FE3-48EC-A685-5F71FDBFE921)
- [Java 8 的 Lambda 表达式为什么要基于 invokedynamic？](https://www.zhihu.com/question/39462935)
## 本专栏更多相关笔记
- [Java JVM 运行时栈帧结构、字节码分析实战 ](https://gourderwa.blog.csdn.net/article/details/103979966)

- [Java JVM 字节码指令，指令表收录 ](https://gourderwa.blog.csdn.net/article/details/103976523)

- [Java JVM 字节码-为什么 new 指令后执行 dup 指令?](https://gourderwa.blog.csdn.net/article/details/103990943)

- [Java JVM 从方法调用的角度分析重载、重写的本质 ](https://gourderwa.blog.csdn.net/article/details/103995120)

- [Java JVM 动态方法调用之方法句柄 MethodHandle](https://gourderwa.blog.csdn.net/article/details/104024058)