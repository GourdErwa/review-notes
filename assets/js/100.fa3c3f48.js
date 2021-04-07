(window.webpackJsonp=window.webpackJsonp||[]).push([[100],{473:function(e,r,s){"use strict";s.r(r);var t=s(10),i=Object(t.a)({},(function(){var e=this,r=e.$createElement,s=e._self._c||r;return s("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[s("blockquote",[s("p",[e._v("专栏原创出处："),s("a",{attrs:{href:"https://github.com/GourdErwa/review-notes/tree/master/framework/redis",target:"_blank",rel:"noopener noreferrer"}},[e._v("github-源笔记文件 "),s("OutboundLink")],1),e._v("，欢迎 Star，转载请附上原文出处链接和本声明。")])]),e._v(" "),s("p",[e._v("Redis 专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 "),s("a",{attrs:{href:"https://review-notes.top/framework/redis",target:"_blank",rel:"noopener noreferrer"}},[e._v("Redis"),s("OutboundLink")],1)]),e._v(" "),s("p"),s("div",{staticClass:"table-of-contents"},[s("ul",[s("li",[s("a",{attrs:{href:"#redis-简介"}},[e._v("Redis 简介")]),s("ul",[s("li",[s("a",{attrs:{href:"#什么是-bsd-协议"}},[e._v("什么是 BSD 协议")])]),s("li",[s("a",{attrs:{href:"#什么是-nosql"}},[e._v("什么是 NoSQL")])]),s("li",[s("a",{attrs:{href:"#nosql-数据库的四大分类"}},[e._v("NoSQL 数据库的四大分类")])])])]),s("li",[s("a",{attrs:{href:"#redis-的特点"}},[e._v("Redis 的特点")])]),s("li",[s("a",{attrs:{href:"#redis-安装"}},[e._v("Redis 安装")]),s("ul",[s("li",[s("a",{attrs:{href:"#windows-下安装-不推荐"}},[e._v("windows 下安装（不推荐）")])]),s("li",[s("a",{attrs:{href:"#linux-下安装"}},[e._v("Linux 下安装")])])])])])]),s("p"),e._v(" "),s("h2",{attrs:{id:"redis-简介"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#redis-简介"}},[e._v("#")]),e._v(" Redis 简介")]),e._v(" "),s("p",[e._v("Redis 是全完开源免费的，遵守 BSD 协议，是一种高性能的 key-value 的 NoSQL 数据库。\nRedis 是一个开源的使用 ANSIC 语言编写、支持网络、可基于内存亦可持久化的日志型、Key-Value 数据库，并提供多种语言的 API。从 2010 年 3 月 15 日起，Redis 的开发工作由 VMware 主持。从 2013 年 5 月开始，Redis 的开发由 Pivotal 赞助。")]),e._v(" "),s("ul",[s("li",[s("h3",{attrs:{id:"什么是-bsd-协议"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#什么是-bsd-协议"}},[e._v("#")]),e._v(" 什么是 BSD 协议")]),e._v(" "),s("ul",[s("li",[e._v("BSD 开源协议是一个给于使用者很大自由的协议。")]),e._v(" "),s("li",[e._v("可以自由的使用，修改源代码，也可以将修改后的代码作为开源或者专有软件再发布。")]),e._v(" "),s("li",[e._v("BSD 代码鼓励代码共享，但需要尊重代码作者的著作权。")]),e._v(" "),s("li",[e._v("BSD 由于允许使用者修改和重新发布代码，也允许使用或在 BSD 代码上开发商业软件发布和销售，因此是对商业集成很友好的协议")])])]),e._v(" "),s("li",[s("h3",{attrs:{id:"什么是-nosql"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#什么是-nosql"}},[e._v("#")]),e._v(" 什么是 NoSQL")]),e._v(" "),s("ul",[s("li",[e._v("NoSQL，泛指非关系型的数据库。")]),e._v(" "),s("li",[e._v("随着互联网 web2.0 网站的兴起，传统的关系数据库在应付 web2.0 网站，特别是超大规模和高并发的 SNS 类型的 web2.0 纯动态网站已经显得力不从心，暴露了很多难以克服的问题，而非关系型的数据库则由于其本身的特点得到了非常迅速的发展。")]),e._v(" "),s("li",[e._v("NoSQL 数据库的产生就是为了解决大规模数据集合多重数据种类带来的挑战，尤其是大数据应用难题。")])])]),e._v(" "),s("li",[s("h3",{attrs:{id:"nosql-数据库的四大分类"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#nosql-数据库的四大分类"}},[e._v("#")]),e._v(" NoSQL 数据库的四大分类")]),e._v(" "),s("ul",[s("li",[s("strong",[e._v("键值 (Key-Value) 存储数据库:")]),s("br"),e._v("\n这一类数据库主要会使用到一个哈希表，这个表中有一个特定的键和一个指针指向特定的数据。Key/value 模型对于 IT 系统来说的优势在于简单、易部署。但是如果 DBA 只对部分值进行查询或更新的时候，Key/value 就显得效率低下了。举例如：Tokyo Cabinet/Tyrant, Redis, Voldemort, Oracle BDB.")]),e._v(" "),s("li",[s("strong",[e._v("列存储数据库:")]),s("br"),e._v("\n这部分数据库通常是用来应对分布式存储的海量数据。键仍然存在，但是它们的特点是指向了多个列。这些列是由列家族来安排的。如：Cassandra, HBase, Riak.")]),e._v(" "),s("li",[s("strong",[e._v("文档型数据库:")]),s("br"),e._v("\n文档型数据库的灵感是来自于 Lotus Notes 办公软件的，而且它同第一种键值存储相类似。该类型的数据模型是版本化的文档，半结构化的文档以特定的格式存储，比如 JSON。文档型数据库可 以看作是键值数据库的升级版，允许之间嵌套键值。而且文档型数据库比键值数据库的查询效率更高。如：CouchDB, MongoDb. 国内也有文档型数据库 SequoiaDB，已经开源。")]),e._v(" "),s("li",[s("strong",[e._v("图形 (Graph) 数据库:")]),s("br"),e._v("\n图形结构的数据库同其他行列以及刚性结构的 SQL 数据库不同，它是使用灵活的图形模型，并且能够扩展到多个服务器上。NoSQL 数据库没有标准的查询语言 (SQL)，因此进行数据库查询需要制定数据模型。许多 NoSQL 数据库都有 REST 式的数据接口或者查询 API.如：Neo4J, InfoGrid, Infinite Graph.")])])])]),e._v(" "),s("h2",{attrs:{id:"redis-的特点"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#redis-的特点"}},[e._v("#")]),e._v(" Redis 的特点")]),e._v(" "),s("ul",[s("li",[e._v("性能极高：读的速度是 110000 次/s,写的速度是 81000 次/s")]),e._v(" "),s("li",[e._v("数据类型丰富：string，hash，list，set 及 zset(sorted set)。")]),e._v(" "),s("li",[e._v("原子性：命令的原子性，意思是：一个操作的不可以再分，操作要么执行，要么不执行。")]),e._v(" "),s("li",[e._v("数据持久化：持久化功能有效地避免因进程退出造成的数据丢失问题，下次重启时利用之前持久化的文件即可实现数据恢复。")])]),e._v(" "),s("h2",{attrs:{id:"redis-安装"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#redis-安装"}},[e._v("#")]),e._v(" Redis 安装")]),e._v(" "),s("h3",{attrs:{id:"windows-下安装-不推荐"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#windows-下安装-不推荐"}},[e._v("#")]),e._v(" windows 下安装（不推荐）")]),e._v(" "),s("ol",[s("li",[e._v("下载地址：https://github.com/MSOpenTech/redis/releases\n"),s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/redis/_images/Win_%E4%B8%8B%E8%BD%BD.png",alt:"stream_watermark_in_order"}})]),e._v(" "),s("li",[e._v("解压到文件夹\n"),s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/redis/_images/Win_%E8%A7%A3%E5%8E%8B.png",alt:"stream_watermark_in_order"}})]),e._v(" "),s("li",[e._v("打开一个 cmd 窗口 使用 cd 命令切换目录到 F:\\redis 运行 redis-server.exe\n"),s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/redis/_images/Win_%E5%90%AF%E5%8A%A8%E6%9C%8D%E5%8A%A1.png",alt:"stream_watermark_in_order"}})]),e._v(" "),s("li",[e._v("另启一个 cmd 窗口，原来的不要关闭，不然就无法访问服务端，切换到 redis 目录下运行 redis-cli.exe\n"),s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/redis/_images/Win_%E5%AE%A2%E6%88%B7%E7%AB%AF.png",alt:"stream_watermark_in_order"}})])]),e._v(" "),s("h3",{attrs:{id:"linux-下安装"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#linux-下安装"}},[e._v("#")]),e._v(" Linux 下安装")]),e._v(" "),s("ol",[s("li",[e._v("下载 redis ：wget http://download.redis.io/releases/redis-5.0.5.tar.gz\n"),s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/redis/_images/Linux_%E4%B8%8B%E8%BD%BD.png",alt:"stream_watermark_in_order"}})]),e._v(" "),s("li",[e._v("解压：tar xzf redis-5.0.5.tar.gz")]),e._v(" "),s("li",[e._v("进入文件夹：cd redis-5.0.5")]),e._v(" "),s("li",[e._v("编译 make\n"),s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/redis/_images/Linux_%E7%BC%96%E8%AF%91.png",alt:"stream_watermark_in_order"}})]),e._v(" "),s("li",[e._v("进入 src 目录 cd src")]),e._v(" "),s("li",[e._v("执行 ./redis-server\n"),s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/redis/_images/Linux_%E5%90%AF%E5%8A%A8%E6%9C%8D%E5%8A%A1.png",alt:"stream_watermark_in_order"}})]),e._v(" "),s("li",[e._v("新开一个界面 同样进入到 src 目录")]),e._v(" "),s("li",[e._v("执行 ./redis-cli\n"),s("div",{attrs:{align:"center"}},[s("img",{attrs:{src:"https://blog-review-notes.oss-cn-beijing.aliyuncs.com/framework/redis/_images/Linux_客户端.png"}})])])])])}),[],!1,null,null,null);r.default=i.exports}}]);