> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-core) ，[github-源码 ](https://github.com/GourdErwa/java-advanced/tree/master/java-core)，欢迎 Star，转载请附上原文出处链接和本声明。

Java 核心知识专栏系列笔记，系统性学习可访问个人复盘笔记-技术博客 [Java 核心知识 ](https://review-notes.top/language/java-core/)

[[toc]]

## 一、前言
一般情况我们通过反射可以调用方法，JDK 7 以后新增了 java.lang.invoke 包也可以进行方法调用。

下面我们用简单用代码演示这两个包 API 的不同，然后对两个包功能及实现原理做一个比较。最后运用 invoke 包方法句柄 MethodHandle 类实现动态方法调用的示例。

需要了解方法调用的相关指令及实现大体流程，知识点 [Java JVM 从方法调用的角度分析重载、重写的本质 ](https://gourderwa.blog.csdn.net/article/details/103995120)

## 二、java.lang.reflect 反射调用方法
java.lang.reflect 提供用于获取关于类和对象的反射信息的类和接口。

```java
public class ReflectExample {

    public String stringMethod(String s) {
        return s + "|" + s;
    }

    public static void main(String[] args) throws Throwable {
        ReflectExample example = new ReflectExample();
        Method stringMethod = ReflectExample.class.getMethod("stringMethod", String.class);
        Object reflect = stringMethod.invoke(example, "reflect");// reflect|reflect
    }
}
```
## 三、java.lang.invoke 动态确定目标方法

java.lang.invoke 包含由 Java 核心类库和虚拟机直接提供的动态语言支持。
JDK 7 时新加入的 java.lang.invoke 包是 JSR 292 的一个重要组成部分，这个包的主要目的是在之前单纯依靠符号引用来确定调用的目标方法这条路之外，提供一种新的动态确定目标方法的机制，称为「方法句柄」（MethodHandle）。

```java
public class InvokeExample {

    public String stringMethod(String s) {
        return s + "|" + s;
    }
    
    public static void main(String[] args) throws Throwable {
        // 获取方法的句柄并绑定 this 对象后执行
        Object r = lookup.findVirtual(InvokeExample.class,
            "stringMethod",
            MethodType.methodType(String.class, String.class)
            )// 获取方法类型
            .bindTo(example) // 绑定 this 对象
            .invoke("invoke stringMethod"); // 方法参数
    }
}
```

## 四、reflect、invoke 包的区别
声明：java.lang.reflect 简称为 「reflect」，java.lang.invoke 简称为 「invoke」。

**1.模拟方法调用的层次不同**

reflect 和 invoke 机制本质上都是在模拟方法调用，但是 reflect 是在模拟 Java 代码层次的方法调用，而 invoke 是在模拟字节码层次的方法调用。

- 在 invoke 中 MethodHandles.Lookup 的 3 个方法 findStatic、findVirtual、findSpecial 正是为了对应于 invokestatic、invokevirtual（以及 invokeinterface）和 invokespecial 这几条字节码指令的执行权限校验行为

- 这些底层细节在使用 reflect API 时是不需要关心的

**2.所包含的信息种类**

reflect 中的 Method 对象远比 invoke 中的 MethodHandle 对象所包含的信息来得多。
- Method 是方法在 Java 端的全面映像，包含了方法的签名、描述符以及方法属性表中各种属性的 Java 端表示方式，还包含执行权限等的运行期信息。

- MethodHandle 仅包含执行该方法的相关信息。

用开发人员通俗的话来讲，reflect 是重量级，而 invoke 是轻量级。

**2.可优化性**
- 由于 invoke 是对字节码的方法指令调用的模拟，那理论上虚拟机在这方面做的各种优化（如方法内联），在 invoke 上也应当可以采用类似思路去支持（但目前实现还在继续完善中）

- 通过 reflect 去调用方法则几乎不可能直接去实施各类调用点优化措施

**3.设计层面**

- reflect API 的设计目标是只为 Java 语言服务的

- invoke API 则设计为可服务于所有 Java 虚拟机之上的语言

## 五、java.lang.invoke 包方法句柄 MethodHandle

MethodHandles.Lookup 提供了较多的静态方法可以快速创建 MethodHandle 对象，部分方法与常量池映射表：

| 方法  |  CONSTANT_MethodHandle 常量池参考|
|:---|:---|
|findVirtual| 接口 REF_invokeInterface ，非接口 REF_invokeVirtual|
|findConstructor| REF_newInvokeSpecial|
|findGetter| REF_getField|
|findSetter| REF_putField|
|findSpecial| REF_invokeSpecial|
|findStatic| REF_invokeStatic|
|findStaticGetter| REF_getStatic|
|findStaticSetter| REF_putStatic|
|findStaticVarHandle| REF_getStatic、REF_putStatic|
|findVarHandle| REF_getField、REF_putField|

（回忆虚拟机字节码知识）在 Java 虚拟机支持以下 5 条方法调用字节码指令，与上述常量池映射表对应。

- invokestatic：用于调用静态方法
- invokespecial：用于调用实例构造器 `<init>()`方法、私有方法和父类中的方法
- invokevirtual：用于调用所有的虚方法。
- invokeinterface：用于调用接口方法，会在运行时再确定一个实现该接口的对象
- invokedynamic：先在运行时动态解析出调用点限定符所引用的方法，然后再执行该方法。前面 4 条调用指令，分派逻辑都固化在 Java 虚拟机内部，而 invokedynamic 指令的分派逻辑是由用户设定的引导方法来决定的。

**重点！！！**：MethodHandle 用于模拟 invokespecial 指令时，必须遵守跟 Java 字节码里的 invokespecial 指令相同的限制——它只能调用到传给 findSpecial() 方法的最后一个参数（“specialCaller”）的直接父类的版本。

### 通过一段多继承代码 Son > Father > GrandFather 实战

声明一个多重继承的关系 Son > Father > GrandFather 如下：
```java
public class InvokeGrandFather {

    public static class GrandFather {
        public void say() throws Throwable {
            System.out.println("GrandFather.say");
        }
    }

    public static class Father extends GrandFather {
        @Override public void say() throws Throwable {
            System.out.println("Father.say");
        }
    }

    public static class Son extends Father {
        @Override public void say() throws Throwable {
            System.out.println("Son.say");
        }
    }
}
```
### 如何在直接调用 say 方法？
```java
    public void invoke(GrandFather o) throws Throwable {
       MethodHandles.lookup()
            .findVirtual(o.getClass(), // 指定访问类或接口
                "say",
                MethodType.methodType(void.class))
            .bindTo(o) // 指定真正调用方法的对象（类似于方法第一个隐式的 this）
            .invoke(); // 方法参数
    }
```

### 如何在 Son.say 方法中访问 Father.say 方法？（子调父）
```java
    public static class Son extends Father {
        @Override
        public void say() throws Throwable {
            System.out.println("Son.say");
            MethodHandles.lookup()
                .findSpecial(GrandFather.class,
                    "say",
                    MethodType.methodType(void.class),
                    getClass()) // 指定为 Son，invokespecial 指令调用 Father 的方法
                .bindTo(this)
                .invoke();
        }
    }
    输出：
    Son.say
    Father.say
```

### 如何在 Son.say 方法中访问 GrandFather.say 方法？（子调祖父）

出于安全考虑（目前 JDK13），默认不可跨父类调用，如果需要子调祖父这种行为，需要通过反射修改权限。
警告信息如下：`WARNING: An illegal reflective access operation has occurred`

```java
    public static class SonAccess extends Father {
        @Override
        public void say() throws Throwable {
            System.out.println("Son.say");
            Field lookupImpl = MethodHandles.Lookup.class.getDeclaredField("IMPL_LOOKUP");
            lookupImpl.setAccessible(true); // 修改权限
            ((MethodHandles.Lookup) lookupImpl.get(null))
                .findSpecial(GrandFather.class,
                    "say",
                    MethodType.methodType(void.class),
                    Father.class) // 指定为 Father ，最终调用 GrandFather
                .bindTo(this)
                .invoke();
        }
    }
    输出：
    Son.say
    GrandFather.say
```
## 总结
- java.lang.invoke 包为了虚拟机支持动态语言出现。

- 方法句柄 MethodHandle 对应了底层常量池及方法调用的字节码。

- 对于虚方法的调用，最终调用 findSpecial 方法最后一个参数类型对应父类的方法，如果该父类没有向上查找。

- 如果需要子调祖父的需求，需要修改 IMPL_LOOKUP 字段访问权限。