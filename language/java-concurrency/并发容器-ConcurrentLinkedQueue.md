> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程 ](https://review-notes.top/language/java-concurrency/)

[[toc]]
## ConcurrentLinkedQueue 是什么
阻塞的实现方式可以用锁，非阻塞的实现方式可以使用循环 CAS 的方式来实现。

ConcurrentLinkedQueue 是一个基于链接节点的无界线程安全队列，主要特性：
- 非阻塞 CAS 操作实现
- 它采用先进先出的规则对节点进行排序
- 当我们添加一个元素的时候，它会添加到队列的尾部
- 当我们获取一个元素时，它会返回队列头部的元素。

## ConcurrentLinkedQueue 结构
ConcurrentLinkedQueue 由 head 节点和 tail 节点组成，每个节点 (Node) 由节点元素 (item) 和指向下一个节点 (next) 的引用组成，节点与节点之间就是通过这个 next 关联起来，从而组成一 张链表结构的队列。默认情况下 head 节点存储的元素为空，tail 节点等于 head 节点。

```java
    private transient volatile Node<E> head; // head 节点

    private transient volatile Node<E> tail; // tail 节点，不一定是最后一个节点

    public ConcurrentLinkedQueue() {
        head = tail = new Node<E>(null); // 默认相等
    }
```

## ConcurrentLinkedQueue 入队解析
由于 ConcurrentLinkedQueue 是无界的，所以 offer 永远返回 true
```java
    public boolean offer(E e) {
        checkNotNull(e);
        final Node<E> newNode = new Node<E>(e);

        for (Node<E> t = tail, p = t;;) { // p 用来表示队列的尾节点，默认情况下等于 tail 节点。
            Node<E> q = p.next; // p 的 next 节点
            // p 没有 next 节点
            if (q == null) { 
                if (p.casNext(null, newNode)) {
                    // 如果 p != t，则将入队结点设置成 tail 结点，更新失败了也没关系
                    // 因为失败了表示有其他线程成功更新了 tail 结点
                    if (p != t) 
                        casTail(t, newNode);  // cas 修改尾节点
                    return true;
                }
            }
            // 多线程操作时候，由于 poll 方法会把旧的 head 变为自引用，然后将 head 的 next 设置为新的 head
            // 所以需要重新找新的 head，因为新的 head 后面的节点才是激活的节点
            else if (p == q) // p 有 next 节点，且是 tail 节点
                p = (t != (t = tail)) ? t : head;
            // 寻找尾节点    
            else  
                p = (p != t && t != (t = tail)) ? t : q;
        }
    }
```

主要逻辑:
- 将入队节点设置成当前队列尾节点的下一个节点;
- 更新 tail 节点
    - 如果 tail 节点的 next 节点不为空，则将入队节点设置成 tail 节点，
    - 如果 tail 节点的 next 节点为空，则将入队节点设置成 tail 的 next 节点，所以 tail 节点不总是尾节点

> tail 节点并不总是尾节点，所以每次入队都必须先通过 tail 节点来找到尾节点。尾节点可能是 tail 节点，也可能是 tail 节点的 next 节点。

## ConcurrentLinkedQueue 出队解析
```java
    public E poll() {
        restartFromHead:
        for (;;) {
            for (Node<E> h = head, p = h, q;;) {
                E item = p.item; // 获取头节点的元素

                // 头节点元素不为空，CAS 的方式将头节点的引用设置成 null
                if (item != null && p.casItem(item, null)) {
                    if (p != h) // 头节点已变更
                        updateHead(h, ((q = p.next) != null) ? q : p);
                    return item;
                }
                else if ((q = p.next) == null) { // 头节点已经变更更新头节点
                    updateHead(h, p);
                    return null;
                }
                else if (p == q) // 已经出队跳出
                    continue restartFromHead;
                else
                    p = q; // 重新寻找
            }
        }
    }
```
主要逻辑:
- 首先获取头节点的元素，然后判断头节点元素是否为空
    - 如果为空，表示另外一个线程已经进行了一次出队操作将该节点的元素取走
    - 如果不为空，则使用 CAS 的方式将头节点的引用设置成 null
- 如果 CAS 成功，则直接返回头节点的元素
- 如果 CAS 不成功，表示另外一个线程已经进行了一次出队操作更新了 head 节点，导致元素发生了变化，需要重新获取头节点

## 注意事项

size 方法不同于常用集合的 size 方法，该方法会实时遍历计算，算法复杂度 O(n)，如果为了判断是否为空请使用 isEmpty 方法

## 参考
- 并发编程的艺术
- 更深入的了解可参考 [【Java 并发笔记】ConcurrentLinkedQueue 相关整理](https://www.jianshu.com/p/2b806ac8d28e)
