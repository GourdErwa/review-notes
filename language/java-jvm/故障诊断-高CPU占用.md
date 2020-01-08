> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-jvm) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-jvm)，欢迎 Star，转载请附上原文出处链接和本声明。

Java JVM-虚拟机专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java JVM-虚拟机 ](https://review-notes.top/language/java-jvm/)

[[toc]]

## 排查过程
- 执行 `top` 命令，定位高 CPU 占用的 PID
```shell{2}
  PID USER  PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+     COMMAND
10834 hdfs  20   0 6125996   3.4g   6800 S  107.0  5.4    343:35.01  /usr/java/jdk1.8...
```

- 执行 `ps -mp PID -o THREAD,tid,time` 命令查看线程耗时情况

```shell{4}
ps -mp 10834 -o THREAD,tid,time
USER     %CPU PRI SCNT WCHAN  USER SYSTEM   TID     TIME
hdfs      0.2   -    - -         -      -     - 05:43:35
hdfs      0.0  19    - futex_    -      - 11013 00:47:47 --以该线程长耗时为例分析
hdfs      0.0  19    - futex_    -      - 11014 00:01:21
hdfs      0.0  19    - futex_    -      - 11035 00:00:07
hdfs      0.0  19    - futex_    -      - 11037 00:20:04
hdfs      0.0  19    - ep_pol    -      - 11401 00:04:52
hdfs      0.0  19    - ep_pol    -      - 11402 00:04:31
hdfs      0.0  19    - futex_    -      - 11403 00:21:01
```

- 执行 `printf "%x\n" TID` 将 tid 转换为十六进制
```shell{2}
printf "%x\n" 11013
2b05
```

- 执行 `jstack PID |grep TID -A 30` 定位具体线程
```shell
jstack 10834 |grep 2b05 -A 30
"C1 CompilerThread0" #7 daemon prio=9 os_prio=31 cpu=398.45ms elapsed=1607.13s tid=0x00007fd03c809800 nid=0x3d03 waiting on condition  [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE
   No compile task
--
"生产者-3" #14 prio=5 os_prio=31 cpu=375.00ms elapsed=1606.74s tid=0x00007fd03b8bd800 nid=0x6403 waiting on condition  [0x0000700009200000]
   java.lang.Thread.State: TIMED_WAITING (sleeping)
	at java.lang.Thread.sleep(java.base@11.0.2/Native Method)
	at io.gourd.java.concurrency.app.pc.CarFactory$Producer.run(CarFactory.java:45)
	at java.lang.Thread.run(java.base@11.0.2/Thread.java:834)

"生产者-4" #15 prio=5 os_prio=31 cpu=375.46ms elapsed=1606.74s tid=0x00007fd03b931000 nid=0xa203 waiting on condition  [0x0000700009303000]
   java.lang.Thread.State: TIMED_WAITING (sleeping)
	at java.lang.Thread.sleep(java.base@11.0.2/Native Method)
	at io.gourd.java.concurrency.app.pc.CarFactory$Producer.run(CarFactory.java:45)
	at java.lang.Thread.run(java.base@11.0.2/Thread.java:834)
```

## 扩展

根据实际线程情况定位相关代码，如果定位到 GC 相关线程引起高 CPU 问题，可使用 [jstat](https://blog.csdn.net/xiaohulunb/article/details/103887785) 相关命令观察 GC 情况  
例如： `jstat -gcutil -t -h 5 PID 500 10`

## 说明
> 更多 JDK 相关命令详细用法可参考  [Java JVM JDK13 诊断命令处理工具 jps,jstat,jinfo,jmap,jstack,jcmd](https://blog.csdn.net/xiaohulunb/article/details/103887785)

高内存占用分析可参考本专栏《故障诊断-高内存占用》。

实际生产过程中我们可以使用 dump 文件进行分析，或者使用一些可视化故障处理工具
- [jhsdb](https://docs.oracle.com/javase/9/tools/jhsdb.htm)
- [jconsole](http://openjdk.java.net/tools/svc/jconsole/)
- [Java Mission Control](https://www.oracle.com/technetwork/java/javaseproducts/mission-control/java-mission-control-1998576.html)
- [jprofiler](https://www.ej-technologies.com/products/jprofiler/overview.html)