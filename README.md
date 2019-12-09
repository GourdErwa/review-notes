[![Build Status](https://travis-ci.com/GourdErwa/review-notes.svg?branch=master)](https://travis-ci.com/GourdErwa/review-notes)

# README
> 该文档使用 [vuepress](https://vuepress.vuejs.org/) 发布，[在线阅读地址](https://gourderwa.github.io/review-notes/#/)，执行 `npm run docs:dev` 本地阅读调试。

# 快速开始
- 图床：阿里OSS服务
- JDK：1.8
- JMM：Java内存模型

## 编程语言 
* [Java 基础知识](/language/java-basis/)
* [Java 并发编程](/language/java-concurrency/)
* [Scala 基础-语言核心特性](/language/scala-lang-tour/)

## 技术框架
* [Flink 入门进阶](/framework/flink-basis/)

## 算法
* [数据结构](/algorithm/data-structures/)
    
# 贡献说明
模块内容目录结构说明

|目录|说明|
|---|---|
|./$MODULE|模块名称|
|./$MODULE/_images|开发期间模块引用图片|
|./$MODULE/_notes|模块内容笔记内容(参考书籍、源图片等内容)|
|./$MODULE/_sidebar.md|模块内容侧导航结构|
|./$MODULE/README.md|模块介绍（默认为模块导言）|

注意：  
- 模块内容md文件名称不可包含空格等特殊字符  
- 开发期间：图片引用根目录为 `https://raw.githubusercontent.com/GourdErwa/review-notes/master/$MODULE/_images/`
- 发布期间：申请图片正式上传至阿里OSS，`https://blog-review-notes.oss-cn-beijing.aliyuncs.com/$MODULE/_images/`
- 图片采用 [gliffy-diagrams](https://chrome.google.com/webstore/detail/gliffy-diagrams/bhmicilclplefnflapjmnngmkkkkpfad?utm_source=chrome-app-launcher) 制作
- 排版建议：使用`&emsp;   `表示空行。使用`&emsp;&emsp;`表示首行缩进

# 贡献者
感谢以下人员对本仓库做出的贡献  
[liming199323](https://github.com/liming199323) , [VVvista](https://github.com/VVvista)