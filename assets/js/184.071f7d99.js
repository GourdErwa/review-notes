(window.webpackJsonp=window.webpackJsonp||[]).push([[184],{557:function(t,a,s){"use strict";s.r(a);var e=s(10),n=Object(e.a)({},(function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("blockquote",[s("p",[t._v("专栏原创出处："),s("a",{attrs:{href:"https://github.com/GourdErwa/review-notes/tree/master/language/java-jvm",target:"_blank",rel:"noopener noreferrer"}},[t._v("github-源笔记文件 "),s("OutboundLink")],1),t._v(" ，"),s("a",{attrs:{href:"https://github.com/GourdErwa/java-advanced/tree/master/java-jvm",target:"_blank",rel:"noopener noreferrer"}},[t._v("github-源码 "),s("OutboundLink")],1),t._v("，欢迎 Star，转载请附上原文出处链接和本声明。")])]),t._v(" "),s("p",[t._v("Java JVM-虚拟机专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 "),s("a",{attrs:{href:"https://review-notes.top/language/java-jvm/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Java JVM-虚拟机 "),s("OutboundLink")],1)]),t._v(" "),s("p"),s("div",{staticClass:"table-of-contents"},[s("ul",[s("li",[s("a",{attrs:{href:"#排查过程"}},[t._v("排查过程")])]),s("li",[s("a",{attrs:{href:"#扩展"}},[t._v("扩展")])]),s("li",[s("a",{attrs:{href:"#说明"}},[t._v("说明")])])])]),s("p"),t._v(" "),s("h2",{attrs:{id:"排查过程"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#排查过程"}},[t._v("#")]),t._v(" 排查过程")]),t._v(" "),s("ul",[s("li",[t._v("执行 "),s("code",[t._v("top")]),t._v(" 命令，定位高 CPU 占用的 PID")])]),t._v(" "),s("div",{staticClass:"language-shell extra-class"},[s("div",{staticClass:"highlight-lines"},[s("br"),s("div",{staticClass:"highlighted"},[t._v(" ")]),s("br")]),s("pre",{pre:!0,attrs:{class:"language-shell"}},[s("code",[t._v("  PID "),s("span",{pre:!0,attrs:{class:"token environment constant"}},[t._v("USER")]),t._v("  PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+     COMMAND\n"),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("10834")]),t._v(" hdfs  "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("20")]),t._v("   "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("6125996")]),t._v("   "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),t._v(".4g   "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("6800")]),t._v(" S  "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("107.0")]),t._v("  "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("5.4")]),t._v("    "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("343")]),t._v(":35.01  /usr/java/jdk1.8"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("..")]),t._v(".\n")])])]),s("ul",[s("li",[t._v("执行 "),s("code",[t._v("ps -mp PID -o THREAD,tid,time")]),t._v(" 命令查看线程耗时情况")])]),t._v(" "),s("div",{staticClass:"language-shell extra-class"},[s("div",{staticClass:"highlight-lines"},[s("br"),s("br"),s("br"),s("div",{staticClass:"highlighted"},[t._v(" ")]),s("br"),s("br"),s("br"),s("br"),s("br"),s("br"),s("br")]),s("pre",{pre:!0,attrs:{class:"language-shell"}},[s("code",[s("span",{pre:!0,attrs:{class:"token function"}},[t._v("ps")]),t._v(" -mp "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("10834")]),t._v(" -o THREAD,tid,time\n"),s("span",{pre:!0,attrs:{class:"token environment constant"}},[t._v("USER")]),t._v("     %CPU PRI SCNT WCHAN  "),s("span",{pre:!0,attrs:{class:"token environment constant"}},[t._v("USER")]),t._v(" SYSTEM   TID     TIME\nhdfs      "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0.2")]),t._v("   -    - -         -      -     - 05:43:35\nhdfs      "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0.0")]),t._v("  "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("19")]),t._v("    - futex_    -      - "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("11013")]),t._v(" 00:47:47 --以该线程长耗时为例分析\nhdfs      "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0.0")]),t._v("  "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("19")]),t._v("    - futex_    -      - "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("11014")]),t._v(" 00:01:21\nhdfs      "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0.0")]),t._v("  "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("19")]),t._v("    - futex_    -      - "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("11035")]),t._v(" 00:00:07\nhdfs      "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0.0")]),t._v("  "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("19")]),t._v("    - futex_    -      - "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("11037")]),t._v(" 00:20:04\nhdfs      "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0.0")]),t._v("  "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("19")]),t._v("    - ep_pol    -      - "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("11401")]),t._v(" 00:04:52\nhdfs      "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0.0")]),t._v("  "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("19")]),t._v("    - ep_pol    -      - "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("11402")]),t._v(" 00:04:31\nhdfs      "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0.0")]),t._v("  "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("19")]),t._v("    - futex_    -      - "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("11403")]),t._v(" 00:21:01\n")])])]),s("ul",[s("li",[t._v("执行 "),s("code",[t._v('printf "%x\\n" TID')]),t._v(" 将 tid 转换为十六进制")])]),t._v(" "),s("div",{staticClass:"language-shell extra-class"},[s("div",{staticClass:"highlight-lines"},[s("br"),s("div",{staticClass:"highlighted"},[t._v(" ")]),s("br")]),s("pre",{pre:!0,attrs:{class:"language-shell"}},[s("code",[s("span",{pre:!0,attrs:{class:"token builtin class-name"}},[t._v("printf")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"%x'),s("span",{pre:!0,attrs:{class:"token entity",title:"\\n"}},[t._v("\\n")]),t._v('"')]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("11013")]),t._v("\n2b05\n")])])]),s("ul",[s("li",[t._v("执行 "),s("code",[t._v("jstack PID |grep TID -A 30")]),t._v(" 定位具体线程")])]),t._v(" "),s("div",{staticClass:"language-shell extra-class"},[s("pre",{pre:!0,attrs:{class:"language-shell"}},[s("code",[t._v("jstack "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("10834")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("grep")]),t._v(" 2b05 -A "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("30")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"C1 CompilerThread0"')]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#7 daemon prio=9 os_prio=31 cpu=398.45ms elapsed=1607.13s tid=0x00007fd03c809800 nid=0x3d03 waiting on condition  [0x0000000000000000]")]),t._v("\n   java.lang.Thread.State: RUNNABLE\n   No compile task\n--\n"),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"生产者-3"')]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#14 prio=5 os_prio=31 cpu=375.00ms elapsed=1606.74s tid=0x00007fd03b8bd800 nid=0x6403 waiting on condition  [0x0000700009200000]")]),t._v("\n   java.lang.Thread.State: TIMED_WAITING "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("sleeping"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\tat java.lang.Thread.sleep"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("java.base@11.0.2/Native Method"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\tat io.gourd.java.concurrency.app.pc.CarFactory"),s("span",{pre:!0,attrs:{class:"token variable"}},[t._v("$Producer")]),t._v(".run"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("CarFactory.java:45"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\tat java.lang.Thread.run"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("java.base@11.0.2/Thread.java:834"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"生产者-4"')]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#15 prio=5 os_prio=31 cpu=375.46ms elapsed=1606.74s tid=0x00007fd03b931000 nid=0xa203 waiting on condition  [0x0000700009303000]")]),t._v("\n   java.lang.Thread.State: TIMED_WAITING "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("sleeping"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\tat java.lang.Thread.sleep"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("java.base@11.0.2/Native Method"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\tat io.gourd.java.concurrency.app.pc.CarFactory"),s("span",{pre:!0,attrs:{class:"token variable"}},[t._v("$Producer")]),t._v(".run"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("CarFactory.java:45"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\tat java.lang.Thread.run"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("java.base@11.0.2/Thread.java:834"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])])]),s("h2",{attrs:{id:"扩展"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#扩展"}},[t._v("#")]),t._v(" 扩展")]),t._v(" "),s("p",[t._v("根据实际线程情况定位相关代码，如果定位到 GC 相关线程引起高 CPU 问题，可使用 "),s("a",{attrs:{href:"https://blog.csdn.net/xiaohulunb/article/details/103887785",target:"_blank",rel:"noopener noreferrer"}},[t._v("jstat"),s("OutboundLink")],1),t._v(" 相关命令观察 GC 情况"),s("br"),t._v("\n例如： "),s("code",[t._v("jstat -gcutil -t -h 5 PID 500 10")])]),t._v(" "),s("h2",{attrs:{id:"说明"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#说明"}},[t._v("#")]),t._v(" 说明")]),t._v(" "),s("p",[t._v("实际生产过程中我们可以选择更多的工具进行运行监控、分析 dump 文件：")]),t._v(" "),s("ul",[s("li",[s("a",{attrs:{href:"https://www.eclipse.org/mat/",target:"_blank",rel:"noopener noreferrer"}},[t._v("推荐-Memory Analyzer (MAT)"),s("OutboundLink")],1)]),t._v(" "),s("li",[s("a",{attrs:{href:"https://www.ej-technologies.com/products/jprofiler/overview.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("推荐-付费-jprofiler"),s("OutboundLink")],1)]),t._v(" "),s("li",[s("a",{attrs:{href:"https://docs.oracle.com/javacomponents/jmc-5-4/jfr-runtime-guide/run.htm#JFRUH176",target:"_blank",rel:"noopener noreferrer"}},[t._v("推荐-Flight Recorder-飞行记录仪"),s("OutboundLink")],1)]),t._v(" "),s("li",[s("a",{attrs:{href:"https://docs.oracle.com/javase/9/tools/jhsdb.htm",target:"_blank",rel:"noopener noreferrer"}},[t._v("jhsdb"),s("OutboundLink")],1)]),t._v(" "),s("li",[s("a",{attrs:{href:"http://openjdk.java.net/tools/svc/jconsole/",target:"_blank",rel:"noopener noreferrer"}},[t._v("jconsole"),s("OutboundLink")],1)]),t._v(" "),s("li",[s("a",{attrs:{href:"https://www.oracle.com/technetwork/java/javaseproducts/mission-control/java-mission-control-1998576.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("Java Mission Control"),s("OutboundLink")],1)])]),t._v(" "),s("blockquote",[s("p",[t._v("更多 JDK 相关命令详细用法可参考  "),s("a",{attrs:{href:"https://blog.csdn.net/xiaohulunb/article/details/103887785",target:"_blank",rel:"noopener noreferrer"}},[t._v("Java JVM JDK13 诊断命令处理工具 jps,jstat,jinfo,jmap,jstack,jcmd"),s("OutboundLink")],1)])]),t._v(" "),s("p",[t._v("更多故障诊断及调优，参考本专栏 "),s("a",{attrs:{href:"https://blog.csdn.net/xiaohulunb/article/details/103828570",target:"_blank",rel:"noopener noreferrer"}},[t._v("Java JVM（JDK13）-专栏文章目录汇总"),s("OutboundLink")],1),t._v("。")])])}),[],!1,null,null,null);a.default=n.exports}}]);