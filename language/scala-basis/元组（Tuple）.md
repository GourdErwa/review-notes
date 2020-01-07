> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/scala-basis) ，[github-源码 ](https://github.com/GourdErwa/scala-advanced/tree/master/scala-base/src/main/scala/com/gourd/scala/base/)，欢迎 Star，转载请附上原文出处链接和本声明。

Scala 编程语言专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Scala 编程语言 ](https://review-notes.top/language/scala-basis/)

[[toc]] 
## 元组
在 Scala 中，元组是一个可以容纳不同类型元素的类。  
元组是不可变的，当我们需要从函数返回多个值时，元组会派上用场。  
用户有时可能在元组和 case 类之间难以选择。通常，如果元素具有更多含义，则首选 case 类。
## 元组的定义与访问
Scala 中的元组包含一系列类：Tuple2，Tuple3 等，直到 Tuple22。  
* 创建一个包含 n(2-22) 个元素的元组时，Scala 从上述的类中实例化一个相对应的类，使用组成元组元素的类型进行参数化。  
* 使用下划线语法来访问元组中的元素。`tuple._n` 取出了第 n 个元素 (假设有足够多元素)。
```scala
  // 定义元组
  val ingredient : (String, Int) = ("Sugar" , 25) // Tuple2[String, Int]
  // 访问元素
  println(ingredient._1) // Sugar
  println(ingredient._2) // 25
```
## 如何解构元组数据
在 () 中定义与元组包含元素数量相同的、不同名称的变量用来接收元组中的数据。  
元组解构可以用于模式匹配或者 for 表达式中。
```scala
  // 元组解构
  val ingredient : (String, Int) = ("Sugar" , 25)
  val (name, quantity) = ingredient
  println(name) // Sugar
  println(quantity) // 25
  
  // 用于模式匹配
  val planetDistanceFromSun = List(("Mercury", 57.9), ("Venus", 108.2),
    ("Earth", 149.6), ("Mars", 227.9), ("Jupiter", 778.3))
  planetDistanceFromSun.foreach{ tuple => {
    tuple match {
        case ("Mercury", distance) => println(s"Mercury is $distance millions km far from Sun")
        case p if(p._1 == "Venus") => println(s"Venus is ${p._2} millions km far from Sun")
        case p if(p._1 == "Earth") => println(s"Blue planet is ${p._2} millions km far from Sun")
        case _ => println("Too far....")
      }
    }
  }
  
  // 用于 for 表达式中
  val numPairs = List((2, 5), (3, -7), (20, 56))
  for ((a, b) <- numPairs) {
    println(a * b)  // a 接收第一个元素，b 接收第二个元素
  }
```