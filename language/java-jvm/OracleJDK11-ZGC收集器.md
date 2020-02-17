> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-jvm) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-jvm)，欢迎 Star，转载请附上原文出处链接和本声明。

Java JVM-虚拟机专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java JVM-虚拟机 ](https://review-notes.top/language/java-jvm/)

[toc]
## 前言
目标是创建一个可扩展的低延迟垃圾收集器，该垃圾收集器能够处理大小从几GB到几TB的堆，并且GC暂停时间不超过10ms。

项目由HotSpot Group

## 参考
- 《深入理解 Java 虚拟机：JVM 高级特性与最佳实践（第 3 版）》周志明 著
- [wiki.openjdk-ZGC](https://wiki.openjdk.java.net/display/zgc/Main)
- [ZGC 原理是什么，它为什么能做到低延时？R大回答](https://www.zhihu.com/question/287945354/answer/458761494)
- [An Introduction to ZGC](https://www.baeldung.com/jvm-zgc-garbage-collector)