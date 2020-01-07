> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/scala-basis) ，[github-源码 ](https://github.com/GourdErwa/scala-advanced/tree/master/scala-base/src/main/scala/com/gourd/scala/base/)，欢迎 Star，转载请附上原文出处链接和本声明。

Scala 编程语言专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Scala 编程语言 ](https://review-notes.top/language/scala-basis/)

[[toc]]
## 什么是 For 表达式
一个轻量级的标记方式用来表示序列推导，具体形式 `for (enumerators) yield e`。  
enumerators 指一组以分号分隔的枚举器。一个 enumerator 要么是一个产生新变量的生成器，要么是一个过滤器。   
* for 表达式并不局限于使用列表，任何数据类型只要支持 `withFilter`，`map`，和 `flatMap` 操作都可以用来做序列推导，一个单纯的字符串也是可以的。  
* 生成器后可以跟 `if` 表达式，对循环出的每一个元素进行过滤。
```scala
  case class User(name: String, age: Int)
  
  val userBase = List(User("Travis", 28), User("Kelly", 33), User("Jennifer", 44), User("Dennis", 23))
  
  // user <- userBase 是生成器，if (user.age >=20 && user.age < 30) 是过滤器条件。
  val twentySomethings = for (user <- userBase if (user.age >=20 && user.age < 30)) yield user.name
  
  twentySomethings.foreach(name => println(name))  // prints Travis Dennis
```
## 双重 For 循环
在 `()` 中指定两个枚举器，用 `;` 隔开，便可以做到双重 for 循环
```scala
  // 分别循环 0 到 10 之间的数和给定的集合中的元素，如果二者相加等于 100，便打印各自的值。
  for (i <- 0 to 10; j <- List(93, 95, 97, 99) if (i + j == 100)) println(s"($i,$j)")
```
## yield 关键字使用
* 可以在 for 表达式后使用 `yield` 关键字，将每一次循环得到的元素放到一个序列当中。  
* for 表达式后不使用 `yield` 关键字也是可以的，它将没有任何返回。
```scala
  def foo(n: Int, v: Int): immutable.Seq[(Int, Int)] =
    for (i <- 0 until n; j <- i until n if i + j == v) yield (i, j)

  foo(10, 10) foreach {
    case (i, j) =>
      println(s"($i, $j) ") // prints (1, 9) (2, 8) (3, 7) (4, 6) (5, 5)
  }

  // 也可以省略 yield，此时返回 Unit，下面的定义方式和上面的输出结果完全相同
  // def foo(n: Int, v: Int) : Unit = 
  //   for (i <- 0 until n; j <- i until n if i + j == v) {
  //     println(s"($i, $j)")
  //   }
```

## 参考
- 对于 for 推导为 flatMap 函数示例 [参考源码 ](https://github.com/GourdErwa/scala-advanced/tree/master/scala-base/src/main/scala/com/gourd/scala/base/for_comprehensions)