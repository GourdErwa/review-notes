> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/scala-basis) ，[github-源码 ](https://github.com/GourdErwa/scala-advanced/tree/master/scala-base/src/main/scala/com/gourd/scala/base/)，欢迎 Star，转载请附上原文出处链接和本声明。

Scala 编程语言专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Scala 编程语言 ](https://review-notes.top/language/scala-basis/)

[[toc]]
## 什么是包对象
Scala 可以在每一个包中定义一个包对象「package object」，作为在整个包中方便共享使用的容器。

* 包对象中可以定义任何内容，而不仅仅是变量和方法。

* 按照惯例，包对象的代码通常放在名为 package.scala 的源文件中。

* 每个包都允许有一个包对象。在包对象中的任何定义都可以在包中的其他类里面使用。

```scala
  // 有一个 Fruit 类和三个 Fruit 对象在包 gardening.fruits 中
  package gardening.fruits
  
  case class Fruit(name: String, color: String)
  object Apple extends Fruit("Apple", "green")
  object Plum extends Fruit("Plum", "blue")
  object Banana extends Fruit("Banana", "yellow")
  
  // 在包对象 fruits 中定义变量 planted 和方法 showFruit
  package gardening
  package object fruits {
    val planted = List(Apple, Plum, Banana)
    def showFruit(fruit: Fruit): Unit = {
      println(s"${fruit.name}s are ${fruit.color}")
    }
  }

  // 在同一个包下使用包对象中的成员，可以直接使用
  // 在不同包中使用包对象中定义的变量和方法：import gardening.fruits._，和导入类的方式相同。
  import gardening.fruits._
  object PrintPlanted {
    def main(args: Array[String]): Unit = {
      for (fruit <- fruits.planted) {
        showFruit(fruit)
      }
    }
  }
  
  // 包对象和其他对象类似，也可以使用继承来构建。
  package object fruits1 extends FruitAliases with FruitHelpers {}

```