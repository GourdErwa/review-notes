> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/framework/flink-basis) ，[github-源码 ](https://github.com/GourdErwa/flink-advanced)，欢迎 Star，转载请附上原文出处链接和本声明。
## 1 Environment 概览
该文档主要说明 Flink 作业执行时环境概念，根据不同作业情况选择不同的 `Environment`。  
大多数 API 提供了静态方法创建对应 `Environment`，示例如下：
```scala
val bEnv: ExecutionEnvironment = ExecutionEnvironment.getExecutionEnvironment
val btEnv: BatchTableEnvironment = BatchTableEnvironment.create(bEnv)

val sEnv: StreamExecutionEnvironment = StreamExecutionEnvironment.getExecutionEnvironment
val stEnv: StreamTableEnvironment = StreamTableEnvironment.create(sEnv)
```

## 2 批处理（batch）

![ExecutionEnvironment_uml](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/ExecutionEnvironment_uml.png)

- `LocalEnvironment` 本地模式执行
- `RemoteEnvironment` 提交到远程集群执行
- `CollectionEnvironment` 集合数据集模式执行
- `OptimizerPlanEnvironment` 不执行作业，仅创建优化的计划
- `PreviewPlanEnvironment` 提取预先优化的执行计划
- `ContextEnvironment` 用于在客户端上远程执行.
    - `DetachedEnvironment` 用于在客户端上以分离模式进行远程执行
    
## 3 流处理（streaming）

![StreamExecutionEnvironment_uml](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/StreamExecutionEnvironment_uml.png)

- `LocalStreamEnvironment` 本地模式执行
- `RemoteStreamEnvironment` 提交到远程集群执行
- `StreamContextEnvironment` 
- `StreamPlanEnvironment` 

## 4 Table 模式处理
`TableEnvironment` 是创建 Table&SQL 的接口类，用于处理有界与无界数据。  
主要职责：  
- 连接外部系统数据源
- 注册和检索 Table 及从 catalog 获取其他元对象信息
- 执行 SQL 语句
- 提供配置信息
- ![TableEnvironment_uml](https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/flink-basis/_images/TableEnvironment_uml.png)

- `BatchTableEnvironment` Batch 处理模式的 Table ，主要处理 DataSet 与 Table 之间操作
- `StreamTableEnvironment` streaming 处理模式的 Table ， 主要处理 DataStream 与 Table 之间操作
