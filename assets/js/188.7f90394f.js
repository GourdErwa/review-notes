(window.webpackJsonp=window.webpackJsonp||[]).push([[188],{561:function(a,v,t){"use strict";t.r(v);var r=t(10),e=Object(r.a)({},(function(){var a=this,v=a.$createElement,t=a._self._c||v;return t("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[t("blockquote",[t("p",[a._v("专栏原创出处："),t("a",{attrs:{href:"https://github.com/GourdErwa/review-notes/tree/master/language/java-jvm",target:"_blank",rel:"noopener noreferrer"}},[a._v("github-源笔记文件 "),t("OutboundLink")],1),a._v(" ，"),t("a",{attrs:{href:"https://github.com/GourdErwa/java-advanced/tree/master/java-jvm",target:"_blank",rel:"noopener noreferrer"}},[a._v("github-源码 "),t("OutboundLink")],1),a._v("，欢迎 Star，转载请附上原文出处链接和本声明。")])]),a._v(" "),t("p",[a._v("Java JVM-虚拟机专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 "),t("a",{attrs:{href:"https://review-notes.top/language/java-jvm/",target:"_blank",rel:"noopener noreferrer"}},[a._v("Java JVM-虚拟机 "),t("OutboundLink")],1)]),a._v(" "),t("p"),t("div",{staticClass:"table-of-contents"},[t("ul",[t("li",[t("a",{attrs:{href:"#java-运行时数据区域简介"}},[a._v("Java 运行时数据区域简介")])]),t("li",[t("a",{attrs:{href:"#规范与实现说明"}},[a._v("规范与实现说明")])]),t("li",[t("a",{attrs:{href:"#程序计数器"}},[a._v("程序计数器")])]),t("li",[t("a",{attrs:{href:"#java-虚拟机栈"}},[a._v("Java 虚拟机栈")])]),t("li",[t("a",{attrs:{href:"#本地方法栈"}},[a._v("本地方法栈")])]),t("li",[t("a",{attrs:{href:"#java-堆"}},[a._v("Java 堆")])]),t("li",[t("a",{attrs:{href:"#方法区"}},[a._v("方法区")]),t("ul",[t("li",[t("a",{attrs:{href:"#永久代-元空间"}},[a._v("永久代&元空间")])]),t("li",[t("a",{attrs:{href:"#运行时常量池"}},[a._v("运行时常量池")])])])]),t("li",[t("a",{attrs:{href:"#直接内存"}},[a._v("直接内存")])]),t("li",[t("a",{attrs:{href:"#本地内存"}},[a._v("本地内存")])]),t("li",[t("a",{attrs:{href:"#参考"}},[a._v("参考")])])])]),t("p"),a._v(" "),t("h2",{attrs:{id:"java-运行时数据区域简介"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#java-运行时数据区域简介"}},[a._v("#")]),a._v(" Java 运行时数据区域简介")]),a._v(" "),t("p",[a._v("Java 虚拟机在执行 Java 程序的过程中会把它所管理的内存划分为若干个不同的数据区域。这些区域有各自的用途，以及创建和销毁的时间，有的区域随着虚拟机进程的启动而一直存在，有些区域则是依赖用户线程的启动和结束而建立和销毁。")]),a._v(" "),t("p",[a._v("根据《Java 虚拟机规范》的规定，Java 虚拟机所管理的内存将会包括以下几个运行时数据区域，如图所示。详细介绍请阅读后续章节。")]),a._v(" "),t("div",{attrs:{align:"center"}},[t("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/language/java-jvm/_images/内存划分及各区域作用简介.jpeg"}})]),a._v(" "),t("p",[a._v("有助于记忆的建议：「2 + 3」，2 个线程共享，3 个线程私有")]),a._v(" "),t("h2",{attrs:{id:"规范与实现说明"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#规范与实现说明"}},[a._v("#")]),a._v(" 规范与实现说明")]),a._v(" "),t("p",[a._v("切记《Java 虚拟机规范》所描述的抽象 JVM 概念与实际实现并不总一一对应，大多数情况，我们只是以 HotSpot 虚拟机的实现理解描述。")]),a._v(" "),t("p",[a._v("比如「永久代&元空间」这 2 个概念《Java 虚拟机规范》并没有声明，只是 HotSpot 或者其他虚拟机在实现「方法区」规范时的命名。")]),a._v(" "),t("p",[a._v("HotSpot 在 JDK8 时用元空间代替了永久代，其实是重新实现了方法区规范，其他虚拟机不一定有元空间这个概念。（参考后续「方法区」详细介绍）")]),a._v(" "),t("p",[a._v("虚拟机规范的具体实现以实际使用的虚拟机为主。以下内容不做特殊说明表示 HotSpot 虚拟机的规范实现。")]),a._v(" "),t("h2",{attrs:{id:"程序计数器"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#程序计数器"}},[a._v("#")]),a._v(" 程序计数器")]),a._v(" "),t("p",[a._v("程序计数器（Program Counter Register）是一块较小的内存空间，它可以看作是当前线程所执行的字节码的行号指示器。")]),a._v(" "),t("p",[a._v("在 Java 虚拟机的概念模型里，字节码解释器工作时就是通过改变这个计数器的值来选取下一条需要执行的字节码指令，它是程序控制流的指示器，分支、循环、跳转、异常处理、线程恢复等基础功能都需要依赖这个计数器来完成。")]),a._v(" "),t("p",[a._v("由于 Java 虚拟机的多线程是通过线程轮流切换、分配处理器执行时间的方式来实现的，在任何一个确定的时刻，一个处理器（对于多核处理器来说是一个内核）都只会执行一条线程中的指令。\n因此，为了线程切换后能恢复到正确的执行位置，每条线程都需要有一个独立的程序计数器，各条线程之间计数器互不影响，独立存储，我们称这类内存区域为「线程私有」的内存。")]),a._v(" "),t("ul",[t("li",[a._v("如果线程正在执行的是一个 Java 方法，这个计数器记录的是正在执行的虚拟机字节码指令的地址")]),a._v(" "),t("li",[a._v("如果正在执行的是本地（Native）方法，这个计数器值则应为空（Undefined）")])]),a._v(" "),t("p",[t("br"),a._v("\n异常情况："),t("br"),a._v("\n此内存区域是唯一一个在《Java 虚拟机规范》中没有规定任何 OutOfMemoryError 情况的区域。")]),a._v(" "),t("h2",{attrs:{id:"java-虚拟机栈"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#java-虚拟机栈"}},[a._v("#")]),a._v(" Java 虚拟机栈")]),a._v(" "),t("p",[a._v("与程序计数器一样，Java 虚拟机栈（Java Virtual Machine Stack）也是线程私有的，它的生命周期与线程相同。")]),a._v(" "),t("p",[a._v("虚拟机栈描述的是 Java 方法执行的线程内存模型：")]),a._v(" "),t("ul",[t("li",[a._v("每个方法被执行的时候，Java 虚拟机都会同步创建一个栈帧（Stack Frame）用于存储局部变量表、操作数栈、动态连接、方法出口等信息。")]),a._v(" "),t("li",[a._v("每一个方法被调用直至执行完毕的过程，就对应着一个栈帧在虚拟机栈中从入栈到出栈的过程。")])]),a._v(" "),t("p",[a._v("局部变量表存放了编译期可知的各种 Java 虚拟机基本数据类型（boolean、byte、char、short、int、float、long、double）、对象引用（reference 类型，它并不等同于对象本身，可能是一个指向对象起始地址的引用指针，也可能是指向一个代表对象的句柄或者其他与此对象相关的位置）和 returnAddress 类型（指向了一条字节码指令的地址）。")]),a._v(" "),t("p",[t("br"),a._v("\n异常情况：")]),a._v(" "),t("ul",[t("li",[a._v("如果线程请求的栈深度大于虚拟机所允许的深度，将抛出 StackOverflowError 异常；")]),a._v(" "),t("li",[a._v("如果 Java 虚拟机栈容量可以动态扩展，当栈扩展时无法申请到足够的内存会抛出 OutOfMemoryError 异常。（HotSpot 虚拟机的栈容量是不可以动态扩展）")])]),a._v(" "),t("h2",{attrs:{id:"本地方法栈"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#本地方法栈"}},[a._v("#")]),a._v(" 本地方法栈")]),a._v(" "),t("p",[a._v("本地方法栈（Native Method Stacks）与虚拟机栈所发挥的作用是非常相似的，与虚拟机栈区别是：")]),a._v(" "),t("ul",[t("li",[a._v("虚拟机栈为虚拟机执行 Java 方法（也就是字节码）服务。")]),a._v(" "),t("li",[a._v("本地方法栈则是为虚拟机使用到的本地（Native）方法服务。")])]),a._v(" "),t("p",[t("br"),a._v("\n异常状况："),t("br"),a._v("\n与虚拟机栈一样，本地方法栈也会在栈深度溢出或者栈扩展失败时分别抛出 StackOverflowError 和 OutOfMemoryError 异常")]),a._v(" "),t("h2",{attrs:{id:"java-堆"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#java-堆"}},[a._v("#")]),a._v(" Java 堆")]),a._v(" "),t("p",[a._v("Java 堆是被所有线程共享的一块内存区域，在虚拟机启动时创建。此内存区域的唯一目的就是存放对象实例，Java 世界里「几乎」所有的对象实例都在这里分配内存")]),a._v(" "),t("p",[a._v("所有线程共享的 Java 堆中可以划分出多个线程私有的分配缓冲区（Thread Local Allocation Buffer，TLAB），以提升对象分配时的效率。")]),a._v(" "),t("p",[a._v("Java 堆可以处于物理上不连续的内存空间中，但在逻辑上它应该被视为连续的，这点就像我们用磁盘空间去存储文件一样，并不要求每个文件都连续存放。但对于大对象（典型的如数组对象），多数虚拟机实现出于实现简单、存储高效的考虑，很可能会要求连续的内存空间。")]),a._v(" "),t("p",[t("br"),a._v("\n异常状况："),t("br"),a._v("\n如果在 Java 堆中没有内存完成实例分配，并且堆也无法再扩展时，Java 虚拟机将会抛出 OutOfMemoryError 异常。")]),a._v(" "),t("h2",{attrs:{id:"方法区"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#方法区"}},[a._v("#")]),a._v(" 方法区")]),a._v(" "),t("p",[a._v("方法区（Method Area）与 Java 堆一样，是各个线程共享的内存区域，它用于存储已被虚拟机加载的类型信息、常量、静态变量、即时编译器编译后的代码缓存等数据。")]),a._v(" "),t("p",[t("br"),a._v("\n异常状况："),t("br"),a._v("\n如果方法区无法满足新的内存分配需求时，将抛出 OutOfMemoryError 异常。")]),a._v(" "),t("h3",{attrs:{id:"永久代-元空间"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#永久代-元空间"}},[a._v("#")]),a._v(" 永久代&元空间")]),a._v(" "),t("p",[a._v("方法区是 JVM 提出的规范，而各个虚拟机的实现可以是不同的")]),a._v(" "),t("ul",[t("li",[a._v("永久代则是 JDK8 前 Hotspot 虚拟机规范的实现（Java Heap 中）")]),a._v(" "),t("li",[a._v("元空间 JRockit、J9、JDK8 后 HotSpot 虚拟机的实现（在本地内存）")])]),a._v(" "),t("p",[a._v("为什么 HotSpot 移除永久代？")]),a._v(" "),t("ul",[t("li",[a._v("移除永久代后，不会遇到永久代存在的内存溢出错误，也不会出现泄漏的数据移到交换区这样的事情。最终用户可以为元空间设置一个可用空间最大值，如果不进行设置，JVM 会自动根据类的元数据大小动态增加元空间的容量。")]),a._v(" "),t("li",[a._v("这项改动是很有必要的，因为对永久代进行调优是很困难的。永久代中的元数据可能会随着每一次 Full GC 发生而进行移动。")])]),a._v(" "),t("p",[a._v("HotSpot 虚拟机移除永久代改为元空间实现过程是？")]),a._v(" "),t("ul",[t("li",[a._v("JDK 6，HotSpot 开发团队就有放弃永久代，逐步改为采用本地内存（Native Memory）来实现方法区的计划了")]),a._v(" "),t("li",[a._v("JDK 7，HotSpot 已经把原本放在永久代的字符串常量池、静态变量等移出")]),a._v(" "),t("li",[a._v("JDK 8，终于完全废弃了永久代的概念，改用与 JRockit、J9 一样在本地内存中实现的元空间（Meta-space）来代替，把 JDK 7 中永久代还剩余的内容（主要是类型信息）全部移到元空间中。")])]),a._v(" "),t("h3",{attrs:{id:"运行时常量池"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#运行时常量池"}},[a._v("#")]),a._v(" 运行时常量池")]),a._v(" "),t("p",[a._v("运行时常量池（Runtime Constant Pool）是方法区的一部分。")]),a._v(" "),t("p",[a._v("Class 文件中除了有类的版本、字段、方法、接口等描述信息外，还有一项信息是常量池表（Constant Pool Table），用于存放编译期生成的各种字面量与符号引用，这部分内容将在类加载后存放到方法区的运行时常量池中。")]),a._v(" "),t("p",[a._v("运行期间也可以将新的常量放入池中，这种特性被利用得比较多的便是 String.intern 方法。")]),a._v(" "),t("p",[t("br"),a._v("\n异常状况："),t("br"),a._v("\n受到方法区内存的限制，当常量池无法再申请到内存时会抛出 OutOfMemoryError 异常。")]),a._v(" "),t("h2",{attrs:{id:"直接内存"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#直接内存"}},[a._v("#")]),a._v(" 直接内存")]),a._v(" "),t("p",[a._v("直接内存（Direct Memory）并不是虚拟机运行时数据区的一部分，也不是《Java 虚拟机规范》中定义的内存区域。")]),a._v(" "),t("p",[a._v("在 JDK 1.4 中新加入了 NIO 类，引入了一种基于通道（Channel）与缓冲区（Buffer）的 I/O 方式，它可以使用 Native 函数库直接分配堆外内存，然后通过一个存储在 Java 堆里面的 DirectByteBuffer 对象作为这块内存的引用进行操作。\n这样能在一些场景中显著提高性能，因为避免了在 Java 堆和 Native 堆中来回复制数据。")]),a._v(" "),t("p",[a._v("DirectByteBuffer 对象本身在 JVM 堆上，但是它持有的字节数组不是从 JVM 堆上分配的，而是从本地内存分配的。\nDirectByteBuffer 对象中有个 long 类型字段 address，记录着本地内存的地址，这样在接收数据的时候，直接把这个本地内存地址传递给程序，程序会将网络数据从内核拷贝到这个本地内存，JVM 可以直接读取这个本地内存。")]),a._v(" "),t("blockquote",[t("p",[a._v("可调研《kafka 零拷贝原理》《IO 模型》，深入了解直接内存的概念")])]),a._v(" "),t("p",[a._v("异常状况："),t("br"),a._v("\n可能导致 OutOfMemoryError 异常出现")]),a._v(" "),t("h2",{attrs:{id:"本地内存"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#本地内存"}},[a._v("#")]),a._v(" 本地内存")]),a._v(" "),t("p",[a._v("本地内存（Native Memory），是在进程地址空间内分配的内存，该内存不在堆内，因此不会被 Java 垃圾收集器释放。主要用来：")]),a._v(" "),t("ul",[t("li",[a._v("管理 Java Heap（Java 堆）的状态数据，用于 GC")]),a._v(" "),t("li",[a._v("JNI 调用，也就是 Native Stack")]),a._v(" "),t("li",[a._v("JIT（即时编译器）编译时使用 Native Memory，并且 JIT 的输入（Java 字节码）和输出（可执行代码）也都是保存在 Native Memory")]),a._v(" "),t("li",[a._v("NIO direct buffer。对于 IBM JVM 和 Hotspot，都可以通过-XX:MaxDirectMemorySize 来设置 nio 直接缓冲区的最大值。默认是 64M。超过这个时，会按照 32M 自动增大")]),a._v(" "),t("li",[a._v("对于 IBM 的 JVM 某些版本实现，类加载器和类信息都是保存在 Native Memory 中的")])]),a._v(" "),t("h2",{attrs:{id:"参考"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#参考"}},[a._v("#")]),a._v(" 参考")]),a._v(" "),t("ul",[t("li",[a._v("《深入理解 Java 虚拟机：JVM 高级特性与最佳实践（第 3 版）》周志明 著")]),a._v(" "),t("li",[t("a",{attrs:{href:"https://stackoverflow.com/questions/30622818/off-heap-native-heap-direct-memory-and-native-memory",target:"_blank",rel:"noopener noreferrer"}},[a._v("off-heap, native heap, direct memory and native memory"),t("OutboundLink")],1)]),a._v(" "),t("li",[a._v("参考本专栏文章 "),t("a",{attrs:{href:"https://gourderwa.blog.csdn.net/article/details/103979966",target:"_blank",rel:"noopener noreferrer"}},[a._v("Java JVM 运行时栈帧结构、字节码分析实战"),t("OutboundLink")],1)])])])}),[],!1,null,null,null);v.default=e.exports}}]);