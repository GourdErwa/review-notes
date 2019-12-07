
>该专栏内容与 [flink-basis](https://github.com/GourdErwa/review-notes/tree/master/framework/flink-basis) 同步，源码与 [flink-advanced](https://github.com/GourdErwa/flink-advanced) 同步。
本节内容对应[官方文档](https://ci.apache.org/projects/flink/flink-docs-release-1.9/zh/dev/batch/#semantic-annotations)，本节内容对应[示例源码](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/batch/SemanticAnnotations.scala)  

语义注解可用于为Flink提供有关函数行为的提示。它们告诉系统函数读取和评估函数输入的哪些字段，以及未修改的函数将哪些字段从其输入转发到输出。  
语义注解是加快执行速度的强大方法，因为它们使系统能够推理出在多个操作之间重用排序顺序或分区。  
使用语义注解最终可以使程序免于不必要的数据改组或不必要的排序，并显着提高程序的性能。

>注意：语义注解的使用是可选的。但是，在提供语义注解时保守是绝对至关重要的！错误的语义注解将导致Flink对您的程序做出错误的假设，并最终可能导致错误的结果。如果操作员的行为无法明确预测，则不应提供注释。请仔细阅读文档。

# Forwarded Fields Annotation（转发字段注解）
转发字段信息声明了输入字段，该字段未经修改就被函数转发到输出中的相同位置或另一个位置。  
优化器使用此信息来推断函数是否保留了诸如排序或分区之类的数据属性。  

使用字段表达式指定字段转发信息。可以通过其位置指定转发到输出中相同位置的字段。指定的位置必须对输入和输出数据类型有效，并且必须具有相同的类型。

**转发规则语法**
- `SingleInputUdfOperator（withForwardedFields）` 语法：  
    - `dataUnix->_1`  表示将class中dataUnix转发到scala元组的第一个位置
    - `*`             表示全部字段转发
    - `*->_2`         表示部字段转发到scala元组的第二个位置


- `TwoInputUdfOperator` 语法：
    - `withForwardFieldsFirst`      函数的第一个输入规则定义，定义内容语法与 withForwardedFields 一致
    - `withForwardedFieldsSecond`   函数的第二个输入规则定义，定义内容语法与 withForwardedFields 一致
  
```java
object ForwardedFields extends BatchExecutionEnvironmentApp {

  // 用户登录数据 DataSet
  val userLoginDs = DataSet.userLogin(this)
  val rolePayDs = DataSet.rolePay(this)

  userLoginDs
    .map(new MyForwardedFieldsMap()).withForwardedFields("dataUnix->_1", "uid->_2", "status->_3")
    .map(o => o).withForwardedFields("*")
    .map(o => (o._2, o)).withForwardedFields("_2->_1", "*->_2")
    .join(rolePayDs).where(0).equalTo(_.uid).apply((o1, o2) => (o1._1, o1._2, o2.rid))
    .withForwardedFieldsFirst("_1->_1", "_2->_2").withForwardedFieldsSecond("rid->_3")
    .print()
}

/**
  * 自定义 map 实现函数，操作累加器示例
  * (Int, String, String) => (时间，用户ID,用户登录状态)
  */
class MyForwardedFieldsMap extends MapFunction[UserLogin, (Int, String, String)] {
  override def map(value: UserLogin): (Int, String, String) =
    (value.dataUnix, value.uid, value.status)
}
```
## 函数类注释
- @ForwardedFields 用于诸如Map和Reduce的单一输入功能。
- @ForwardedFieldsFirst 具有两个输入（例如Join和CoGroup）的函数的第一个输入。
- @ForwardedFieldsSecond 具有两个输入（例如Join和CoGroup）的函数的第二个输入。

## 运算符参数
- data.map(myMapFnc).withForwardedFields() 用于单个输入功能，例如Map和Reduce。
- data1.join(data2).where().equalTo().with(myJoinFnc).withForwardFieldsFirst() 具有两个输入（例如Join和CoGroup）的函数的第一个输入。
- data1.join(data2).where().equalTo().with(myJoinFnc).withForwardFieldsSecond() 具有两个输入（例如Join和CoGroup）的函数的第二个输入。

# Non-Forwarded Fields（非转发字段注解）
声明了非转发字段，未声明的默认为转发字段
>具有相反语义的声明方式与转发字段一致，且仅可通过注解方式声明
* [[org.apache.flink.api.java.functions.FunctionAnnotation.NonForwardedFields]]
* [[org.apache.flink.api.java.functions.FunctionAnnotation.NonForwardedFieldsFirst]]
* [[org.apache.flink.api.java.functions.FunctionAnnotation.NonForwardedFieldsSecond]]

# Read Fields(读取字段注解)
读取字段信息声明所有由函数访问和评估的字段，即函数使用的所有字段来计算其结果。  


例如，在指定读取字段信息时，必须将在条件语句中评估或用于计算的字段标记为已读。只有未经修改的字段转发到输出，而不评估其值或根本不被访问的字段不被视为被读取。
```java
@ReadFields("_1; _4") // _1 and _4 2个字段分别用于函数条件语句判断与结果计算.
class MyMap extends MapFunction[(Int, Int, Int, Int), (Int, Int)]{
   def map(value: (Int, Int, Int, Int)): (Int, Int) = {
    if (value._1 == 42) {
      return (value._1, value._2)
    } else {
      return (value._4 + 10, value._2)
    }
  }
}
```
