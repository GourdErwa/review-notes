> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-jvm) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-jvm)，欢迎 Star，转载请附上原文出处链接和本声明。

Java JVM-虚拟机专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java JVM-虚拟机 ](https://review-notes.top/language/java-jvm/)

[toc]

## 一、前言
Java 源文件最终编译为 Class 文件，Class 文件中描述的各类信息，最终都需要加载到虚拟机中之后才能被运行和使用。

本节内容主要介绍
- 虚拟机如何加载这些 Class 文件
- Class 文件中的信息进入到虚拟机后会发生什么变化
- 类加载的过程
- JDK 9 前后双亲委派模式
- JDK 组件覆盖机制

## 二、类加载过程

一个类型从被加载到虚拟机内存中开始，到卸载出内存为止，它的整个生命周期将会经历七个阶段
- 加载（Loading）
- 验证（Verification）
- 准备（Preparation）
- 解析（Resolution）
- 初始化（Initialization）
- 使用（Using）
- 卸载（Unloading）

>「解析阶段」在某些情况下可以在「初始化阶段」之后再开始，这是为了支持 Java 语言的运行时绑定特性。

涉及名词解释：
- 符号引用：符号引用以一组符号来描述所引用的目标，符号可以是任何形式的字面量，只要使用时能无歧义地定位到目标即可。
符号引用与虚拟机实现的内存布局无关，引用的目标并不一定是已经加载到虚拟机内存当中的内容。
各种虚拟机实现的内存布局可以各不相同，但是它们能接受的符号引用必须都是一致的，因为符号引用的字面量形式明确定义在《Java 虚拟机规范》的 Class 文件格式中。

- 直接引用：直接引用是可以直接指向目标的指针、相对偏移量或者是一个能间接定位到目标的句柄。
直接引用是和虚拟机实现的内存布局直接相关的，同一个符号引用在不同虚拟机实例上翻译出来的直接引用一般不会相同。如果有了直接引用，那引用的目标必定已经在虚拟机的内存中存在。

### 加载
在加载阶段，Java 虚拟机需要完成以下三件事情：

1. 通过一个类的全限定名来获取定义此类的二进制字节流。

2. 将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构。

3. 在内存中生成一个代表这个类的 java.lang.Class 对象，作为方法区这个类的各种数据的访问入口。

> 对于数组类而言，情况有所不同，数组类本身不通过类加载器创建，它是由 Java 虚拟机直接在内存中动态构造出来的。

加载阶段结束后，Java 虚拟机外部的二进制字节流就按照虚拟机所设定的格式存储在方法区之中，在 Java 堆内存中实例化一个 java.lang.Class 类的对象，这个对象将作为程序访问方法区中的类型数据的外部接口。

> 方法区中的数据存储格式完全由虚拟机实现自行定义，《Java 虚拟机规范》未规定此区域的具体数据结构。

### 验证
验证的目的是确保 Class 文件的字节流中包含的信息符合《Java 虚拟机规范》的全部约束要求，保证这些信息被当作代码运行后不会危害虚拟机自身的安全。

1. 文件格式验证：
验证字节流是否符合 Class 文件格式的规范，并且能被当前版本的虚拟机处理。

2. 元数据验证：
对字节码描述的信息进行语义分析，以保证其描述的信息符合《Java 语言规范》的要求。

3. 字节码验证：
通过数据流分析和控制流分析，确定程序语义是合法的、符合逻辑的。

4. 符号引用验证：
简单来说就是该类是否缺少或者被禁止访问它依赖的某些外部类、方法、字段等资源。此验证校验行为发生在虚拟机将符号引用转化为直接引用的时候，即「解析阶段」中进行。

### 准备
准备阶段是正式为类中定义的变量（静态变量）分配内存并设置类变量初始值的阶段，从概念上讲，这些变量所使用的内存都应当在方法区中进行分配。

### 解析
解析阶段是 Java 虚拟机将常量池内的符号引用替换为直接引用的过程。

解析动作主要针对类或接口、字段、类方法、接口方法、方法类型、方法句柄和调用点限定符这 7 类符号引用进行，

简单的理解为我们类中如果变量是其他类的类型、继承了父类、实现了接口，那么该阶段会做相关的解析。更深入的了解可以参考《深入理解 Java 虚拟机：JVM 高级特性与最佳实践（第 3 版）》7.3.4 章节内容。

### 初始化
初始化阶段就是执行类构造器方法 `<clinit>` (类变量赋值)的过程。

## 三、类加载器
类加载器用于实现类的加载动作。

### 1. 关于类的比较
比较两个类是否「相等」，只有在这两个类是由同一个类加载器加载的前提下才相等。即使这两个类来源于同一个 Class 文件，被同一个 Java 虚拟机加载，只要加载它们的类加载器不同，那这两个类就必定不相等。

### 2. 类加载器有哪些
站在 Java 虚拟机的角度来看，只存在两种不同的类加载器：
- 一种是启动类加载器（Bootstrap ClassLoader），这个类加载器使用 C++ 语言实现，是虚拟机自身的一部分。

- 一种就是其他所有的类加载器，这些类加载器都由 Java 语言实现，独立存在于虚拟机外部，并且全都继承自抽象类 java.lang.ClassLoader。

#### 启动类加载器
负责加载存放在 `<JAVA_HOME>\lib` 目录，或者被 `-Xbootclasspath` 参数所指定的路径中存放的，而且是 Java 虚拟机能够识别的（按照文件名识别，如 rt.jar、tools.jar，名字不符合的类库即使放在 lib 目录中也不会被加载）类库加载到虚拟机的内存中。

启动类加载器无法被 Java 程序直接引用，用户在编写自定义类加载器时，如果需要把加载请求委派给引导类加载器去处理，那直接使用 null 代替即可

#### 由 Java 语言实现的类加载器
- 扩展类加载器（Ext ClassLoader）  
负责加载 `<JAVA_HOME>\lib\ext` 目录中，或者被 java.ext.dirs 系统变量所指定的路径中所有的类库。
它是一种 Java 系统类库的扩展机制，JDK 的开发团队允许用户将具有通用性的类库放置在 ext 目录里以扩展 Java SE 的功能，*在 JDK 9 之后，这种扩展机制被模块化带来的天然的扩展能力所取代*。
开发者可以直接在程序中使用扩展类加载器来加载 Class 文件。

- 应用程序类加载器（App ClassLoader）  
它负责加载用户类路径（ClassPath）上所有的类库，开发者同样可以直接在代码中使用这个类加载器。如果应用程序中没有自定义过自己的类加载器，一般情况下这个就是程序中默认的类加载器。

## 四、双亲委派模式
### 1. JDK 9 前的双亲委派模式
JDK 9 之前的 Java 应用都是由「启动类加载器」、「扩展类加载器」、「应用程序类加载器」这三种类加载器互相配合来完成加载的，如果有需要还可以加入自定义的类加载器来进行拓展
> 自定义的类加载器场景：典型的如增加除了磁盘位置之外的 Class 文件来源，或者通过类加载器实现类的隔离、重载等功能。

- 工作过程：  
如果一个类加载器收到了类加载的请求，它首先不会自己去尝试加载这个类，而是把这个请求委派给父类加载器去完成，每一个层次的类加载器都是如此，
因此所有的加载请求最终都应该传送到最顶层的「启动类加载器」中，只有当父加载器在它的搜索范围中没有找到所需的类时，子加载器才会尝试自己去完成加载。

- 为什么要使用这个模式？  
Java 中的类随着它的类加载器一起具备了一种*带有优先级的层次关系*。
> 例如：类 java.lang.Object，它存放在 rt.jar 之中，无论哪一个类加载器要加载这个类，最终都是委派给处于模型最顶端的启动类加载器进行加载，因此 Object 类在程序的各种类加载器环境中都能够保证是同一个类。

### 2. JDK 9 的双亲委派模式
JDK 9 为了模块化的支持，对双亲委派模式做了一些改动：

1. 扩展类加载器被平台类加载器（Platform ClassLoader）取代。  
JDK 9 时基于模块化进行构建（原来的 rt.jar 和 tools.jar 被拆分成数十个 JMOD 文件），
其中的 Java 类库就已天然地满足了可扩展的需求，那自然无须再保留 `<JAVA_HOME>\lib\ext` 目录，此前使用这个目录或者 java.ext.dirs 系统变量来扩展 JDK 功能的机制已经没有继续存在的价值了。

2. 平台类加载器和应用程序类加载器都不再继承自 java.net.URLClassLoader。  
现在启动类加载器、平台类加载器、应用程序类加载器全都继承于 jdk.internal.loader.BuiltinClassLoader。
> 如果有程序直接依赖了这种继承关系，或者依赖了 URLClassLoader 类的特定方法，那代码很可能会在 JDK 9 及更高版本的 JDK 中崩溃。

3. 启动类加载器现在是在 Java 虚拟机内部和 Java 类库共同协作实现的类加载器（以前是 C++实现）。  
为了与之前的代码保持兼容，所有在获取启动类加载器的场景（譬如 Object.class.getClassLoader）中仍然会返回 null 来代替，而不会得到 BootClassLoader 的实例。

4. 类加载的委派关系也发生了变动。  
当平台及应用程序类加载器收到类加载请求，在委派给父加载器加载前，要先判断该类是否能够归属到某一个系统模块中，如果可以找到这样的归属关系，就要优先委派给负责那个模块的加载器完成加载。

***

在 Java 模块化系统明确规定了三个类加载器负责各自加载的模块：

- 启动类加载器负责加载的模块
```java
java.base                        java.security.sasl
java.datatransfer                java.xml
java.desktop                     jdk.httpserver
java.instrument                  jdk.internal.vm.ci
java.logging                     jdk.management
java.management                  jdk.management.agent
java.management.rmi              jdk.naming.rmi
java.naming                      jdk.net
java.prefs                       jdk.sctp
java.rmi                         jdk.unsupported
```

- 平台类加载器负责加载的模块
```java
java.activation*                jdk.accessibility
java.compiler*                  jdk.charsets
java.corba*                     jdk.crypto.cryptoki
java.scripting                  jdk.crypto.ec
java.se                         jdk.dynalink
java.se.ee                      jdk.incubator.httpclient
java.security.jgss              jdk.internal.vm.compiler*
java.smartcardio                jdk.jsobject
java.sql                        jdk.localedata
java.sql.rowset                 jdk.naming.dns
java.transaction*               jdk.scripting.nashorn
java.xml.bind*                  jdk.security.auth
java.xml.crypto                 jdk.security.jgss
java.xml.ws*                    jdk.xml.dom
java.xml.ws.annotation*         jdk.zipfs
```

- 应用程序类加载器负责加载的模块
```java
jdk.aot                         jdk.jdeps
jdk.attach                      jdk.jdi
jdk.compiler                    jdk.jdwp.agent
jdk.editpad                     jdk.jlink
jdk.hotspot.agent               jdk.jshell
jdk.internal.ed                 jdk.jstatd
jdk.internal.jvmstat            jdk.pack
jdk.internal.le                 jdk.policytool
jdk.internal.opt                jdk.rmic
jdk.jartool                     jdk.scripting.nashorn.shell
jdk.javadoc                     jdk.xml.bind*
jdk.jcmd                        jdk.xml.ws*
jdk.jconsole
```

### 3. 双亲委派模式示意图

<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-jvm/_images/类加载-双亲委派模式.jpeg">
</div>

## 五、 覆盖机制 java.endorsed.dirs 变化
JDK 9 之前可设置系统属性 [java.endorsed.dirs](https://docs.oracle.com/javase/8/docs/technotes/guides/standards/index.html) 指定覆盖 JDK 的中的组件，或者直接将覆盖类打包为 JAR 文件放入 `<java-home>\lib\endorsed` 目录

JDK 9 因为模块化的设计[删除了该机制 ](https://docs.oracle.com/en/java/javase/13/migrate/index.html#JSMIG-GUID-8E83E51A-88A3-4E9A-8E2A-66E1D66A966C)，可以使用可升级模块或将 JAR 文件放在类路径中。

## 总结

- 类生命周期分为七步

- 双亲委派模式是为了保证「带有优先级的层次关系」的一种实现，例如 Object 类只能由启动类加载器加载。

- JDK 9 时为了模块化支持，对以前的双亲委派模式做了 4 点改动进行适配

## 参考
- 《深入理解 Java 虚拟机：JVM 高级特性与最佳实践（第 3 版）》周志明 著