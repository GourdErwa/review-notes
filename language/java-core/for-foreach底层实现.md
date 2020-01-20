> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-core) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-core)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 核心知识专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 核心知识 ](https://review-notes.top/language/java-core/)

[[toc]]

## 一、前言
本节内容主要研究 for、foreach 循环的底层实现原理，再比较两种实现方式的性能。最后通过 RandomAccess 接口说明 JDK 让我们怎么去识别集合是否支持随机访问。

> 随机访问表示，像数组那样，随便给定一个下标我们就可以访问内存的数据。而链式结构的存储只能顺序遍历各个链表节点访问。

## 二、for 循环底层实现

for 循环是对数值型数据出栈、改变值、比较的过程。

```java
public void foriMethod() {
    for (int i = 0; i < 10; i++) {
        // ...
    }
}

———— 转为字节码，部分关键字节码如下：

 0 iconst_0         // 将 int 型 0 推送至栈顶
 1 istore_1         // 将栈顶 int 型数值存入第二个本地变量
 2 iload_1          // 将第二个 int 型本地变量推送至栈顶
 3 bipush 10        // 将单字节的常量值 10 推送至栈顶
 5 if_icmpge 14 (+9)// 比较栈顶两 int 型数值大小, 当结果大于等于 0 时跳转
 8 iinc 1 by 1      // 将指定 int 型变量增加指定值，此处 +1
11 goto 2 (-9)      // 无条件跳转至 计数器为 2 code，继续循环
14 return
```

## 三、foreach 循序底层实现

foreach 循环底层会把循环主体对象（实现了 Iterable 接口）转换为 Iterator 对象进行迭代器遍历。

```java
public void foreachMethod(List<String> list) {
    for (String s : list) {
     }
}
// 等价于 for (Iterator i=list.iterator(); i.hasNext(); ) i.next();

———— 转为字节码，部分关键字节码如下：
    
 0 aload_1            // 将第二个引用类型本地变量 (list) 推送至栈顶
 1 invokeinterface #2 // 调用 iterator 方法 <java/util/List.iterator> count 1
 6 astore_2           // 将栈顶引用型数值存入第三个本地变量
 7 aload_2            // 将第三个引用类型本地变量推送至栈顶
 8 invokeinterface #3 // 调用 Iterator.hasNext <java/util/Iterator.hasNext> count 1
13 ifeq 29 (+16)      // 当栈顶 int 型数值等于 0 时跳转到 29 code
16 aload_2            // 将第三个引用类型本地变量推送至栈顶
17 invokeinterface #4 // 调用 Iterator.hasNext 方法返回当前取值对象 <java/util/Iterator.next> count 1
22 checkcast       #5 // 强转为 <java/lang/String>
25 astore_3           // 将栈顶引用型数值存入第四个本地变量
26 goto 7 (-19)       // 继续循环
29 return

```

## 四、foreach 与 for 性能比较
**先下结论**：

尽量使用 for 循环，开销比 foreach 低。

> 对于 `(int i = 0; i < list.size(); i++)` ，长度尽量定义为变量，减少每次计算消耗。

```java
—————————————————————————— foreach 生成字节码 ———————————————————————
for (String s : list) {}

 0 aload_1
 1 invokeinterface #2 <java/util/List.iterator> count 1
 6 astore_2
 7 aload_2
 8 invokeinterface #3 <java/util/Iterator.hasNext> count 1
13 ifeq 29 (+16)
16 aload_2
17 invokeinterface #4 <java/util/Iterator.next> count 1
22 checkcast #5 <java/lang/String>
25 astore_3
26 goto 7 (-19)

—————————————————————————— for 生成字节码 —————————————————————————
for (int i = 0; i < list.size(); i++) {
    String s = list.get(i);
}

29 iconst_0
30 istore_2
31 iload_2
32 aload_1
33 invokeinterface #6 // 此处可优化为一个变量 list.size()，减少每次方法调用（如果编译器足够智能可能进行标量替换）
38 if_icmpge 58 (+20)
41 aload_1
42 iload_2
43 invokeinterface #7 <java/util/List.get> count 2
48 checkcast #5 <java/lang/String>
51 astore_3
52 iinc 2 by 1
55 goto 31 (-24)
```
1. 从字节码层面分析，发现 foreach 会生成 Iterator 对象，而且这个对象时调用实时创建的，而且在整个 迭代过程中，hasNext 方法处理逻辑比较复杂。以 ArrayList 为例：
```java
public Iterator<E> iterator() {
        return new Itr();
}

// Itr 类中的 next 方法如下：
public E next() {
    checkForComodification();
    int i = cursor;
    if (i >= size)
        throw new NoSuchElementException();
    Object[] elementData = ArrayList.this.elementData;
    if (i >= elementData.length)
        throw new ConcurrentModificationException();
    cursor = i + 1;
    return (E) elementData[lastRet = i];
}
```

2. 如果我们用 for 时，只需要根据下标取对应的数据即可
```java
public E get(int index) {
    Objects.checkIndex(index, size);
    return elementData(index);
}
```

## 五、RandomAccess 接口让我们尽量使用 for 循环
1. RandomAccess 接口是干什么的？
```java
public interface RandomAccess { }
```
我们可以看到这个接口没有任何实现，它仅仅起一个标识的作用，标识这个集合是否支持随机访问。类似于 `Serializable, Cloneable`。

2. RandomAccess 有什么用？

举个例子：

List 接口有 ArrayList、LinkedList 两个实现。但是 LinkedList 底层是链表实现不支持随机访问，所以无法使用 for 循环，只能使用 foreach 循环遍历了。

```java
public <T extends Object> void randomAccess(List<T> list) {
    if (list instanceof RandomAccess) {
        for (int i = 0; i < list.size(); i++) {
            T t = list.get(i);
        }
    } else {
        for (T t : list) {
            System.out.println(t);
        }
    }
}
```
现在我们知道为什么 Set 接口没有实现 RandomAccess 接口了吧。这也是为什么 Set 不能通过下标取值的原因。

## 专栏更多文章笔记
- [Java 核心知识-专栏文章目录汇总 ](https://gourderwa.blog.csdn.net/article/details/104020339)

- [Java 并发编程-专栏文章目录汇总 ](https://blog.csdn.net/xiaohulunb/article/details/103594468)

- [Java JVM（JDK13）-专栏文章目录汇总 ](https://blog.csdn.net/xiaohulunb/article/details/103828570)