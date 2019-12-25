> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-concurrency) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-concurrency)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 并发编程专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 并发编程](https://review-notes.top/language/java-concurrency/)

[[toc]]
## LockSupport 是什么
LockSupport 定义了一组的公共静态方法，这些方法提供了最基本的线程阻塞和唤醒功能，而 LockSupport 也成为构建同步组件的基础工具 (AQS 中大量使用了该工具类)。

## 提供方法说明
- park 开头的方法用来阻塞当前线程。
- unpark(Thread thread) 方法来唤醒一个被阻塞的线程。

***

LockSupport 方法中最终调用的是 Unsafe 中的 native 代码：
```java
public class LockSupport {
    private static final Unsafe U = Unsafe.getUnsafe();

    // 为给定的线程提供许可证（如果尚未提供）。 如果线程在 park 被阻塞，那么它将被解除阻塞。
    // 否则，其下一次拨打 park 保证不被阻止。 如果给定的线程尚未启动，则此操作无法保证完全没有任何影响。
    public static void unpark(Thread thread)

    // 禁用当前线程进行线程调度，如果调用 unpark(Thread thread) 或者当前线程被中断，才能返回
    public static void park()

    // 在 park 基础上增加了阻塞对象标识，用于问题排查和系统监控
    public static void park(Object blocker)

    // 在 park(Object blocker) 基础上增加了超时返回
    public static void parkNanos(Object blocker, long nanos)

    // 在 park 基础上增加超时返回
    public static void parkNanos(long nanos)

    // 在 park 基础上增加超时截止时间返回
    public static void parkUntil(long deadline)

    // 在 park(Object blocker) 基础上增加了超时截止时间设置，超时后直接返回
    public static void parkUntil(Object blocker, long deadline)
}
```

## 底层实现原理
LockSupport.park 的实现原理是通过二元信号量做的阻塞，要注意的是，这个信号量最多只能加到 1。  
我们也可以理解成获取释放许可证的场景。
- unpark 方法会释放一个许可证
- park 方法则是获取许可证，如果当前没有许可证，则进入休眠状态，直到许可证被释放了才被唤醒。

无论执行多少次 unpark 方法，也最多只会有一个许可证。

***

在 Linux 系统下，是用的 Posix 线程库 pthread 中的 mutex（互斥量），condition（条件变量）来实现的。mutex 和 condition 保护了一个_counter 的变量：
- 当 park 时，这个变量被设置为 0
- 当 unpark 时，这个变量被设置为 1


每个 Java 线程都有一个 Parker 实例，Parker 类是这样定义的：
```c
class Parker : public os::PlatformParker {
private:
  volatile int _counter ; // 记录“许可”
  ...
public:
  void park(bool isAbsolute, jlong time);
  void unpark();
  ...
}
class PlatformParker : public CHeapObj<mtInternal> {
  protected:
    pthread_mutex_t _mutex [1] ; // 互斥量
    pthread_cond_t  _cond  [1] ; // 条件变量
    ...
}
```

### 底层实现原理- park 过程
部分源码参考：
```c
void Parker::park(bool isAbsolute, jlong time) {

   // 当调用 park 时，先尝试能否直接拿到“许可”，即_counter>0 时，如果成功，则把_counter 设置为 0，并返回：
   if (Atomic::xchg(0, &_counter) > 0) return;

   // 如果不成功，则构造一个 ThreadBlockInVM，然后检查_counter 是不是>0，
   // 如果是，则把_counter 设置为 0，unlock mutex 并返回：
    ThreadBlockInVM tbivm(jt);  
    if (_counter > 0)  { // no wait needed  
      _counter = 0;  
      status = pthread_mutex_unlock(_mutex);

   // 否则，再判断等待的时间，然后再调用 pthread_cond_wait 函数等待
   // 如果等待返回，则把_counter 设置为 0，unlock mutex 并返回：
    if (time == 0) {
      status = pthread_cond_wait (_cond, _mutex) ;  
    }  
    _counter = 0 ;  
    status = pthread_mutex_unlock(_mutex) ;  
    assert_status(status == 0, status, "invariant") ;  
    OrderAccess::fence();  
```
### 底层实现原理-unpark 过程
当 unpark 时，直接设置_counter 为 1，再 unlock mutex 返回。

如果_counter 之前的值是 0，则还要调用 pthread_cond_signal 唤醒在 park 中等待的线程：
```c
void Parker::unpark() {
  int s, status ;
  status = pthread_mutex_lock(_mutex);
  assert (status == 0, "invariant") ;
  s = _counter;
  _counter = 1;
  if (s < 1) {
     if (WorkAroundNPTLTimedWaitHang) {
        status = pthread_cond_signal (_cond) ;
        assert (status == 0, "invariant") ;
        status = pthread_mutex_unlock(_mutex);
        assert (status == 0, "invariant") ;
     } else {
        status = pthread_mutex_unlock(_mutex);
        assert (status == 0, "invariant") ;
        status = pthread_cond_signal (_cond) ;
        assert (status == 0, "invariant") ;
     }
  } else {
    pthread_mutex_unlock(_mutex);
    assert (status == 0, "invariant") ;
  }
}
```

## 应用场景
- 并发编程中需要显示的对指定线程等待唤醒操作
## 参考
- 有关线程等待操作相关操作区别，参考本专栏《线程等待操作（sleep、wait、park、Condition）区别》
- [LockSupport（park/unpark）源码分析 ](https://www.jianshu.com/p/e3afe8ab8364)