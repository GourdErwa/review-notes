module.exports = [
    {
        title: "Flink 基础概念",
        collapsable: true,
        sidebarDepth: 1,
        children: [
            ['基础概念', '基础概念'],
            ['运行环境', '运行环境'],
            ['编程模型', '编程模型'],
            ['类型系统', '类型系统'],
            ['开发前准备与模拟数据集介绍', '开发前准备与模拟数据集介绍'],
            ['基础API概览', '基础API概览'],
            ['Environment概览', 'Environment概览']
        ]
    },
    {
        title: "DataSet（Batch）",
        collapsable: true,
        sidebarDepth: 1,
        children: [
            ['DataSet概览', 'DataSet概览'],
            ['DataSet分配唯一标识符', 'DataSet分配唯一标识符'],
            ['DataSet参数传递', 'DataSet参数传递'],
            ['DataSet广播变量', 'DataSet广播变量'],
            ['DataSet分布式缓冲', 'DataSet分布式缓冲'],
            ['DataSet语义注解', 'DataSet语义注解']
        ]
    }, {
        title: "DataStream（Streaming）",
        collapsable: true,
        sidebarDepth: 1,
        children: [
            ['DataStream概览', 'DataStream概览'],
            ['DataStream时间水印机制', 'DataStream时间水印机制'],
            ['DataStream-ProcessFunction', 'DataStream-ProcessFunction'],
            ['DataStream窗口机制', 'DataStream窗口机制'],
            ['DataStream窗口功能函数', 'DataStream窗口功能函数']
        ]
    }
];