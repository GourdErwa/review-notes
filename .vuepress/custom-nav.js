// 导航定义
module.exports = [
    {
        text: '编程语言',
        items: [
            {text: 'Java 核心知识（In review）', link: '/language/java-core/'},
            //{text: 'Java 谜题（In review）', link: '/language/java-puzzle/'},
            {text: 'Java 并发编程', link: '/language/java-concurrency/'},
            {text: 'Java JVM-虚拟机', link: '/language/java-jvm/'},
            {text: 'Scala 基础', link: '/language/scala-basis/'}
        ]
    },
    {
        text: '技术框架',
        items: [
            {text: 'Flink 基础（In review）', link: '/framework/flink-basis/'}
            //{text: 'Redis（In review）', link: '/framework/redis/'}
        ]
    },
    // {
    //     text: '算法设计与理论',
    //     items: [
    //         {text: '计算机理论（In review）', link: '/algorithm/computer-theory/'},
    //         {text: '计算机网络理论（In review）', link: '/algorithm/network/'},
    //         {text: '分布式理论（In review）', link: '/algorithm/distributed-theory/'},
    //         {text: '设计模式（In review）', link: '/algorithm/design-patterns/'},
    //         {text: '数据结构（In review）', link: '/algorithm/data-structures/'}
    //     ]
    // },
    // {
    //     text: 'DevOps',
    //     items: [
    //         {text: 'Git（In review）', link: '/devops/git/'}
    //     ]
    // },
    {
        text: '面试题',
        link: '/interview/'
    },
    {
        text: '关于',
        items: [
            {text: '学习方法', link: '/about/学习方法.md'},
            {text: '贡献说明', link: '/about/贡献说明.md'},
            {text: '资源收集清单', link: '/about/资源收集清单.md'},
            {text: '文档收集清单', link: '/about/文档收集清单.md'}
        ]
    }
]
;
