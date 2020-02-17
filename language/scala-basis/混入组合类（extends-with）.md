> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/scala-basis) ，[github-源码 ](https://github.com/GourdErwa/scala-advanced/tree/master/scala-base/src/main/scala/com/gourd/scala/base/)，欢迎 Star，转载请附上原文出处链接和本声明。

Scala 编程语言专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Scala 编程语言 ](https://review-notes.top/language/scala-basis/)

[toc]
## 什么是混入
当某个特质被用于组合类时，被称为混入。  
* 一个类只能有一个父类，但是可以有多个混入。
* 父类和混入可能具有相同的父类。
## 示例 1
类 D 有一个父类 B 和一个混入 C，父类 B 和混入 C 具有相同的父类 A。  
```scala
  abstract class A {
    val message: String
  }
  class B extends A {
    val message = "I'm an instance of class B"
  }
  trait C extends A {
    def loudMessage = message.toUpperCase()
  }
  class D extends B with C
  
  val d = new D
  println(d.message)  // I'm an instance of class B
  println(d.loudMessage)  // I'M AN INSTANCE OF CLASS B
```
## 示例 2
```scala
  // 抽象类，具有一个抽象类型 T 和标准的迭代器方法
  abstract class AbsIterator {
    type T
    def hasNext: Boolean
    def next(): T
  }
  // 实现类
  class StringIterator(s: String) extends AbsIterator {
    type T = Char
    private var i = 0
    def hasNext = i < s.length
    def next() = {
      val ch = s charAt i
      i += 1
      ch
    }
  }
  // 特质，继承了 AbsIterator，定义了 foreach 方法，只要还有下一个元素，就会将下一个元素作为参数放入 f 函数中
  trait RichIterator extends AbsIterator {
    def foreach(f: T => Unit): Unit = while (hasNext) f(next())
  }
  // RichStringIter 继承了 StringIterator 混入了 RichIterator，使其功能更加灵活
  class RichStringIter extends StringIterator("Scala") with RichIterator
  
  val richStringIter = new RichStringIter
  richStringIter foreach println
  // S
  // c
  // a
  // l
  // a
```