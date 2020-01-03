> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-core) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-core)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 核心知识专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 核心知识 ](https://review-notes.top/language/java-core/)

[[toc]]

## HashMap
基于 jdk1.8 讲解分析。本篇不涉及太多源码讲解，重点为采用**哈希碰撞实战分析**处理过程。

如果对红黑树转换为单链表感兴趣，可以修改实战代码进行 remove 操作观察处理过程。

>- 在 debug 过程中如果你看不到 map 内部数据结构的话，idea 中修改设置 Data Views->Java->Enable alternative view...。
>- Gradle 启动时运行窗口"可能"为 2 个，选择你的窗口代码调试，Gradle 本身的窗口我们可以忽略。
## HashMap 关键字段讲解
- table  
`Node[]` 结构的数组，保存我们的 K/V 键值对信息。Node 可能为单链表（Node）或者红黑树（TreeNode）结构，TreeNode 继承了 Node。

- capacity  
容量，即 table 的长度，默认 16。容量为 2 次幂。

- loadFactor  
负载因子，默认 0.75f。决定了桶的使用情况。
    - 负载因子太大，桶的利用率越高，但是冲突的几率变大了。
    - 负载因子太小，桶的利用率越低，冲突几率变小了。
    - 平衡与折衷的默认值设置为 0.75f。可参考 [泊松分布和指数分布 ](http://www.ruanyifeng.com/blog/2015/06/poisson-distribution.html#comment-356111)。

- threshold  
扩容阈值，当 K/V 的数量大于等于该阈值时 table 进行扩容，初始化时默认为 16。
    - 进行 put 或者扩容操作后按公式 threshold = capacity * loadFactor 计算。
    - 假如我们的初始化容量是 16，负载因子是 0.75f，第一次扩容的阈值为 12。

- size  
K/V 的数量，我们放入 table 中的键值对数量。

## 为什么
### 为什么 table 要设计为 `Node[]` 结构的数组？
- 如何确定 K/V 数据要保存到哪个数组下标呢？  
通过 K 的哈希值定位到数组下标。

- 如果多个 K 生成的哈希值出现都一样时（哈希冲突）怎么办？  
*此处应该是理解 HashMap 数据结构的重点了*。出现冲突后定位的数组索引下标都一样了，因此我们要在一个数组下标上放好多数据，
HashMap 采用了 Node（单链表），TreeNode（红黑树）来保存每个数组下标的数据。

- 为什么要用 单链表、红黑树 两种树结构呢？
    - 红黑树需要进行左旋，右旋操作， 而单链表不需要，单链表只能顺序查找。
    - 如果元素小于 8 个，单链表，查询成本高，新增成本低。
    - 如果元素大于 8 个，红黑树，查询成本低，新增成本高。

- 什么时候单链表与红黑树互相转换？
    - 如果当前链表的个数 ≥ 8，且 capacity ≥ 64，单链表会转为红黑树。
    - 如果当前红黑树的个数 ≤ 6，红黑树会转为单链表。
    - 原因可参考 [IanDai's Notes](https://notes.daiyuhe.com/bucket-convert-to-red-black-tree-when-8-size/)，此处不做复述。

### 为什么容量为 2 次幂？
通过 K 的 hash 值定位 table 下标的代码为： `Node p = tab[i = (n - 1) & hash]`。
> & 与运算，相同位置都为 1 时结果为 1，否则为 0。

因为 n 永远是 2 的次幂，所以 n-1 通过二进制表示，永远都是尾端以连续 1 的形式表示（00001111，00000011）。
当 (n - 1) 和 hash 做与运算时，会保留 hash 中 后 x 位的 1。

我们用 4 位无符号数二进制作为示例说明：
- table 长度为 n = 4 ，[4] 十进制 = [0100] 二进制
- K 的 hash 值为 hash = 7，[7] 十进制 = [0111] 二进制
- (n - 1) = 3 ，[4 - 1 = 3] 十进制 = [0100-0001=0011] 二进制
- (n - 1) & hash = hash % n，[3 & 7 = 7 % 4 = 3] 十进制 = 0011 & 0111 = 0011 = 3


**原因总结为：**
- & 运算速度快，至少比 % 取模运算快
- 保证下标肯定在 capacity 中，不会超出数组长度
- 当 n 为 2 次幂时，满足公式：(n - 1) & hash = hash % n

## hash 方法解读
```java
    static final int hash(Object key) {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }
```
HashMap 计算 Key 的哈希值时，没有直接使用 Key 的 hashCode 方法，而是取 Key 的 hashCode 方法低 16 位与 Key 的 hashCode 异或运算，让哈希更松散，减少碰撞。

## put 方法解读

主要处理逻辑为：
- 判断 table 是否初始化
- 判断数组下标位置的单链表节点是否初始化，未初始化时构造节点插入
- 以上条件都不满足时，说明数据下标位置出现冲突了，拿到当前的 Node 节点
    - 如果当前节点 Key 与添加的 Key 相等，执行替换
    - 如果当前节点是红黑树，加入红黑树节点
    - 如果当前节点是链表，循环链表，如果链表上节点与添加节点相等，替换退出。否则添加到尾节点，如果链表长度 ≥ 8 尝试转红黑树
- 最后判断是否需要扩容

```java
    final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        // 如果 table 未初始则初始化
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
        // 如果 table 下标位置的节点为空，则构造一个节点放入
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
        else {
            Node<K,V> e; K k;
            // 如果 hash 冲突了，使用 equals 比较，如果相等替换
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            // 如果当前节点是红黑树节点，对红黑树节点执行 put 操作
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            else {
                // 如果当前节点是链表节点，循环寻找链表尾节点
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        if (binCount >= TREEIFY_THRESHOLD - 1) // 判断转红黑树
                            treeifyBin(tab, hash);
                        break;
                    }
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break; // 如果和链表的某个节点相等，跳出循环
                    p = e;
                }
            }
            if (e != null) { // Key 值存在时替换
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        if (++size > threshold) // 判断是否需要扩容操作
            resize();
        afterNodeInsertion(evict);
        return null;
    }
```
## get 方法解读
- 判断表或 key 是否是 null，如果是直接返回 null
- 判断索引处第一个 key 与传入 key 是否相等，如果相等直接返回
- 如果不相等，判断链表是否是红黑二叉树，如果是，直接从树中取值
- 如果不是树，遍历链表查找

## rehash 扩容方法解读
假设扩容前的 table 大小为 2 的 N 次方，由上述 put 方法解析可知，元素的 table 索引由其 hash 值的后 N 位确定。
扩容后的 table 大小即为 2 的 N+1 次方，则其中元素的 table 索引为其 hash 值的后 N+1 位确定，比原来多了一位。
因此，table 中的元素只有两种情况：
- 元素 hash 值第 N+1 位为 0：不需要进行位置调整
- 元素 hash 值第 N+1 位为 1：调整至原索引的两倍位置

参考哈希碰撞代码实战#分析扩容过程理解。

## 哈希碰撞代码实战
学习一百篇技术文章，不如实战 debug 吸收率高。没有实战的阅读，来年还得搜索出来阅读:smirk:。

### 实战代码说明
我们声明一个 ConflictingHash 类作为 Key，内部维护一个整数，重写 equals&hashCode 方法。
- equals 方法比较 i 的大小
- hashCode 方法对 i 取模，然后放大 16 倍

此处重写 hashCode 时，取模为了让 hash 一直冲突，放大 16 倍为了保证扩容过程中链表节点的转移分析。

```java
    static class ConflictingHash {

        private final int i;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ConflictingHash that = (ConflictingHash) o;
            return i == that.i;
        }

        // 因为此处取模后，左移 4 为，相当于放大 16 倍。最大为 48
        // 相对于 HashMap#hash(Object) 函数来说，(h = key.hashCode()) ^ (h >>> 16) 结果不变。
        @Override
        public int hashCode() {
            return i % 4 << 4; // 等价于 (i % 4) * 16
        }
    }
```

通过反射与 org.openjdk.jol.info.GraphLayout 对象实时获取 HashMap 内部数据值变化情况分析，在关键操作时可 debug 查看运行过程。

因篇幅限制，源码参考 [HashMapConflictingHash](https://github.com/GourdErwa/java-advanced/blob/master/java-core/src/main/java/io/gourd/java/core/map/HashMapConflictingHash.java)

### 哈希碰撞实战分析
我们初始化一个容量为 16 ，负载因子为 0.75f 的 HashMap，put 后打印内部数据。关键日志如下：

- size：大小等于 put 的整数次数，从 1 开始 put
- Node：单链表节点
- TreeNode：红黑树节点
- table[0] = 1,2,3,4,5,6,7,8 ：表示数据节点中元素内容

```text
loadFactor = 0.75
-----------------------------------------------
table      = null   // 初始化时为 null
threshold  = 16     // 初始化时为 16
size       = 0

-----------------------------------------------
table      = length=16，[0]=Node 
threshold  = 12     // 重新计算 12 = 16 * 0.75
size       = 1

-----------------------------------------------
table      = length=16，[0]=Node 
threshold  = 12
size       = 8

table[0] = 1,2,3,4,5,6,7,8

-----------------------------------------------
table      = length=32，[0]=Node ，[16]=Node 
threshold  = 24
size       = 9

table[0] = 2,4,6,8
table[16] = 1,3,5,7,9

-----------------------------------------------
table      = length=32，[0]=Node ，[16]=Node 
threshold  = 24
size       = 16

table[0] = 2,4,6,8,10,12,14,16
table[16] = 1,3,5,7,9,11,13,15

-----------------------------------------------
table      = length=64，[0]=Node ，[16]=Node ，[32]=Node ，[48]=Node 
threshold  = 48
size       = 17

table[0] = 4,8,12,16
table[16] = 1,5,9,13,17
table[32] = 2,6,10,14
table[48] = 3,7,11,15

-----------------------------------------------
table      = length=64，[0]=Node ，[16]=Node ，[32]=Node ，[48]=Node 
threshold  = 48
size       = 32

-----------------------------------------------
table      = length=64，[0]=Node ，[16]=TreeNode ，[32]=Node ，[48]=Node 
threshold  = 48
size       = 33

```

#### 分析扩容过程
- 添加第 9 个数据时，发生扩容，因为 table[0] 上的链表长度为 8，转红黑树时因为 table 容量不够 64。
- 添加第 17 个数据时，发生扩容，因为 table[0] 上的链表长度为 8，转红黑树时因为 table 容量不够 64。

#### 分析扩容时节点转移过程
我们追踪 `[ConflictingHash(3)] 哈希值 = 3 % 4 << 4 = 48 = [110000] 二进制` 对象在扩容时的转移过程。

通过 `tab[i = (n - 1) & hash]` 定位 table 下标为：
- (16 - 1) & 48 = 1 111 & 110 000 = 0 = [0] 十进制
- (32 - 1) & 48 = 11 111 & 110 000 = 10 000 = [16] 十进制
- (64 - 1) & 48 = 111 111 & 110 000 = 110 000 = [48] 十进制

在容量为 16、32、64 时，分别对应 table[0]，table[16]，table[48] 位置，与上述日志内容吻合。
#### 分析红黑树转换过程
添加第 33 个数据时，因为 table[16] 上的链表长度为 8，table 容量为 64，该节点转换为红黑树节点

## HashMap 存在的问题
- 发生扩容时，可能会产生循环链表，在执行 get 的时候，会触发死循环，引起 CPU 的 100%问题。当然，并发就应该用 ConcurrentHashMap 实现。