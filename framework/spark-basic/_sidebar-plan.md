
- spark-core
    - spark-core简介
    - spark 组件
    - spark 执行环境
    - RDD

- spark-sql
  - spark-sql简介
  - DataFrame
  - DataSet

- streaming
    - Spark Streaming
    - Structured-Streaming

- spark 底层原理解析
  - spark 存储系统
    - 磁盘存储管理
    - 内存存储管理
    - 块管理
  - spark 调度系统
    - DAG 和 Stage 解析
    - DAGScheduler 解析
    - TaskSetManager 解析
    - TaskScheduler 解析
    - 不同部署模式下的任务提交流程
  - spark 通信系统
    - spark netty 通信框架解析
    - spark 新老通信系统优缺点分析
    - 源码解读
  - spark 计算引擎
    - 内存计算引擎
    - Shuffle 计算引擎
    - 外部排序器
    - 任务管理器
    - Tungsten

- spark 部署模式
  - 集群组件详解
  - local 模式部署
  - Standalone 模式部署
  - Spark On Yarn 模式部署

- spark 常用算子