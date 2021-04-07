(window.webpackJsonp=window.webpackJsonp||[]).push([[125],{498:function(t,a,s){"use strict";s.r(a);var r=s(10),n=Object(r.a)({},(function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("blockquote",[s("p",[t._v("专栏原创出处："),s("a",{attrs:{href:"https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency",target:"_blank",rel:"noopener noreferrer"}},[t._v("github-源笔记文件 "),s("OutboundLink")],1),t._v(" ，"),s("a",{attrs:{href:"https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency",target:"_blank",rel:"noopener noreferrer"}},[t._v("github-源码 "),s("OutboundLink")],1),t._v("，欢迎 Star，转载请附上原文出处链接和本声明。")])]),t._v(" "),s("p",[t._v("Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 "),s("a",{attrs:{href:"https://review-notes.top/language/java-concurrency/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Java 并发编程"),s("OutboundLink")],1)]),t._v(" "),s("p"),s("div",{staticClass:"table-of-contents"},[s("ul",[s("li",[s("a",{attrs:{href:"#synchronized-实现原理"}},[t._v("synchronized 实现原理")])]),s("li",[s("a",{attrs:{href:"#synchronized-的并发特性"}},[t._v("synchronized 的并发特性")])]),s("li",[s("a",{attrs:{href:"#如何使用"}},[t._v("如何使用")])]),s("li",[s("a",{attrs:{href:"#java-对象头"}},[t._v("Java 对象头")])]),s("li",[s("a",{attrs:{href:"#锁的升级与对比"}},[t._v("锁的升级与对比")]),s("ul",[s("li",[s("a",{attrs:{href:"#无锁"}},[t._v("无锁")])]),s("li",[s("a",{attrs:{href:"#偏向锁"}},[t._v("偏向锁")])]),s("li",[s("a",{attrs:{href:"#轻量级锁"}},[t._v("轻量级锁")])]),s("li",[s("a",{attrs:{href:"#重量级锁"}},[t._v("重量级锁")])]),s("li",[s("a",{attrs:{href:"#综述"}},[t._v("综述")])]),s("li",[s("a",{attrs:{href:"#优缺点对比"}},[t._v("优缺点对比")])])])]),s("li",[s("a",{attrs:{href:"#应用场景"}},[t._v("应用场景")])]),s("li",[s("a",{attrs:{href:"#缺陷"}},[t._v("缺陷")])]),s("li",[s("a",{attrs:{href:"#注意事项"}},[t._v("注意事项")])]),s("li",[s("a",{attrs:{href:"#思考"}},[t._v("思考")])]),s("li",[s("a",{attrs:{href:"#参考"}},[t._v("参考")])])])]),s("p"),t._v(" "),s("h2",{attrs:{id:"synchronized-实现原理"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#synchronized-实现原理"}},[t._v("#")]),t._v(" synchronized 实现原理")]),t._v(" "),s("p",[t._v("JVM 基于进入和退出 Monitor 对象来实现方法同步和代码块同步，但两者的实现细节不一样。")]),t._v(" "),s("ul",[s("li",[t._v("代码块同步：使用 monitorenter 和 monitorexit 指令实现的")]),t._v(" "),s("li",[t._v("方法同步：使用另外一种方式实现的，细节在 JVM 规范里并没有详细说明。但是，方法的同步同样可以使用这两个指令来实现。")])]),t._v(" "),s("hr"),t._v(" "),s("ul",[s("li",[t._v("monitorenter 指令是在编译后插入到同步代码块的开始位置")]),t._v(" "),s("li",[t._v("monitorexit 是插入到方法结束处和异常处")])]),t._v(" "),s("p",[t._v("JVM 要保证每个 monitorenter 必须有对应的 monitorexit 与之配对。"),s("br"),t._v("\n任何对象都有一个 monitor 与之关联，当且一个 monitor 被持有后，它将处于锁定状态。线程执行到 monitorenter 指令时，将会尝试获取对象所对应的 monitor 的所有权，即尝试获得对象的锁。")]),t._v(" "),s("blockquote",[s("p",[t._v("synchronized 是悲观锁，这种线程一旦得到锁，其他需要锁的线程就挂起的情况就是悲观锁。")])]),t._v(" "),s("h2",{attrs:{id:"synchronized-的并发特性"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#synchronized-的并发特性"}},[t._v("#")]),t._v(" synchronized 的并发特性")]),t._v(" "),s("ul",[s("li",[t._v("synchronized 保证原子性\n"),s("ol",[s("li",[t._v("通过 monitorenter 和 monitorexit 指令，可以保证被 synchronized 修饰的代码在同一时间只能被一个线程访问，在锁未释放之前，无法被其他线程访问到。")]),t._v(" "),s("li",[t._v("即使在执行过程中，由于某种原因，比如 CPU 时间片用完，线程 1 放弃了 CPU，但是它并没有进行解锁。而由于 synchronized 的锁是可重入的，下一个时间片还是只能被他自己获取到，还是会继续执行代码。直到所有代码执行完。")])])]),t._v(" "),s("li",[t._v("synchronized 保证可见性：对一个 synchronized 修饰的变量解锁之前，必须先把此变量同步回主存中。")]),t._v(" "),s("li",[t._v("synchronized 保证有序性：由于 synchronized 修饰的代码，同一时间只能被同一线程访问。（如果在本线程内观察，所有操作都是天然有序的），synchronized 是无法禁止指令重排和处理器优化的，但是同一线程内的执行遵守 as-if-serial 语义。")]),t._v(" "),s("li",[t._v("可重入性：获得一次锁之后，如果调用其它同步方法，不需要重新获取锁，可以直接使用。")]),t._v(" "),s("li",[t._v("不可中断性：一旦这个锁被某线程获得，其他线程只能等待或者阻塞。Lock 锁可以中断或者退出等待（超时机制）。")])]),t._v(" "),s("h2",{attrs:{id:"如何使用"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#如何使用"}},[t._v("#")]),t._v(" 如何使用")]),t._v(" "),s("p",[t._v("synchronized 实现同步的基础:Java 中的每一个对象都可以作为锁。具体表现为以下 3 种形式：")]),t._v(" "),s("ul",[s("li",[t._v("对于普通同步方法，锁是当前实例化的对象。")]),t._v(" "),s("li",[t._v("对于静态同步方法，锁是当前类的 Class 对象。")]),t._v(" "),s("li",[t._v("对于同步方法块，锁是 synchronized 括号里配置的对象。\n"),s("ul",[s("li",[t._v("synchronized(this) 表示锁是当前类实例对象，与同步方法块互斥")]),t._v(" "),s("li",[t._v("synchronized(实例化对象引用) 表示锁是当前类实例对象，与同步方法块互斥")]),t._v(" "),s("li",[t._v("synchronized(Object.class) 表示锁是类对象,与静态同步方法互斥")])])])]),t._v(" "),s("div",{staticClass:"language-java extra-class"},[s("pre",{pre:!0,attrs:{class:"language-java"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("class")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("SynchronizedExample")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("private")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("final")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Object")]),t._v(" lock "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Object")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("private")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" value "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("10")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("private")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("static")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" staticValue "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("10")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 对于同步方法块，锁是 synchronized 括号里配置的对象-实例化对象")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("void")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("setValue")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" i"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("synchronized")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("lock"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("value "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" i "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("%")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("10")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 对于同步方法块，锁是 synchronized 括号里配置的对象-当前类对象")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("void")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("setValue1")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" i"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("synchronized")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("SynchronizedExample")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("value "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" i "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("%")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("10")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    \n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 对于普通同步方法，锁是当前实例对象。")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("synchronized")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getValue")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 对于静态同步方法，锁是当前类的 Class 对象。")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("static")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("synchronized")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("lock")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" staticValue"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),s("h2",{attrs:{id:"java-对象头"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#java-对象头"}},[t._v("#")]),t._v(" Java 对象头")]),t._v(" "),s("blockquote",[s("p",[t._v("推荐工具-"),s("a",{attrs:{href:"http://openjdk.java.net/projects/code-tools/jol/",target:"_blank",rel:"noopener noreferrer"}},[t._v("分析 JVM 中的对象布局方案的微型工具箱 openjdk-jol "),s("OutboundLink")],1)])]),t._v(" "),s("p",[t._v("有关对象头的详细介绍参考我的另一篇文章 "),s("a",{attrs:{href:"https://gourderwa.blog.csdn.net/article/details/103828111",target:"_blank",rel:"noopener noreferrer"}},[t._v("Java JVM 对象的创建与访问过程"),s("OutboundLink")],1)]),t._v(" "),s("p",[t._v("synchronized 用的锁是存在 Java 对象头里的。（1 字宽 等于 4 字节，即 32bit）")]),t._v(" "),s("ul",[s("li",[t._v("如果对象是数组类型，则虚拟机用 3 个字宽 (Word) 存储对象头")]),t._v(" "),s("li",[t._v("如果对象是非数组类型，则用 2 字宽存储对象头。在 32 位虚拟机中")])]),t._v(" "),s("div",{attrs:{align:"center"}},[s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/Java-对象头的长度.png"}}),t._v(" "),s("p",[t._v("Java-对象头的长度")])]),t._v(" "),s("hr"),t._v(" "),s("p",[t._v("Java 对象头里的 Mark Word 里默认存储对象的 HashCode、分代年龄和锁标记位。"),s("br")]),s("div",{attrs:{align:"center"}},[s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/Java-对象头的存储结构.png"}}),t._v(" "),s("p",[t._v("32 位 JVM 的 Mark Word 的默认存储结构")])]),s("p"),t._v(" "),s("hr"),t._v(" "),s("p",[t._v("在运行期间，Mark Word 里存储的数据会随着锁标志位的变化而变化。"),s("br")]),s("div",{attrs:{align:"center"}},[s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/MarkWord-的状态变化.png"}}),t._v(" "),s("p",[t._v("MarkWord-的状态变化")])]),s("p"),t._v(" "),s("hr"),t._v(" "),s("p",[t._v("在 64 位虚拟机下，Mark Word 是 64bit 大小的。"),s("br")]),s("div",{attrs:{align:"center"}},[s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/MarkWord-的存储结构.png"}}),t._v(" "),s("p",[t._v("偏向锁的初始化流程")])]),s("p"),t._v(" "),s("h2",{attrs:{id:"锁的升级与对比"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#锁的升级与对比"}},[t._v("#")]),t._v(" 锁的升级与对比")]),t._v(" "),s("p",[t._v("Java SE 1.6 为了减少获得锁和释放锁带来的性能消耗，引入了“偏向锁”和“轻量级锁”，在 Java SE 1.6 中，锁一共有 4 种状态，级别从低到高依次是:"),s("strong",[t._v("无锁状态、偏向锁状态、轻量级锁状态和重量级锁状态")]),t._v("，这几个状态会随着竞争情况逐渐升级。锁可以升级但不能降级，意味着偏向锁升级成轻量级锁后不能降级成偏向锁。这种锁升级却不能降级的策略，目的是为了提高获得锁和释放锁的效率。")]),t._v(" "),s("h3",{attrs:{id:"无锁"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#无锁"}},[t._v("#")]),t._v(" 无锁")]),t._v(" "),s("p",[t._v("无锁没有对资源进行锁定，所有的线程都能访问并修改同一个资源，但同时只有一个线程能修改成功。"),s("br")]),t._v(" "),s("p",[s("strong",[t._v("1.无锁的特点")]),t._v("：就是修改操作在循环内进行，线程会不断的尝试修改共享资源。如果没有冲突就修改成功并退出，否则就会继续循环尝试。如果有多个线程修改同一个值，必定会有一个线程能修改成功，而其他修改失败的线程会不断重试直到修改成功。")]),t._v(" "),s("p",[s("strong",[t._v("2.实现机制")]),t._v("：CAS 原理及应用即是无锁的实现。无锁无法全面代替有锁，但无锁在某些场合下的性能是非常高的。")]),t._v(" "),s("h3",{attrs:{id:"偏向锁"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#偏向锁"}},[t._v("#")]),t._v(" 偏向锁")]),t._v(" "),s("p",[t._v("偏向锁是指一段同步代码一直被一个线程所访问，那么该线程会自动获取锁，降低获取锁的代价。\n ")]),t._v(" "),s("p",[s("strong",[t._v("1.为什么引入")]),t._v("：在大多数情况下，锁总是由同一线程多次获得，不存在多线程竞争，所以出现了偏向锁。其目标就是在只有一个线程执行同步代码块时能够提高性能。\n ")]),t._v(" "),s("p",[s("strong",[t._v("2.实现机制")]),t._v("：当一个线程访问同步代码块并获取锁时，会在 Mark Word 里存储锁偏向的线程 ID。在线程进入和退出同步块时不再通过 CAS 操作来加锁和解锁，而是检测 Mark Word 里是否存储着指向当前线程的偏向锁。")]),t._v(" "),s("p",[t._v("引入偏向锁是为了在无多线程竞争的情况下尽量减少不必要的轻量级锁执行路径，因为轻量级锁的获取及释放依赖多次 CAS 原子指令，而偏向锁只需要在置换 ThreadID 的时候依赖一次 CAS 原子指令即可。")]),t._v(" "),s("p",[s("strong",[t._v("3.偏向锁的撤销")]),t._v("：偏向锁只有遇到其他线程尝试竞争偏向锁时，持有偏向锁的线程才会释放锁，线程不会主动释放偏向锁。偏向锁的撤销需要等待全局安全点（在这个时间点上没有字节码正在执行），它会首先暂停拥有偏向锁的线程，判断锁对象是否处于被锁定状态。撤销偏向锁后恢复到无锁（标志位为“01”）或轻量级锁（标志位为“00”）的状态。")]),t._v(" "),s("p",[s("strong",[t._v("4.关闭偏向锁")]),t._v("：偏向锁在 JDK 6 及以后的 JVM 里是默认启用的。可以通过 JVM 参数"),s("em",[t._v("关闭偏向锁")]),t._v("：-XX:-UseBiasedLocking=false，关闭之后程序默认会进入轻量级锁状态。")]),t._v(" "),s("div",{attrs:{align:"center"}},[s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/偏向锁的初始化流程.png",height:"720px"}}),t._v(" "),s("p",[t._v("偏向锁的初始化流程")])]),t._v(" "),s("h3",{attrs:{id:"轻量级锁"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#轻量级锁"}},[t._v("#")]),t._v(" 轻量级锁")]),t._v(" "),s("p",[t._v("轻量级锁是指当锁是偏向锁的时候，被另外的线程所访问，偏向锁就会升级为轻量级锁，其他线程会通过自旋的形式尝试获取锁，不会阻塞，从而提高性能。")]),t._v(" "),s("p",[s("strong",[t._v("加锁")]),t._v("：在代码进入同步块的时候，如果同步对象锁状态为无锁状态（锁标志位为“01”状态，是否为偏向锁为“0”），虚拟机首先将在当前线程的栈帧中建立一个名为锁记录（Lock Record）的空间，用于存储锁对象目前的 Mark Word 的拷贝，然后拷贝对象头中的 Mark Word 复制到锁记录中。\n拷贝成功后，虚拟机将使用 CAS 操作尝试将对象的 Mark Word 更新为指向 Lock Record 的指针，并将 Lock Record 里的 owner 指针指向对象的 Mark Word。")]),t._v(" "),s("p",[t._v("如果这个更新动作成功了，那么这个线程就拥有了该对象的锁，并且对象 Mark Word 的锁标志位设置为“00”，表示此对象处于轻量级锁定状态。")]),t._v(" "),s("p",[s("strong",[t._v("解锁")]),t._v("：如果轻量级锁的更新操作失败了，虚拟机首先会检查对象的 Mark Word 是否指向当前线程的栈帧，如果是就说明当前线程已经拥有了这个对象的锁，那就可以直接进入同步块继续执行，否则说明多个线程竞争锁。")]),t._v(" "),s("p",[t._v("若当前只有一个等待线程，则该线程通过自旋进行等待。但是当自旋超过一定的次数，或者一个线程在持有锁，一个在自旋，又有第三个来访时，轻量级锁升级为重量级锁。")]),t._v(" "),s("div",{attrs:{align:"center"}},[s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-concurrency/_images/轻量级锁及膨胀流程.png",height:"720px"}}),t._v(" "),s("p",[t._v("轻量级锁及膨胀流程")])]),t._v(" "),s("h3",{attrs:{id:"重量级锁"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#重量级锁"}},[t._v("#")]),t._v(" 重量级锁")]),t._v(" "),s("p",[t._v("升级为重量级锁时，锁标志的状态值变为“10”，此时 Mark Word 中存储的是指向重量级锁的指针，此时等待锁的线程都会进入阻塞状态。")]),t._v(" "),s("h3",{attrs:{id:"综述"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#综述"}},[t._v("#")]),t._v(" 综述")]),t._v(" "),s("p",[t._v("整体的锁状态升级流程如下："),s("br"),t._v("\n无锁->偏向锁->轻量级锁->重量级锁")]),t._v(" "),s("p",[t._v("综上，偏向锁通过对比 Mark Word 解决加锁问题，避免执行 CAS 操作。而轻量级锁是通过用 CAS 操作和自旋来解决加锁问题，避免线程阻塞和唤醒而影响性能。重量级锁是将除了拥有锁的线程以外的线程都阻塞。")]),t._v(" "),s("h3",{attrs:{id:"优缺点对比"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#优缺点对比"}},[t._v("#")]),t._v(" 优缺点对比")]),t._v(" "),s("table",[s("thead",[s("tr",[s("th",[t._v("锁")]),t._v(" "),s("th",[t._v("优点")]),t._v(" "),s("th",[t._v("缺点")]),t._v(" "),s("th",[t._v("适用场景")])])]),t._v(" "),s("tbody",[s("tr",[s("td",[t._v("偏向锁")]),t._v(" "),s("td",[t._v("加锁和解锁不需要额外的消耗，和执行非同步方法相比存在纳秒级的差距")]),t._v(" "),s("td",[t._v("如果多线程存在锁竞争会带来额外的锁撤销消耗")]),t._v(" "),s("td",[t._v("适用于只有一个线程访问同步块")])]),t._v(" "),s("tr",[s("td",[t._v("轻量级锁")]),t._v(" "),s("td",[t._v("竞争的线程不会阻塞，提高程序的响应速度")]),t._v(" "),s("td",[t._v("一直得不到锁竞争的线程会自旋消耗CPU")]),t._v(" "),s("td",[t._v("追求响应时间  同步块执行速度非常快")])]),t._v(" "),s("tr",[s("td",[t._v("重量级锁")]),t._v(" "),s("td",[t._v("线程竞争不适应自旋，不会消耗CPU")]),t._v(" "),s("td",[t._v("线程阻塞，响应时间缓慢")]),t._v(" "),s("td",[t._v("追求吞吐量，同步块执行速度较长")])])])]),t._v(" "),s("h2",{attrs:{id:"应用场景"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#应用场景"}},[t._v("#")]),t._v(" 应用场景")]),t._v(" "),s("ul",[s("li",[t._v("并发访问同一非静态方法或非静态方法块")]),t._v(" "),s("li",[t._v("并发访问同一静态方法或静态方法块")])]),t._v(" "),s("h2",{attrs:{id:"缺陷"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#缺陷"}},[t._v("#")]),t._v(" 缺陷")]),t._v(" "),s("ul",[s("li",[t._v("效率低：锁的释放情况少，试图获得锁时不可设定超时、不可中断一个试图获取锁的线程")]),t._v(" "),s("li",[t._v("不够灵活：加锁和解锁仅有一个单一的条件（对象或者类）")]),t._v(" "),s("li",[t._v("无法感知是否成功获取到锁")])]),t._v(" "),s("h2",{attrs:{id:"注意事项"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#注意事项"}},[t._v("#")]),t._v(" 注意事项")]),t._v(" "),s("ul",[s("li",[t._v("锁对象不能为空")]),t._v(" "),s("li",[t._v("作用域不宜过大")]),t._v(" "),s("li",[t._v("避免死锁")])]),t._v(" "),s("h2",{attrs:{id:"思考"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#思考"}},[t._v("#")]),t._v(" 思考")]),t._v(" "),s("ul",[s("li",[t._v("synchronized 的实现原理及应用场景")]),t._v(" "),s("li",[t._v("synchronized 在 Java SE 1.6 中减少获得锁和释放锁带来的性能消耗引入的偏向锁、轻量级锁实现机制")]),t._v(" "),s("li",[t._v("synchronized 与 volatile 异同点？")])]),t._v(" "),s("h2",{attrs:{id:"参考"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#参考"}},[t._v("#")]),t._v(" 参考")]),t._v(" "),s("ul",[s("li",[t._v("并发编程的艺术")])])])}),[],!1,null,null,null);a.default=n.exports}}]);