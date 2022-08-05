
# 笔记

官方文档：[palo.baidu.com/docs/](http://palo.baidu.com/docs/)

## 数据更新

使用 UNIQUE 模型进行数据更新操作。

如果只想每次更新部分字段时，可以使用 `order_type VARCHAR(8) REPLACE_IF_NOT_NULL` 进行建表。

## 数据删除

Doris 中的数据删除有以下几种方式：

- TRUNCATE，该命令用于直接清空表或分区，但不会删除对应的元数据。操作代价较低，再有清空数据需求时，建议使用。
- DROP，删除表或分区，会同时删除数据和元数据。
- DELETE，Delete 语句用于按条件删除数据，具体说明见本文档**按条件删除**一节。
- MARK DELETE，Mark Delete 功能对数据进行按行删除，具体说明见本文档**标记删除**一节。

### 按条件删除

查看历史 DELETE 记录`SHOW DELETE FROM example_db;`

Tip：不适用高频操作，本质是查询时滞后执行的命令。

## 标记删除

原理为增加了一个隐藏列 `__DELETE_SIGN__`，类型为布尔，true 表示为删除操作。

### 在导入中使用标记删除功能

在不同的数据导入方式中使用标记删除的方式略有不同。标记删除目前支持以下数据导入方式：

- [STREAM LOAD](http://palo.baidu.com/docs/SQL手册/语法帮助/DML/STREAM-LOAD)
- [BROKER LOAD](http://palo.baidu.com/docs/SQL手册/语法帮助/DML/BROKER-LOAD)
- [ROUTINE LOAD](http://palo.baidu.com/docs/SQL手册/语法帮助/DML/ROUTINE-LOAD)

Tip：因为 Doris 无法保证一批次导入数据内部的顺序性，所以在诸如 CDC 等场景下，如需确保数据前后顺序，需配合 [Sequence Column](http://palo.baidu.com/docs/操作手册/数据更新与删除/Sequence-Column) 功能一起使用。

