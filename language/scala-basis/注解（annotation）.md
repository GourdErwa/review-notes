> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/scala-basis) ，[github-源码 ](https://github.com/GourdErwa/scala-advanced/tree/master/scala-base/src/main/scala/com/gourd/scala/base/)，欢迎 Star，转载请附上原文出处链接和本声明。

Scala 编程语言专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Scala 编程语言 ](https://review-notes.top/language/scala-basis/)

[[toc]] 
## 什么是注解
注解将元信息与定义相关联。

* 注解作用于其后的第一个定义或声明。

* 定义和声明之前可以有多个注解，并且这些注解的顺序没有前后要求。

```scala
object DeprecationDemo extends App {
  // 方法 hello() 被加了注解，表示该方法被废弃，不影响方法的使用，但是在编译的时候会被提示告警信息。
  @deprecated("deprecation message", "release # which deprecates method")
  def hello = "hello"

  hello  
}
```
## 确保编码正确性的注解
如果不满足条件，某些注解会导致编译失败。
```scala
import scala.annotation.tailrec
// 该方法由于添加了@tailrec 注解，该注解的作用是要确保被注解的的方法是尾递归，否则会编译报错。
// 尾递归是指递归调用是函数的最后一个语句，其结果被直接返回，不参与其他的计算。
// 该方法在递归调用的时候，将返回的结果与 x 做了乘法计算，并不是直接返回结果，因此不是尾递归。
def factorial(x: Int): Int = {
  @tailrec
  def factorialHelper(x: Int): Int = {
    if (x == 1) 1 else x * factorialHelper(x - 1)
  }
  factorialHelper(x)
}

// 这样定义是尾递归，添加@tailred 注解不会导致编译报错。
def factorial2(x: Int): Int = {

  @tailrec
  def factorialHelper2(x: Int, accumulator: Int): Int = {
    if (x == 1) accumulator else factorialHelper2(x - 1, accumulator * x)
  }
  factorialHelper2(x, 1)
}
```

## 影响代码生成的注解
例如 @inline 注解会影响编译后生成的代码文件的字节大小。  
使用注解 @inline 并不能确保方法内联，当且仅当满足某些生成代码大小的启发式算法时，它才会触发编译器执行此操作。
* 内联表示在调用点插入被调用方法体中的代码。生成的字节码更长，但有可能使程序运行的更快。

## 在 Scala 中使用 Java 注解
在编写与 Java 互操作的 Scala 代码时，注解的语法会存在一些差异：
* 如果 Java 中的注解存在默认值，要显示的为其重新赋值时，Scala 的调用会更为简洁。

* 确保你在开启 `-target:jvm-1.8` 选项时使用 Java 注解。

```java
  @interface SourceURL {
      public String value();
      public String mail() default "";
  }
  // 使用 mail 的默认值
  // java 中调用
  @SourceURL("https://coders.com/")
  public class MyJavaClass {}
  // scala 中调用
  @SourceURL("https://coders.com/")
  class MyScalaClass {}
  
  // 显示的为 mail 赋值
  // java 中显示的为 mail 赋值，需要指定 value 的名称
  @SourceURL(value = "https://coders.com/",
             mail = "support@coders.com")
  public class MyJavaClass {}
  // scala 中显示的为 mail 赋值
  @SourceURL("https://coders.com/",
             mail = "support@coders.com")
  class MyScalaClass {}
```