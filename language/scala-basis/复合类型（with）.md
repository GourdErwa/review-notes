> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/scala-basis) ，[github-源码 ](https://github.com/GourdErwa/scala-advanced/tree/master/scala-base/src/main/scala/com/gourd/scala/base/)，欢迎 Star，转载请附上原文出处链接和本声明。

Scala 编程语言专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Scala 编程语言 ](https://review-notes.top/language/scala-basis/)

[toc]
## 什么是复合类型
复合类型是指一个对象的类型是多种类型的子类型，即多个类型的交集。

e.g：`def cloneAndReset(obj: Cloneable with Resetable)`

```scala
  trait Cloneable extends java.lang.Cloneable {
    override def clone(): Cloneable = {
      super.clone().asInstanceOf[Cloneable]
    }
  }
  trait Resetable {
    def reset: Unit
  }
  // 这里的 obj 类型应该是什么？如果是 Cloneable 则无法 reset 对象 obj，如果是 Resetable，则无法克隆 obj
  /* def cloneAndReset(obj: ?): Cloneable = {
       val cloned = obj.clone()
       obj.reset
       cloned
     } */
  // 这里可以把 obj 的类型定义为复合类型，即 obj: Cloneable with Resetable
  def cloneAndReset(obj: Cloneable with Resetable): Cloneable = {
    val cloned = obj.clone()
    obj.reset
    cloned
  }
```