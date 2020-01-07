> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/scala-basis) ，[github-源码 ](https://github.com/GourdErwa/scala-advanced/tree/master/scala-base/src/main/scala/com/gourd/scala/base/)，欢迎 Star，转载请附上原文出处链接和本声明。

Scala 编程语言专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Scala 编程语言 ](https://review-notes.top/language/scala-basis/)

[[toc]] 
## 什么是自类型
自类型用于声明一个特质必须混入其他特质，该特质不需要直接实现其他特质，但是子类在实现该特质的时候必须混入被声明的特质。

* 在没有引入其他特质的时候，可以直接使用其他特质中定义好的方法。

* 自类型是一种细化 `this` 或 `this 别名`(除关键字外的任何字符) 的方法，为其重新赋予其他的类型。

* 在特质中使用自类型，定义一个`标识符` + `要混入的特质` + `=>`，例如 someIdentifier: SomeOtherTrait =>。

```scala
  trait User {
    def username: String
  }
  
  trait Tweeter {
    // 重新赋予 this 的类型，因此 username 可以在 tweet() 中使用，这里可以定义 this 为除关键字之外的任何字符。
    this: User =>
    def tweet(tweetText: String) = println(s"$username: $tweetText")
  }
  // 因为 VerifiedTweeter 继承了 Tweeter，而 Tweeter 又指定了自类型 User，所以 VerifiedTweeter 还需要混入 User
  class VerifiedTweeter(val username_ : String) extends Tweeter with User {
  	def username = s"real $username_"
  }
  
  val tweeter = new VerifiedTweeter("Beyoncé")
  tweeter.tweet("Just spilled my glass of lemonade")
  // real Beyoncé: Just spilled my glass of lemonade
```

## 自类型的依赖注入模式

self 应用在蛋糕模式（依赖注入）代码示例：

```scala
/**
  * self-type 蛋糕模式（依赖注入）
  *
  * 本示例采用 WEB 常见开发模式
  * controls 依赖 service
  * service 依赖 dao
  *
  * @author Li.Wei by 2019-08-14
  */
object CakePattern

// 数据层 dao
trait UserRepositoryComponent {
  protected val userRepository = new UserRepository

  class UserRepository {
    def authenticate(user: User): User = {
      println("authenticating user: " + user)
      user
    }

    def create(user: User): Unit = println("creating user: " + user)

    def delete(user: User): Unit = println("deleting user: " + user)
  }

}

// 服务层 service
trait UserServiceComponent {
  this: UserRepositoryComponent =>
  protected val userService = new UserService

  class UserService {
    def authenticate(username: String, password: String): User = null

    def create(username: String, password: String): Unit = {}

    def delete(user: User): Unit = userRepository.delete(user)
  }

}

// 控制层 controls
object ComponentRegistry extends
  UserServiceComponent with
  UserRepositoryComponent {
  override protected val userRepository = new UserRepository
  override protected val userService = new UserService
}
```