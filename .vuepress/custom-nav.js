// 导航定义
module.exports = [
    {
        text: '编程语言',
        items: [
            {text: 'Java 核心知识', link: '/language/java-core/'},
            //{text: 'Java 谜题', link: '/language/java-puzzle/'},
            {text: 'Java 并发编程', link: '/language/java-concurrency/'},
            {text: 'Java JVM-虚拟机', link: '/language/java-jvm/'},
            {text: 'Scala 基础', link: '/language/scala-basis/'}
        ]
    },
    {
        text: '技术框架',
        items: [
            {text: 'Spark 基础', link: '/framework/spark-basis/'},
            {text: 'Flink 基础', link: '/framework/flink-basis/'}
            //{text: 'Redis', link: '/framework/redis/'}
        ]
    },
    // {
    //     text: '算法设计与理论',
    //     items: [
    //         {text: '计算机理论', link: '/algorithm/computer-theory/'},
    //         {text: '计算机网络理论', link: '/algorithm/network/'},
    //         {text: '分布式理论', link: '/algorithm/distributed-theory/'},
    //         {text: '设计模式', link: '/algorithm/design-patterns/'},
    //         {text: '数据结构', link: '/algorithm/data-structures/'}
    //     ]
    // },
    {
        text: 'DevOps',
        items: [
            //{text: 'Git', link: '/devops/git/'},
            {text: '工具收藏系列', link: '/devops/dev-tools/'}
        ]
    },
    {
        text: '面试题',
        link: '/interview/'
    },
    {
        text: '关于',
        items: [
            {text: '学习方法', link: '/about/学习方法.md'},
            {text: '贡献说明', link: '/about/贡献说明.md'}
        ]
    }
]
;
