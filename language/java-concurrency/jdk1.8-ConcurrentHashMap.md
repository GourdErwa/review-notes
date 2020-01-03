> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程 ](https://review-notes.top/language/java-concurrency/)

[[toc]]
## ConcurrentHashMap 是什么（jdk1.8）

### 1.8相对于1.7的改进
1.7中采用 N 个 Segment，分段锁的设计，但是查询遍历链表效率太低。
1.8 中采用 `数组[链表或红黑树]` 结构，采用 `CAS + synchronized` 保证并发性
### 初始化操作
- 默认容量是16
- 如果自定义容量大小，将最终调整为2的幂次方
- table 是延迟初始化的，而且只允许一个线程进行初始化操作

### put 方法
- 根据 key 计算出 hashcode 。
- 判断是否需要进行初始化。
- f 即为当前 key 定位出的 Node，如果为空表示当前位置可以写入数据，利用 CAS 尝试写入，失败则自旋保证成功。
- 如果当前位置的 hashcode == MOVED == -1,则需要进行扩容。
- 如果都不满足，则利用 synchronized 锁写入数据。
- 如果数量大于 TREEIFY_THRESHOLD 则要转换为红黑树。

红黑树之后可以保证查询效率（O(logn)）

### get 方法
- 根据计算出来的 hashcode 寻址，如果就在桶上那么直接返回值。
- 如果是红黑树那就按照树的方式获取值。
- 就不满足那就按照链表的方式遍历获取值。

### 重要字段介绍
- `Node<K,V>[] table`：默认为null，初始化发生在第一次插入操作，默认大小为16的数组，用来存储Node节点数据，扩容时大小总是2的幂次方。
- `Node<K,V>[] nextTable`：默认为null，扩容时新生成的数组，其大小为原数组的两倍。
- `sizeCtl`：初始化哈希表和扩容 rehash 的过程，都需要依赖sizeCtl
    - 0：默认值
    - -1：代表哈希表正在进行初始化
    - 大于0：相当于 HashMap 中的 threshold，表示阈值
    - 小于-1：代表有多个线程正在进行扩容。比如：-N 表示有N-1个线程正在进行扩容操作

- `Node`：
```java
    static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;
        final K key;
        volatile V val;
        volatile Node<K,V> next;

        ...
    }
```
- `ForwardingNode`:特殊的Node节点，hash值为-1，其中存储nextTable的引用。
只有table发生扩容的时候，ForwardingNode才会发挥作用，作为一个占位符放在table中表示当前节点为null或则已经被移动。
```java
    static final class ForwardingNode<K,V> extends Node<K,V> {
        final Node<K,V>[] nextTable;
        ForwardingNode(Node<K,V>[] tab) {
            super(MOVED, null, null, null);
            this.nextTable = tab;
        }
        ...
    }
```


## 初始化
- 初始化时会根据参数调整table大小，可以初始化时指定，不然使用默认值 16 。为了确保table的大小总是2的幂次方，我们初始化时指定的不一定是最终计算的。
- table的初始化操作会延迟到第一put操作再进行，且初始化只会执行一次。

```java
    private final Node<K,V>[] initTable() {
        Node<K,V>[] tab; int sc;
        while ((tab = table) == null || tab.length == 0) {
        //如果一个线程发现sizeCtl<0，意味着另外的线程执行CAS操作成功，当前线程只需要让出cpu时间片
            if ((sc = sizeCtl) < 0)
                Thread.yield(); // lost initialization race; just spin
            else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
                try {
                    if ((tab = table) == null || tab.length == 0) {
                        int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                        @SuppressWarnings("unchecked")
                        Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                        table = tab = nt;
                        sc = n - (n >>> 2); //0.75*capacity
                    }
                } finally {
                    sizeCtl = sc;
                }
                break;
            }
        }
        return tab;
    }
```