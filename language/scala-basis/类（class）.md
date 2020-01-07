> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/scala-basis) ，[github-源码 ](https://github.com/GourdErwa/scala-advanced/tree/master/scala-base/src/main/scala/com/gourd/scala/base/)，欢迎 Star，转载请附上原文出处链接和本声明。

Scala 编程语言专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Scala 编程语言 ](https://review-notes.top/language/scala-basis/)

[[toc]] 
## 如何定义一个类
使用关键字 `class + 标识符` 来定义一个最简单的类，类名首字母应大写。  
* 使用关键字 new 来创建类的实例。  
* 类可以在抽象类中定义,也可以定义在特质中，但是不推荐这样定义，因为实例化该类需要有外层的实例对象才可以。
```scala
  // 不包含构造函数和类体
  class User
  val user1 = new User
  
  // 包含构造函数和类体
  class Point(var x: Int, var y: Int) {
    def move(dx: Int, dy: Int): Unit = {
      x = x + dx
      y = y + dy
    }
  
    override def toString: String = s"($x, $y)"
  }
  
  val point1 = new Point(2, 3)
  println(point1.x) // 2
  println(point1) // (2, 3)
  
  // 抽象类中定义类
  abstract class Soldier(val first: String, val last: String) {
  
    class Catch(val number: Long) {
      // nothing to do here.  Just observe that it compiles
    }
  
  }
  
  // squadron 为 Pilot 中自己的成员变量，不是继承父类的成员变量
  class Pilot(override val first: String, override val last: String, val squadron: Long)
    extends Soldier(first, last)
  
  val pilot = new Pilot("John", "Yossarian", 256)
  val catchNo = new pilot.Catch(22)
```
## 如何定义主构造函数
`类名 + ()` ,即为类的主构造函数。 
* 主构造函数参数不加 `val` 或 `var` 默认是 `private val` 修饰的。
* 主构造函数的参数可以提供默认值，可以选择参数进行赋值初始化。  
* 主构造函数是从左往右读取参数，如果传递的参数违背了主构造函数定义的参数顺序，则应该带名传参。
* 主构造函数会执行类中定义的所有语句。
* 可以在 `()` 前加上 `private` 关键字，将主构造函数变为私有。
```scala
  class Point(var x: Int = 0, var y: Int = 0)
  
  // 使用默认值创建
  val origin = new Point  // x and y are both set to 0
  // 从左往右读取参数，覆盖 x 参数的默认值
  val point1 = new Point(1)
  println(point1.x)  // prints 1
  // 单独传入 y 的值，由于 y 位于第二个参数，因此需要带名传参
  val point2 = new Point(y=2)
  println(point2.y)  // prints 2
```
## 如何定义辅助构造函数（多构造函数）
使用 `this()` 来定义辅助构造函数。  
* 辅助构造函数可以定义多个。
* 定义辅助构造函数的第一步，必须要先调用上一个主构造函数或者辅助构造函数。
```scala
  class Point private(var x: Int, var y: Int) {
    private var z: Int = _
    // 辅助构造函数
    def this(x: Int, y: Int, z: Int) {
      this(x, y)  // 先要调用主构造函数方法
      this.z = z
    }
  }
  val point = new Point(1, 3, 7)  // 调用辅助构造函数初始化实例
  println(point.x)
```
## 私有成员和 getter/setter 语法
类的成员默认是公有 (public) 的。使用 private 修饰符可以将成员变为私有属性。  
scala 私有成员变量 getter 和 setter 方法的特殊定义形式：value 和 value_= 详情见示例。  
* 主构造方法中带有 val 和 var 的参数是公有的。  
* val 是不可变的,类创建后不可以重新赋值。  
* 不带 val 或 var 的参数是私有的，仅在类中可见。
```scala
  class Point {
    private var _x = 0
    // 阈值
    private val bound = 100
    // getter 方法
    def x = _x
    // setter 的特殊定义语法，getter 方法后面跟上_=(参数)
    def x_= (newValue: Int): Unit = {
      if (newValue < bound) _x = newValue else printWarning
    }
  
    private def printWarning = println("WARNING: Out of bounds")
  }
  val point1 = new Point
  point1.x = 99  // 调用 setter 方法赋值
  println(point1.x)  // 99 
  point1.x = 101 // prints the warning
  
  // val 定义成员变量，类创建后，不可以重新为成员变量赋值
  class Point(val x: Int, val y: Int)
  val point = new Point(1, 2)
  point.x = 3  // <-- does not compile
  // 构造函数中不加 val 或 var 的成员变量默认私有，外部不可以访问，只在类中可见
  class Point(x: Int, y: Int)
  val point = new Point(1, 2)
  point.x  // <-- does not compile
```
## 如何定义单例对象
使用关键字 object 定义。  
* 单例对象中的成员都是静态的，相当于 Java 中定义的 `static` 属性。
```scala
  object Logger {
    def info(message: String): Unit = println(s"INFO: $message")
  }
  
  Logger.info("静态方法，直接调用")
```
## 伴生对象
当一个单例对象和某个类使用相同的名称时，这个单例对象被称为该类的伴生对象，这个类被称为是这个单例对象的伴生类。  
* 类和它的伴生对象可以互相访问其私有成员。  
* 使用伴生对象来定义那些在伴生类中不依赖于实例化对象而存在的成员变量或者方法。
```scala
  case class Circle(private var radius: Double) {
  
    import Circle._
    // 访问伴生对象中的私有方法 calculateArea
    def area: Double = calculateArea(radius)
  }
  
  object Circle {
    import scala.math._
    private def calculateArea(radius: Double): Double = Pi * pow(radius, 2.0)
    // 可以访问伴生类 Circle 中的私有成员变量 radius
    val circle = new Circle(2)
    circle.radius = 3
  }
```