> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/scala-basis) ，[github-源码 ](https://github.com/GourdErwa/scala-advanced/tree/master/scala-base/src/main/scala/com/gourd/scala/base/)，欢迎 Star，转载请附上原文出处链接和本声明。

Scala 编程语言专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Scala 编程语言 ](https://review-notes.top/language/scala-basis/)

在参数列表的开头添加了 `implicit` 关键字，该参数列表里的参数即为隐式参数。

* 一个方法只能有一个隐式参数列表，隐式参数列表中可以定义多个隐式参数。

* 在调用方法时，如果没有为隐式参数列表传入值，Scala 会为其自动匹配相应类型的隐式值。

* 隐式参数列表只能是最后一个参数列表。

* Scala 在调用包含有隐式参数块的方法时，将首先查找可以直接访问的隐式定义和隐式参数。

* 其次是在所有伴生对象中查找与隐式候选类型相关的有隐式标记的成员。

```scala
  abstract class Monoid[A] {
    def add(x: A, y: A): A
    def unit: A
  }
  
  object ImplicitTest {
    // 隐式参数
    implicit val stringMonoid: Monoid[String] = new Monoid[String] {
      def add(x: String, y: String): String = x concat y
      def unit: String = ""
    }
    // 隐式参数
    implicit val intMonoid: Monoid[Int] = new Monoid[Int] {
      def add(x: Int, y: Int): Int = x + y
      def unit: Int = 0
    }
    // 隐式参数 m，如果可以找到隐式 Monoid[A] 用于隐式参数 m，我们在调用 sum 方法时只需要传入 xs 参数。
    def sum[A](xs: List[A])(implicit m: Monoid[A]): A =
      if (xs.isEmpty) m.unit
      else m.add(xs.head, sum(xs.tail))
      
    def main(args: Array[String]): Unit = {
      // scala 会在上下文寻找隐式值
      // 由于 List(1,2,3) 的类型为 List[Int]，并且只传入了 xs，因此会寻找 Monoid[Int] 的隐式参数
      // intMonoid 是一个隐式定义，可以在 main 中直接访问。并且它的类型也正确，因此它会被自动传递给 sum 方法
      println(sum(List(1, 2, 3)))   // 6
      // 由于 List("a", "b", "c") 的类型为 List[String]，并且只传入了 xs，因此会寻找 Monoid[String] 的隐式参数
      // stringMonoid 是一个隐式定义，可以在 main 中直接访问。并且它的类型也正确，因此它会被自动传递给 sum 方法
      println(sum(List("a", "b", "c"))) // abc
    }
  }
```