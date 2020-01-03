// 侧导航定义
module.exports =
    {
        // 编程语言
        '/language/java-core/': require("../language/java-core/_sidebar"),
        '/language/java-puzzle/': require("../language/java-puzzle/_sidebar"),
        '/language/java-concurrency/': require("../language/java-concurrency/_sidebar"),
        '/language/java-jvm/': require("../language/java-jvm/_sidebar"),
        '/language/scala-basis/': require("../language/scala-basis/_sidebar"),

        // 技术框架
        '/framework/flink-basis/': require("../framework/flink-basis/_sidebar"),
        '/framework/redis/': require("../framework/redis/_sidebar"),

        //算法与理论
        '/algorithm/computer-theory/': require("../algorithm/computer-theory/_sidebar"),
        '/algorithm/network/': require("../algorithm/network/_sidebar"),
        '/algorithm/distributed-theory/': require("../algorithm/distributed-theory/_sidebar"),

        '/algorithm/data-structures/': require("../algorithm/data-structures/_sidebar"),

        // DevOps
        '/devops/git/': require("../devops/git/_sidebar"),

        // 面试题
        '/interview/java/': require("../interview/java/_sidebar")
    }
;
