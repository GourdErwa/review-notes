module.exports = [
    {
        title: "Java JVM-内存管理",
        collapsable: false,
        sidebarDepth: 1,
        children: [
            ['运行时内存数据区域', '运行时内存数据区域'],
            ['引用有什么用', '引用有什么用'],
            ['JDK9-类加载机制及双亲委派模式', 'JDK9-类加载机制及双亲委派模式'],
            ['对象的创建与访问过程', '对象的创建与访问过程'],
            ['对象的死亡过程', '对象的死亡过程'],
            ['垃圾收集算法', '垃圾收集算法'],
            ['JDK11-7个垃圾收集器', 'JDK11-7个垃圾收集器'],
            ['OpenJDK12-Shenandoah收集器', 'OpenJDK 12-Shenandoah 收集器'],
            ['OracleJDK11-ZGC收集器', 'OracleJDK 11-ZGC 收集器']
        ]
    },
    {
        title: "Java JVM-性能监控、故障处理",
        collapsable: false,
        sidebarDepth: 1,
        children: [
            ['故障诊断-OutOfMemoryError', '故障诊断-OutOfMemoryError'],
            ['诊断命令处理工具大全', '诊断命令处理工具大全'],
            ['故障诊断-高CPU占用', '故障诊断-高CPU占用'],
            ['故障诊断-高内存占用、内存泄漏', '故障诊断-高内存占用、内存泄漏']
        ]
    },
    {
        title: "Java JVM-虚拟机子系统",
        collapsable: false,
        sidebarDepth: 1,
        children: [
            ['字节码指令-指令表收录', '字节码指令-指令表收录'],
            ['运行时栈帧结构', '运行时栈帧结构'],
            ['从一段代码分析虚拟机内存分配', '从一段代码分析虚拟机内存分配'],
            ['为什么字节码new指令后执行dup指令', '为什么 new 指令后执行 dup 指令'],
            ['从方法调用的角度分析重载重写的本质', '从方法调用的角度分析重载重写的本质'],
            ['动态方法之方法句柄 MethodHandle', '动态方法之方法句柄 MethodHandle'],
            ['动态方法调用指令invokedynamic','动态方法调用指令 invokedynamic']
        ]
    }
];