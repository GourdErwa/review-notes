(window.webpackJsonp=window.webpackJsonp||[]).push([[111],{484:function(v,_,i){"use strict";i.r(_);var l=i(10),a=Object(l.a)({},(function(){var v=this,_=v.$createElement,i=v._self._c||_;return i("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[i("h2",{attrs:{id:"自我面试"}},[i("a",{staticClass:"header-anchor",attrs:{href:"#自我面试"}},[v._v("#")]),v._v(" 自我面试")]),v._v(" "),i("ul",[i("li",[i("p",[v._v("背书式的学习对技术的提升帮助很小。")])]),v._v(" "),i("li",[i("p",[v._v("本篇内容不涉及答案，答案需要去相关专栏学习。")])]),v._v(" "),i("li",[i("p",[v._v("把面试看作是费曼学习法中的回顾、授课环节。首先我们能讲给自己听，如果不满意再回炉学习总结，如此反复。")])])]),v._v(" "),i("p",[i("strong",[v._v("专栏学习地址：")])]),v._v(" "),i("ul",[i("li",[i("p",[v._v("CSDN-同步发布 "),i("a",{attrs:{href:"https://blog.csdn.net/xiaohulunb/article/details/103594468",target:"_blank",rel:"noopener noreferrer"}},[v._v("Java 并发编程专栏 "),i("OutboundLink")],1)])]),v._v(" "),i("li",[i("p",[v._v("CSDN-同步发布 "),i("a",{attrs:{href:"https://blog.csdn.net/xiaohulunb/article/details/103828570",target:"_blank",rel:"noopener noreferrer"}},[v._v("Java 虚拟机（JVM) 专栏 "),i("OutboundLink")],1)])]),v._v(" "),i("li",[i("p",[v._v("个人技术博客-同步发布 "),i("a",{attrs:{href:"https://review-notes.top/language/java-concurrency/",target:"_blank",rel:"noopener noreferrer"}},[v._v("Java 并发编程专栏 "),i("OutboundLink")],1)])]),v._v(" "),i("li",[i("p",[v._v("个人技术博客-同步发布 "),i("a",{attrs:{href:"https://review-notes.top/language/java-jvm/",target:"_blank",rel:"noopener noreferrer"}},[v._v("Java 虚拟机（JVM) 专栏 "),i("OutboundLink")],1)])])]),v._v(" "),i("h2",{attrs:{id:"一、并发编程面试题"}},[i("a",{staticClass:"header-anchor",attrs:{href:"#一、并发编程面试题"}},[v._v("#")]),v._v(" 一、并发编程面试题")]),v._v(" "),i("h3",{attrs:{id:"内存模型"}},[i("a",{staticClass:"header-anchor",attrs:{href:"#内存模型"}},[v._v("#")]),v._v(" 内存模型")]),v._v(" "),i("ul",[i("li",[v._v("内存模型\n"),i("ul",[i("li",[v._v("定义")]),v._v(" "),i("li",[v._v("为什么要有内存模型")]),v._v(" "),i("li",[v._v("为什么要重排序，重排序在什么时候排")]),v._v(" "),i("li",[v._v("如何约束重排序规则")]),v._v(" "),i("li",[v._v("happens-before")])])]),v._v(" "),i("li",[v._v("什么是顺序一致性")]),v._v(" "),i("li",[v._v("CAS 实现的原理，是阻塞还是非阻塞方式？什么时候用，使用时需要考虑的问题")]),v._v(" "),i("li",[v._v("处理器和 Java 分别怎么保证原子操作")]),v._v(" "),i("li",[v._v("保证了原子性就能保证可见性吗？")]),v._v(" "),i("li",[v._v("final 内存语义？什么时候用，使用时需要考虑的问题")]),v._v(" "),i("li",[v._v("volatile 内存语义，什么时候用，用的时候需要考虑什么问题")]),v._v(" "),i("li",[v._v("synchronized 内存语义，什么时候用，和锁比较一下优缺点")]),v._v(" "),i("li",[v._v("synchronized 中涉及的锁升级流程")]),v._v(" "),i("li",[v._v("锁的内存语义，举例说明，加锁失败时候的处理流程")]),v._v(" "),i("li",[v._v("比较下 CAS 、volatile 、synchronized、Lock 区别")]),v._v(" "),i("li",[v._v("原子操作类底层实现机制？自增操作是怎么保证原子性的？")])]),v._v(" "),i("h3",{attrs:{id:"线程"}},[i("a",{staticClass:"header-anchor",attrs:{href:"#线程"}},[v._v("#")]),v._v(" 线程")]),v._v(" "),i("ul",[i("li",[v._v("线程的状态有哪些")]),v._v(" "),i("li",[v._v("如何在 Java 中实现线程？")]),v._v(" "),i("li",[v._v("如何在 Java 中启动一个线程？")]),v._v(" "),i("li",[v._v("设计线程中断的意义是什么")]),v._v(" "),i("li",[v._v("Java 中 interrupted 和 isInterrupted 方法的区别？")]),v._v(" "),i("li",[v._v("如何停止一个线程？")]),v._v(" "),i("li",[v._v("线程 join 方法干什么用？")]),v._v(" "),i("li",[v._v("有三个线程 T1，T2，T3，怎么确保它们按顺序执行？")]),v._v(" "),i("li",[v._v("线程的等待通知机制实现机制？")]),v._v(" "),i("li",[v._v("为什么应该在循环中检查等待条件?")]),v._v(" "),i("li",[v._v("为什么 wait 和 notify 方法要在同步块中调用？")]),v._v(" "),i("li",[v._v("为什么 wait, notify 和 notifyAll 这些方法不在 thread 类里面？")]),v._v(" "),i("li",[v._v("ThreadLocal 是什么，怎么实现的")]),v._v(" "),i("li",[v._v("线程池是什么，提交一个任务进去，处理流程？")]),v._v(" "),i("li",[v._v("Executor 框架介绍")]),v._v(" "),i("li",[v._v("JUC 包中提供了哪些配置好的线程池，差异化是什么")]),v._v(" "),i("li",[v._v("什么是 FutureTask？")])]),v._v(" "),i("h3",{attrs:{id:"锁"}},[i("a",{staticClass:"header-anchor",attrs:{href:"#锁"}},[v._v("#")]),v._v(" 锁")]),v._v(" "),i("ul",[i("li",[v._v("Lock 接口提供了哪些实现类")]),v._v(" "),i("li",[v._v("AQS 是什么，提供了哪些方法")]),v._v(" "),i("li",[v._v("AQS 中独占锁和共享锁的操作流程大体描述一下")]),v._v(" "),i("li",[v._v("重入锁有什么好处，什么时候考虑用")]),v._v(" "),i("li",[v._v("读写锁有什么好处，什么时候考虑用？读锁是什么类型的锁，写锁呢？")]),v._v(" "),i("li",[v._v("说下读写锁里的锁降级流程，什么时候可以考虑用这个机制")]),v._v(" "),i("li",[v._v("park 方法是怎么实现的")]),v._v(" "),i("li",[v._v("锁的等待通知机制 Condition 是怎么实现的，有了线程的等待通知机制为什么还要设计 Condition？")]),v._v(" "),i("li",[v._v("死锁怎么产生的，如何避免")]),v._v(" "),i("li",[v._v("说说 Java 中有哪些锁")]),v._v(" "),i("li",[v._v("sleep、wait、park、Condition 都能让线程等待，有什么区别？")]),v._v(" "),i("li",[v._v("所谓 sleep 不会释放锁，wait 会释放锁，释放锁后重新获取时它的上下文数据如何处理的？")]),v._v(" "),i("li",[v._v("释放锁会让 CPU 进行上下文切换吗？")])]),v._v(" "),i("h3",{attrs:{id:"容器与工具"}},[i("a",{staticClass:"header-anchor",attrs:{href:"#容器与工具"}},[v._v("#")]),v._v(" 容器与工具")]),v._v(" "),i("ul",[i("li",[v._v("阻塞和非阻塞有什么区别，他们可以用什么方式实现")]),v._v(" "),i("li",[v._v("队列（Queue）提供哪些操作")]),v._v(" "),i("li",[v._v("阻塞队列提供了哪些获取元素的方法，有什么区别？")]),v._v(" "),i("li",[v._v("阻塞队列有哪些实现？为什么要分有界无界？")]),v._v(" "),i("li",[v._v("CountDownLatch 怎么实现的，什么时候考虑用？")]),v._v(" "),i("li",[v._v("CyclicBarrier 怎么实现的，什么时候考虑用？")]),v._v(" "),i("li",[v._v("Semaphore 怎么实现的，什么时候考虑用？")]),v._v(" "),i("li",[v._v("如何在两个线程间共享数据？")]),v._v(" "),i("li",[v._v("Exchanger 怎么实现的，什么时候考虑用？")]),v._v(" "),i("li",[v._v("ConcurrentHashMap 实现？")]),v._v(" "),i("li",[v._v("fork/join 框架是什么？")])]),v._v(" "),i("h2",{attrs:{id:"二、jvm-虚拟机面试题"}},[i("a",{staticClass:"header-anchor",attrs:{href:"#二、jvm-虚拟机面试题"}},[v._v("#")]),v._v(" 二、JVM 虚拟机面试题")]),v._v(" "),i("h3",{attrs:{id:"内存管理"}},[i("a",{staticClass:"header-anchor",attrs:{href:"#内存管理"}},[v._v("#")]),v._v(" 内存管理")]),v._v(" "),i("ul",[i("li",[v._v("为什么需要 JVM？")]),v._v(" "),i("li",[v._v("简单描述 JMM 和 JVM 两个概念")]),v._v(" "),i("li",[v._v("JVM 内存管理")]),v._v(" "),i("li",[v._v("永久代、元空间、方法区的关系")]),v._v(" "),i("li",[v._v("类加载过程")]),v._v(" "),i("li",[v._v("双亲委派模式有什么好处")]),v._v(" "),i("li",[v._v("如何覆盖 JDK 提供的组件，比如覆盖 ArrayList 的实现")]),v._v(" "),i("li",[v._v("new 一个对象的过程发生了什么（类加载、变量初始化、内存分配）")]),v._v(" "),i("li",[v._v("对象的死亡过程")]),v._v(" "),i("li",[v._v("JVM 可能会抛出哪些 OOM")]),v._v(" "),i("li",[v._v("垃圾回收算法有哪些？优缺点比较")]),v._v(" "),i("li",[v._v("熟知的垃圾回收器有哪些，简单描述每个应用场景")]),v._v(" "),i("li",[v._v("CMS 和 G1 的垃圾回收步骤是？")]),v._v(" "),i("li",[v._v("G1 相对于 CMS 的优缺点")])]),v._v(" "),i("h3",{attrs:{id:"性能监控与调优"}},[i("a",{staticClass:"header-anchor",attrs:{href:"#性能监控与调优"}},[v._v("#")]),v._v(" 性能监控与调优")]),v._v(" "),i("ul",[i("li",[v._v("如何监控 GC")]),v._v(" "),i("li",[v._v("常见 OutOfMemoryError 有哪些")]),v._v(" "),i("li",[v._v("常见的 JDK 诊断命令有哪些，应用场景？")]),v._v(" "),i("li",[v._v("CPU 较高，如何定位问题")]),v._v(" "),i("li",[v._v("内存占用较高，如何定位大对象")]),v._v(" "),i("li",[v._v("内存泄漏时，如何实时跟踪内存变化情况")]),v._v(" "),i("li",[v._v("内存泄漏时，如何定位问题代码")]),v._v(" "),i("li",[v._v("大型项目如何进行性能瓶颈调优？")])]),v._v(" "),i("h3",{attrs:{id:"虚拟机子系统"}},[i("a",{staticClass:"header-anchor",attrs:{href:"#虚拟机子系统"}},[v._v("#")]),v._v(" 虚拟机子系统")]),v._v(" "),i("ul",[i("li",[v._v("字节码是如何在 JVM 中进行流转的（栈帧）")]),v._v(" "),i("li",[v._v("方法调用的底层实现")]),v._v(" "),i("li",[v._v("方法重写和重载的实现过程")]),v._v(" "),i("li",[v._v("invokedynamic 指令实现")]),v._v(" "),i("li",[v._v("如何修改字节码")]),v._v(" "),i("li",[v._v("JIT 参数配置如何影响程序运行？")]),v._v(" "),i("li",[v._v("虚拟机有哪些性能优化策略")])])])}),[],!1,null,null,null);_.default=a.exports}}]);