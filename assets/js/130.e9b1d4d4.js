(window.webpackJsonp=window.webpackJsonp||[]).push([[130],{503:function(t,a,s){"use strict";s.r(a);var n=s(10),e=Object(n.a)({},(function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("blockquote",[s("p",[t._v("专栏原创出处："),s("a",{attrs:{href:"https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency",target:"_blank",rel:"noopener noreferrer"}},[t._v("github-源笔记文件 "),s("OutboundLink")],1),t._v(" ，"),s("a",{attrs:{href:"https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency",target:"_blank",rel:"noopener noreferrer"}},[t._v("github-源码 "),s("OutboundLink")],1),t._v("，欢迎 Star，转载请附上原文出处链接和本声明。")])]),t._v(" "),s("p",[t._v("Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 "),s("a",{attrs:{href:"https://review-notes.top/language/java-concurrency/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Java 并发编程 "),s("OutboundLink")],1)]),t._v(" "),s("p"),s("div",{staticClass:"table-of-contents"},[s("ul",[s("li",[s("a",{attrs:{href:"#cas-是什么"}},[t._v("CAS 是什么")])]),s("li",[s("a",{attrs:{href:"#cas-方法解读"}},[t._v("CAS 方法解读")])]),s("li",[s("a",{attrs:{href:"#cas-实现原理"}},[t._v("CAS 实现原理")])]),s("li",[s("a",{attrs:{href:"#cas-实现原子操作的三大问题"}},[t._v("CAS 实现原子操作的三大问题")]),s("ul",[s("li",[s("a",{attrs:{href:"#问题一-aba-问题"}},[t._v("问题一：ABA 问题")])]),s("li",[s("a",{attrs:{href:"#问题二-循环时间长开销大"}},[t._v("问题二：循环时间长开销大")])]),s("li",[s("a",{attrs:{href:"#问题三-只能保证一个共享变量的原子操作"}},[t._v("问题三：只能保证一个共享变量的原子操作")])])])]),s("li",[s("a",{attrs:{href:"#使用场景"}},[t._v("使用场景")])]),s("li",[s("a",{attrs:{href:"#参考"}},[t._v("参考")])])])]),s("p"),t._v(" "),s("h2",{attrs:{id:"cas-是什么"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#cas-是什么"}},[t._v("#")]),t._v(" CAS 是什么")]),t._v(" "),s("p",[t._v("CAS 是英文单词 Compare And Swap 的缩写，翻译过来就是比较并替换。Java 的 compareAndSet(jdk13)/compareAndSwap(jdk1.8) 相关方法调用简称为 CAS。")]),t._v(" "),s("p",[t._v("CAS 机制当中使用了 3 个基本操作数：内存地址 V，旧的预期值 A，要修改的新值 B。更新一个变量的时候，只有当变量的预期值 A 和内存地址 V 当中的实际值相同时，才会将内存地址 V 对应的值修改为 B。")]),t._v(" "),s("p",[t._v("CAS 操作的是乐观锁，每次不加锁而是假设没有冲突而去完成某项操作，如果因为冲突失败就重试，直到成功为止。")]),t._v(" "),s("blockquote",[s("p",[t._v("JDK 文档对 compareAndSet() 方法说明：如果当前状态值等于预期值，则以原子方式将同步状态 设置为给定的更新值。此操作具有 volatile 读和写的内存语义。")])]),t._v(" "),s("h2",{attrs:{id:"cas-方法解读"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#cas-方法解读"}},[t._v("#")]),t._v(" CAS 方法解读")]),t._v(" "),s("p",[t._v("以 Unsafe#compareAndSetInt 方法为例进行说明")]),t._v(" "),s("div",{staticClass:"language-java extra-class"},[s("pre",{pre:!0,attrs:{class:"language-java"}},[s("code",[t._v("    "),s("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[t._v("@HotSpotIntrinsicCandidate")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("final")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("native")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("boolean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("compareAndSwapInt")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Object")]),t._v(" o"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),t._v(" offset"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n                                                 "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" expected"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n                                                 "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" x"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),s("p",[t._v("方法解读：")]),t._v(" "),s("ul",[s("li",[t._v("o 是操作的对象")]),t._v(" "),s("li",[t._v("offset 是 o 对象中某字段在内存中的偏移量（比如对象 AtomicInteger 中有一个 "),s("code",[t._v("volatile int value")]),t._v(" 的字段）")]),t._v(" "),s("li",[t._v("读取传入对象 o 在内存中偏移量为 offset 位置的值与期望值 expected 作比较。")]),t._v(" "),s("li",[t._v("相等就把 x 值赋值给 offset 位置的值。方法返回 true。")]),t._v(" "),s("li",[t._v("不相等，就取消赋值，方法返回 false。")])]),t._v(" "),s("hr"),t._v(" "),s("p",[t._v("实际使用示例（AtomicInteger#compareAndSet）：")]),t._v(" "),s("div",{staticClass:"language-java extra-class"},[s("pre",{pre:!0,attrs:{class:"language-java"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("class")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("AtomicInteger")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("extends")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Number")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("implements")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[s("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("java"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("io"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")])]),t._v("Serializable")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Unsafe 类定义")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("private")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("static")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("final")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Unsafe")]),t._v(" unsafe "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Unsafe")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getUnsafe")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 获取变量 value 在内存中对应的地址偏移量")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("private")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("static")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("final")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),t._v(" valueOffset"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("static")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("try")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            valueOffset "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" unsafe"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("objectFieldOffset "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 内存中对应的地址偏移量获取")]),t._v("\n                "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("AtomicInteger")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getDeclaredField")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"value"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("catch")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Exception")]),t._v(" ex"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("throw")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Error")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("ex"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("private")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("volatile")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        \n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// expectedValue 预期值、newValue 修改值")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("final")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("boolean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("compareAndSet")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" expect"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" update"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" unsafe"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("compareAndSwapInt")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" valueOffset"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" expect"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" update"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),s("h2",{attrs:{id:"cas-实现原理"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#cas-实现原理"}},[t._v("#")]),t._v(" CAS 实现原理")]),t._v(" "),s("p",[t._v("分析 Java 中"),s("code",[t._v("Unsafe#compareAndSwapInt")]),t._v("方法。"),s("br"),t._v("\nnative 方法最终调用实现"),s("code",[t._v("hotspot/src/os_cpu/linux_x86/vm/atomic_linux_x86.inline.hpp")]),t._v("中"),s("code",[t._v("Atomic::cmpxchg")]),t._v("实现")]),t._v(" "),s("div",{staticClass:"language-c extra-class"},[s("pre",{pre:!0,attrs:{class:"language-c"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("inline")]),t._v(" jint Atomic"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("::")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("cmpxchg")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("jint exchange_value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("volatile")]),t._v(" jint"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" dest"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" jint compare_value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" mp "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" os"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("::")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("is_MP")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  __asm__ "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("volatile")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("LOCK_IF_MP")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("%")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("4")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"cmpxchgl %1,(%3)"')]),t._v("\n                    "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"=a"')]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("exchange_value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n                    "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"r"')]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("exchange_value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"a"')]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("compare_value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"r"')]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("dest"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"r"')]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("mp"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n                    "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"cc"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"memory"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" exchange_value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),s("p",[t._v("程序会根据当前处理器的类型来决定是否为 cmpxchg 指令添加 lock 前缀。")]),t._v(" "),s("ul",[s("li",[t._v("如果程序是在多处理器上运行，就为 cmpxchg 指令加上 lock 前缀 (Lock Cmpxchg)。")]),t._v(" "),s("li",[t._v("如果程序是在单处理器上运行，就省略 lock 前缀 (单处理器自身会维护单处理器内的顺序一致性，不需要 lock 前缀提供的内存屏障效果)。")])]),t._v(" "),s("hr"),t._v(" "),s("p",[t._v("intel 的手册对 lock 前缀的说明如下：")]),t._v(" "),s("ol",[s("li",[t._v("确保对内存的读-改-写操作原子执行。在 Pentium 及 Pentium 之前的处理器中，带有 lock 前缀的指令在执行期间会锁住总线，使得其他处理器暂时无法通过总线访问内存。很显然，这会带来昂贵的开销。从 Pentium 4、Intel Xeon 及 P6 处理器开始，Intel 使用缓存锁定 (Cache Locking) 来保证指令执行的原子性。缓存锁定将大大降低 lock 前缀指令的执行开销。")]),t._v(" "),s("li",[t._v("禁止该指令，与之前和之后的读和写指令重排序。")]),t._v(" "),s("li",[t._v("把写缓冲区中的所有数据刷新到内存中。")])]),t._v(" "),s("p",[t._v("上面的第 2 点和第 3 点所具有的内存屏障效果，足以同时实现 volatile 读和 volatile 写的内存语义。")]),t._v(" "),s("p",[t._v("经过上面的分析，现在我们终于能明白为什么 JDK 文档说 CAS 同时具有 volatile 读和 volatile 写的内存语义了。")]),t._v(" "),s("h2",{attrs:{id:"cas-实现原子操作的三大问题"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#cas-实现原子操作的三大问题"}},[t._v("#")]),t._v(" CAS 实现原子操作的三大问题")]),t._v(" "),s("h3",{attrs:{id:"问题一-aba-问题"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#问题一-aba-问题"}},[t._v("#")]),t._v(" 问题一：ABA 问题")]),t._v(" "),s("p",[t._v("因为 CAS 需要在操作值的时候，检查值有没有发生变化，如果没有发生变化则更新，但是如果一个值原来是 A，变成了 B，又变成了 A，那么使用 CAS 进行检查时会发现它的值没有发生变化，但是实际上却变化了。")]),t._v(" "),s("p",[t._v("ABA 问题的解决思路就是使用版本号。在变量前面 追加上版本号，每次变量更新的时候把版本号加 1，那么 A→B→A 就会变成 1A→2B→3A。从 Java 1.5 开始，JDK 的 Atomic 包里提供了一个类 AtomicStampedReference 来解决 ABA 问题。\n这个类的 compareAndSet 方法的作用是首先检查当前引用是否等于预期引用，并且检查当前标志是否等于预期标志，如果全部相等，则以原子方式将该引用和该标志的值设置为给定的更新值。")]),t._v(" "),s("h3",{attrs:{id:"问题二-循环时间长开销大"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#问题二-循环时间长开销大"}},[t._v("#")]),t._v(" 问题二：循环时间长开销大")]),t._v(" "),s("p",[t._v("自旋 CAS 如果长时间不成功，会给 CPU 带来非常大的执行开销。"),s("br"),t._v("\n如果 JVM 能支持处理器提供的 pause 指令，那么效率会有一定的提升。\npause 指令有两个作用:")]),t._v(" "),s("ol",[s("li",[t._v("它可以延迟流水线执行指令 (de-pipeline)，使 CPU 不会消耗过多的执行资源，延迟的时间取决于具体实现的版本，在一些处理器上延迟时间是零;")]),t._v(" "),s("li",[t._v("它可以避免在退出循环的时候因内存顺序冲突 (Memory Order Violation) 而引起 CPU 流水线被清空 (CPU Pipeline Flush)，从而提高 CPU 的执行效率。")])]),t._v(" "),s("h3",{attrs:{id:"问题三-只能保证一个共享变量的原子操作"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#问题三-只能保证一个共享变量的原子操作"}},[t._v("#")]),t._v(" 问题三：只能保证一个共享变量的原子操作")]),t._v(" "),s("p",[t._v("当对一个共享变量执行操作时，我们可以使用循环 CAS 的方式来保证原子操作，但是对多个共享变量操作时，循环 CAS 就无法保证操作的原子性，这个时候就可以"),s("strong",[t._v("用锁")]),t._v("。")]),t._v(" "),s("p",[t._v("还有一个取巧的办法，就是把多个共享变量"),s("strong",[t._v("合并成一个共享变量来操作")]),t._v("。比如，有两个共享变量 i=2，j=a，合并一下 ij=2a，然后用 CAS 来操作 ij。从 Java 1.5 开始，JDK 提供了 AtomicReference 类来保证引用对象之间的原子性，就可以把多个变量放在一个对象里来进行 CAS 操作。")]),t._v(" "),s("h2",{attrs:{id:"使用场景"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#使用场景"}},[t._v("#")]),t._v(" 使用场景")]),t._v(" "),s("ul",[s("li",[t._v("参考 "),s("code",[t._v("CAS 实现原子操作的三大问题")]),t._v("，保证存在问题与需求不会冲突")]),t._v(" "),s("li",[t._v("我们在并发修改单个变量时，是否需要"),s("strong",[t._v("先比较再修改")]),t._v("（!!!重点），如果不需要那 "),s("code",[t._v("volatile")]),t._v(" 是否满足需求 ？")])]),t._v(" "),s("h2",{attrs:{id:"参考"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#参考"}},[t._v("#")]),t._v(" 参考")]),t._v(" "),s("ul",[s("li",[t._v("并发编程的艺术")]),t._v(" "),s("li",[s("a",{attrs:{href:"https://juejin.im/post/5a73cbbff265da4e807783f5",target:"_blank",rel:"noopener noreferrer"}},[t._v("Java CAS 原理剖析 "),s("OutboundLink")],1)])])])}),[],!1,null,null,null);a.default=e.exports}}]);