module.exports = [
    {
        title: "Java JVM-内存管理",
        collapsable: false,
        sidebarDepth: 1,
        children: [
            ['运行时内存数据区域', '运行时内存数据区域'],
            ['内存溢出-OutOfMemoryError', '内存溢出-OutOfMemoryError'],
            ['引用有什么用', '引用有什么用'],
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
            ['诊断命令处理工具大全', '诊断命令处理工具大全'],
            ['故障诊断-高CPU占用', '故障诊断-高CPU占用'],
            ['故障诊断-高内存占用', '故障诊断-高内存占用 OOM定位']
        ]
    }
];