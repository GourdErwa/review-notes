> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/scala-basis) ，[github-源码 ](https://github.com/GourdErwa/scala-advanced/tree/master/scala-base/src/main/scala/com/gourd/scala/base/)，欢迎 Star，转载请附上原文出处链接和本声明。

Scala 编程语言专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Scala 编程语言 ](https://review-notes.top/language/scala-basis/)

[[toc]]  
## 什么是抽象类型
特质和抽象类可以包含一个抽象类型成员，由 `type` 关键字定义，实际类型可以在具体实现类中定义。
```scala
  trait Buffer {
    type T // 抽象类型，是用来描述成员 element 的类型的
    val element: T
  }
  
  abstract class SeqBuffer extends Buffer {
    type U // 另外一个抽象类型来限定上边界
    type T <: Seq[U] // 声明类型 T 只能是 Seq[U] 的子类，这个 SeqBuffer 就限定的元素只能是序列
    def length = element.length
  }
  
  abstract class IntSeqBuffer extends SeqBuffer {
    type U = Int
  }
  
  // 使用了 IntSeqBuffer 的匿名类实现方式
  def newIntSeqBuf(elem1: Int, elem2: Int): IntSeqBuffer =
    new IntSeqBuffer {
         type T = List[U] // 类型 T 被设置成了 List[Int]
         val element = List(elem1, elem2)
       }
  val buf = newIntSeqBuf(7, 8)
  println("length = " + buf.length) // length = 2
  println("content = " + buf.element) // content = List(7, 8)
```
## 抽象类型转换成类型参数
把抽象类型成员转成类的`类型参数`也是可行的。    
有些情况下用类型参数替换抽象类型是行不通的。
```scala
  // 本示例只用了类的类型参数来转换上面的示例，效果是相同的。
  abstract class Buffer[+T] {
    val element: T
  }
  abstract class SeqBuffer[U, +T <: Seq[U]] extends Buffer[T] {
    def length = element.length
  }
  // 为了隐藏该方法返回的具体序列实现类型 SeqBuffer[Int, List[Int]]
  // SeqBuffer 的类型参数+T <: Seq[U] 应将 T 类型定义为协变
  def newIntSeqBuf(e1: Int, e2: Int): SeqBuffer[Int, Seq[Int]] =
    new SeqBuffer[Int, List[Int]] {
      val element = List(e1, e2)
    }
  
  val buf = newIntSeqBuf(7, 8)
  println("length = " + buf.length)
  println("content = " + buf.element)
```