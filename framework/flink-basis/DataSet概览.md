>专栏原创出处：[源笔记文件](https://github.com/GourdErwa/review-notes/tree/master/framework/flink-basis) ，[源码](https://github.com/GourdErwa/flink-advanced)   
本节内容部分[源码](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/batch/transformations)       

[[toc]]

## 1 示例程序
[Batch.scala](https://github.com/GourdErwa/flink-advanced/blob/master/src/main/scala/io/gourd/flink/scala/games/batch/Batch.scala)
```java
// 操作原始 DataSet API 完成 2个表数据过滤join聚合操作
object BatchDataSet extends BatchExecutionEnvironmentApp {

  // 用户登录数据 DataSet
  val userLoginDataSet = DataSet.userLogin(this)
  // 角色登录数据 DataSet
  val roleLoginDataSet = DataSet.roleLogin(this)

  userLoginDataSet
    .filter(_.dataUnix > 1571414499)
    .filter(_.status == "LOGIN")
    .join(roleLoginDataSet, JoinHint.BROADCAST_HASH_FIRST).where(_.uid).equalTo(_.uid)
    .apply((left, _) => left.platform -> 1)
    .groupBy(0)
    .sum(1)
    .sortPartition(1, Order.ASCENDING)
    .print()
}

// 操作 Table API 完成 2个表数据过滤join聚合操作
object BatchTable extends BatchTableEnvironmentApp {

  private val userLogin = RegisterDataSet.userLogin(this)
  private val roleLogin = RegisterDataSet.roleLogin(this)

  btEnv.scan(userLogin)
    .select("platform,dataUnix,uid,status")
    .where('dataUnix > 1571414499 && 'status === "LOGIN")
    .join(btEnv.scan(roleLogin).select("uid as r_uid"), "uid = r_uid")
    .groupBy("platform")
    .select("platform as p , count(platform) as c")
    .orderBy('c.asc)
    .toDataSet[(String, Long)]
    .print()
}

// 操作 SQL 完成 2个表数据过滤join聚合操作
object BatchSQL extends BatchTableEnvironmentApp {

  private val table = RegisterDataSet.userLogin(this)

  btEnv.sqlQuery(
    s"""
       |SELECT platform AS p,COUNT(platform) AS c FROM
       |(
       |SELECT platform,dataUnix,uid,status FROM $table
       |WHERE dataUnix > 0 AND status = 'LOGIN'
       |)
       |GROUP BY platform
       |""".stripMargin)
    .toDataSet[(String, Long)]
    .print()
}
```
## 2 程序数据源输入（Data Sources）
### 2.1 基于文件：
- `readTextFile(path)// TextInputFormat`-逐行读取文件，并将它们作为字符串返回。
- `readTextFileWithValue(path)// TextValueInputFormat`-逐行读取文件，并将它们作为StringValues返回。StringValues 是可变字符串。
- `readCsvFile(path)// CsvInputFormat`-解析以逗号（或其他字符）分隔的字段的文件。返回元组，case class对象或POJO的数据集。支持基本的Java类型及其与Value相对应的字段类型。
- `readFileOfPrimitives(path, delimiter)`// PrimitiveInputFormat-解析以换行符（或其他char序列）定界的原始数据类型的文件，例如String或Integer使用给定的定界符。
- `readSequenceFile(Key, Value, path)`// SequenceFileInputFormat-创建JobConf并从指定的路径中读取类型为SequenceFileInputFormat，Key类和Value类的文件，并将它们作为Tuple2 <Key，Value>返回。

### 2.2 基于集合：
- `fromCollection(Iterable)`-从Iterable创建数据集。Iterable 返回的所有元素都必须是同一类型。
- `fromCollection(Iterator)`-从迭代器创建数据集。该类指定迭代器返回的元素的数据类型。
- `fromElements(elements: _*)`-从给定的对象序列创建数据集。所有对象必须具有相同的类型。
- `fromParallelCollection(SplittableIterator)`-从迭代器并行创建数据集。该类指定迭代器返回的元素的数据类型。
- `generateSequence(from, to)` -并行生成给定间隔中的数字序列。

### 2.3 通用：
- `readFile(inputFormat, path)// FileInputFormat`-接受文件输入格式。
- `createInput(inputFormat)// InputFormat`-接受通用输入格式。

## 3 程序数据输出（Data Sinks）
- `writeAsText()`// TextOutputFormat-将元素按行写为字符串。通过调用每个元素的 toString（）方法获得字符串。
- `writeAsCsv(...)`// CsvOutputFormat-将元组写为逗号分隔的值文件。行和字段定界符是可配置的。每个字段的值来自对象的 toString（）方法。
- `print()`// printToErr()- 在标准输出/标准错误流上打印每个元素的 toString（）值。
- `write()`// FileOutputFormat-自定义文件输出的方法和基类。支持自定义对象到字节的转换。
- `output()`// OutputFormat-最通用的输出方法，用于不基于文件的数据接收器（例如将结果存储在数据库中）。

## 4 转换操作（Transformations）
### 4.1 Map
Map转换将用户定义的map函数应用于DataSet的每个元素。它实现了一对一的映射，也就是说，函数必须恰好返回一个元素。
```
val intPairs: DataSet[(Int, Int)] = // [...]
val intSums = intPairs.map { pair => pair._1 + pair._2 }
```
### 4.2 FlatMap
FlatMap转换在数据集的每个元素上应用用户定义的FlatMap方法。映射函数的可以为每个输入元素返回任意许多结果元素（包括无结果元素）。
```
val textLines: DataSet[String] = // [...]
val words = textLines.flatMap { _.split(" ") }
```
### 4.3 MapPartition
MapPartition在单个函数调用中转换并行分区。map-partition函数将分区获取为Iterable，并可以产生任意数量的结果值。每个分区中元素的数量取决于并行度和先前的操作。
```
val textLines: DataSet[String] = // [...]
// 因为返回值必须是Collection，所以需要Some
// 从Option到Collection的隐式转换
val counts = texLines.mapPartition { in => Some(in.size) }
```
### 4.4 Filter
Filter转换将用户定义的过滤器功能应用于DataSet的每个元素，并仅保留函数返回的那些元素true。
```
val intNumbers: DataSet[Int] = // [...]
val naturalNumbers = intNumbers.filter { _ > 0 }
```
### 4.5 Projection of Tuple DataSet（元组数据集投影）
project转换将删除或移动元组数据集的元组字段。该project(int...)方法选择应由其索引保留的元组字段，并在输出元组中定义其顺序。
project不需要定义函数体
```
DataSet<Tuple3<Integer, Double, String>> in = // [...]
// converts Tuple3<Integer, Double, String> into Tuple2<String, Integer>
DataSet<Tuple2<String, Integer>> out = in.project(2,0);
```
**带有类型提示的投影**  
请注意，Java编译器无法推断project运算符的返回类型。如果您根据project运算符的结果调用另一个运算符，则可能会导致问题，例如：
```
DataSet<Tuple5<String,String,String,String,String>> ds = ....
DataSet<Tuple1<String>> ds2 = ds.project(0).distinct(0);
```
可以通过如下提示project操作符的返回类型来克服此问题：
```
DataSet<Tuple1<String>> ds2 = ds.<Tuple1<String>>project(0).distinct(0);
```
### 4.6 Transformations on Grouped DataSet（分组数据集的转换）
reduce 操作可以对分组的数据集进行操作。指定用于分组的密钥可以通过多种方式完成：
- 关键表达，`groupBy("key")`
- 键选择器功能，`implements KeySelector`
- 一个或多个字段位置键（仅限元组数据集），`groupBy(0, 1)`
- 案例类别字段（仅案例类别），`groupBy("a", "b")`
### 4.7 Reduce on Grouped DataSet（减少分组数据集）
应用于分组数据集的Reduce转换使用用户定义的reduce函数将每个组简化为单个元素。  
对于每组输入元素，reduce函数依次将成对的元素组合为一个元素，直到每组只剩下一个元素为止。
```scala
// some ordinary POJO
class WC(val word: String, val count: Int) {
  def this() {
    this(null, -1)
  }
  // [...]
}

val words: DataSet[WC] = // [...]
val wordCounts = words.groupBy { _.word } reduce {
  (w1, w2) => new WC(w1.word, w1.count + w2.count)
}
```
### 4.8 GroupReduce on Grouped DataSet（分组数据集上的GroupReduce）
应用于分组数据集的GroupReduce转换为每个组调用用户定义的group-reduce函数。  
此与Reduce的区别在于，用户定义的函数可一次获取整个组。该函数在组的所有元素上使用Iterable调用，并且可以返回任意数量的结果元素。
```scala
val input: DataSet[(Int, String)] = // [...]
val output = input.groupBy(0).reduceGroup {
      (in, out: Collector[(Int, String)]) =>
        in.toSet foreach (out.collect)
    }
```
### 4.9 可组合的GroupReduce函数
```scala
object GroupReduceOnCombinatorGroupReduceFunctions extends Transformations {
  roleLoginDs
    .map(o => (o.uid, o.dataUnix, o.money))
    .filter(_._1.contains("1|1051")) // 筛选部分用户
    .groupBy(0, 1) // 按用户 ID 分组
    .sortGroup(2, Order.ASCENDING) // 分组排序，按订单金额升序
    .reduceGroup(new MyCombinableGroupReducer())
    .print()

  /* sortGroup 后原始数据集
  (1|1051,1571798861,50.0)
  (1|1051,1571798861,64.0)
  (1|1051,1571798860,198.0)
  (1|1051,1571798859,328.0)
  (1|1051,1571798859,648.0)
 */
 
   /* 计算结果为
  (1|1051,1571798859,976.0)
  (1|1051,1571798860,198.0)
  (1|1051,1571798861,114.0)
   */
}

/**
  * 与 reduce 函数相比，group-reduce 函数不是可隐式组合的。
  * 为了使 group-reduce 函数可组合，它必须实现 GroupCombineFunction 接口。
  *
  * 要点：GroupCombineFunction 接口的通用输入和输出类型必须等于 GroupReduceFunction 的通用输入类型，
  * 如以下示例所示：
  */
import scala.collection.JavaConverters._

class MyCombinableGroupReducer
  extends GroupReduceFunction[(String, Int, Double), (String, Int, Double)]
    with GroupCombineFunction[(String, Int, Double), (String, Int, Double)] {
  override def reduce(values: lang.Iterable[(String, Int, Double)],
                      out: Collector[(String, Int, Double)]): Unit = {
    values.iterator().asScala.foreach(o => out.collect(o))
  }

  override def combine(values: lang.Iterable[(String, Int, Double)],
                       out: Collector[(String, Int, Double)]): Unit = {
    val r = values.iterator().asScala.reduce((o1, o2) => (o1._1, o1._2, o1._3 + o2._3))
    out.collect(r) // 合并相同 key 的价格
  }
}
```
### 4.10 GroupCombine on a Grouped DataSet（分组数据集上的GroupCombine）
GroupCombine转换是可组合GroupReduceFunction中的合并步骤的通用形式。  
从某种意义上讲，它是广义的，它允许将输入类型组合为I任意输出类型O。  
相反，GroupReduce中的Combine步骤仅允许从input type I到output type的组合I。  
这是因为GroupReduceFunction中的reduce步骤需要输入类型I。

在一些应用中，期望在执行附加转换之前将数据集组合成中间格式（例如，以减小数据大小）。这可以通过具有很少成本的CombineGroup转换来实现。

>注意：分组数据集上的GroupCombine使用贪婪策略在内存中执行，该策略可能不会一次处理所有数据，而是分多个步骤进行。它也可以在单个分区上执行，而无需像GroupReduce转换那样进行数据交换。这可能会导致部分结果。

下面的示例演示将CombineGroup转换用于替代WordCount实现。
```scala
val input: DataSet[String] = [..] // The words received as input

val combinedWords: DataSet[(String, Int)] = input
  .groupBy(0)
  .combineGroup {
    (words, out: Collector[(String, Int)]) =>
        var key: String = null
        var count = 0

        for (word <- words) {
            key = word
            count += 1
        }
        out.collect((key, count))
}

val output: DataSet[(String, Int)] = combinedWords
  .groupBy(0)
  .reduceGroup {
    (words, out: Collector[(String, Int)]) =>
        var key: String = null
        var sum = 0

        for ((word, sum) <- words) {
            key = word
            sum += count
        }
        out.collect((key, sum))
}
```
### 4.11 Aggregate on Grouped Tuple DataSet（在分组元组数据集聚合）
- 有一些常用的聚合操作。聚合转换提供以下内置聚合功能：
- Sum
- Min, and
- Max
>聚合转换只能应用于元组数据集，并且仅支持用于分组的字段位置键。
```scala
// 角色付费数据 DataSet
  val roleLoginDs = DataSet.rolePay(this)

  { // aggregate
    roleLoginDs
      .map(o => (o.uid, o.dataUnix, o.money))
      .filter(_._1.contains("0|102")) // 筛选部分用户
      .groupBy(0)
      .aggregate(Aggregations.SUM, 2)
      // .aggregate(Aggregations.MIN, 1)
      // .andMin(1)
      .print()
    /*
    .aggregate(Aggregations.SUM, 2) 计算结果为
    (0|1021,1571473389,396.0)
    (0|1024,1571543169,50.0)
    (0|1025,1571420259,648.0)
    (0|1025_199,1571577819,648.0)
    */
    /*
    .aggregate(Aggregations.SUM, 2).andMin(1) 计算结果为
    (0|1021,1571471529,396.0)
    (0|1024,1571543169,50.0)
    (0|1025,1571420259,648.0)
    (0|1025_199,1571577819,648.0)
     */
    /*
    .aggregate(Aggregations.SUM, 2).aggregate(Aggregations.MIN, 1) 计算结果为
    (0|1025_199,1571420259,648.0)
     */
  }
```
要将多个聚合应用于一个DataSet，必须.and()在第一个聚合之后使用该函数，这意味着.aggregate(SUM, 0).and(MIN, 2)产生原始DataSet的字段0之和和字段2的最小值。  
与此相反，.aggregate(SUM, 0).aggregate(MIN, 2)将对聚合应用聚合。

### 4.12 MinBy / MaxBy on Grouped Tuple DataSet（分组元组数据集上的MinBy / MaxBy）
MinBy（MaxBy）转换为每个元组组选择一个元组。  
选定的元组是其一个或多个指定字段的值最小（最大）的元组。用于比较的字段必须是有效的关键字段，即可比较的字段。  
如果多个元组具有最小（最大）字段值，则返回这些元组中的任意元组。
```scala
  roleLoginDs
    .map(o => (o.uid, o.dataUnix, o.money))
    .filter(_._1.contains("1|1051"))
    .groupBy(0)
    .minBy(1, 2)
    .print()
  /* 原始数据集
  (1|1051,1571798859,648.0)
  (1|1051,1571798859,328.0)
  (1|1051,1571798860,198.0)
  (1|1051,1571798861,64.0)
  (1|1051,1571798861,50.0)
   */

  /* 计算结果为
  (1|1051,1571798859,328.0)
   */
```
### 4.13 Reduce on full DataSet（减少完整的DataSet）
Reduce转换将用户定义的reduce函数应用于DataSet的所有元素。reduce函数随后将成对的元素组合为一个元素，直到仅剩下一个元素为止。
>使用Reduce转换来减少完整的DataSet意味着最终的Reduce操作不能并行进行。但是，reduce函数可以自动组合，因此Reduce转换在大多数情况下都不会限制可伸缩性。
```scala
val intNumbers = env.fromElements(1,2,3)
val sum = intNumbers.reduce (_ + _)
```
### 4.14 GroupReduce on full DataSet（完整数据集上的GroupReduce）
GroupReduce转换在DataSet的所有元素上应用用户定义的group-reduce函数。group-reduce可以迭代DataSet的所有元素并返回任意数量的结果元素
```scala
val input: DataSet[Int] = // [...]
val output = input.reduceGroup(new MyGroupReducer())
```
>注意：如果group-reduce函数不可组合，则无法并行完成对完整DataSet的GroupReduce转换。
>因此，这可能是非常计算密集的操作。请参阅上面有关“可组合的GroupReduce函数”的段落，以了解如何实现可组合组简化函数。
### 4.15 GroupCombine on a full DataSet（完整数据集上的GroupCombine）
完整数据集上的GroupCombine与分组数据集上的GroupCombine相似。  
数据在所有节点上进行分区，然后以贪婪的方式进行组合（即，仅将适合内存的数据进行一次组合）。
### 4.16 Aggregate on full Tuple DataSet（完整数据集上聚合）
聚合转换只能应用于元组数据集。
- 有一些常用的聚合操作。聚合转换提供以下内置聚合功能：
- Sum
- Min, and
- Max
```scala
val input: DataSet[(Int, String, Double)] = // [...]
val output = input.aggregate(SUM, 0).and(MIN, 2)
```
### 4.17 MinBy/MaxBy on full Tuple DataSet（完整数据集上的MinBy/MaxBy）
MinBy（MaxBy）转换从元组的数据集中选择一个元组。  
选定的元组是其一个或多个指定字段的值最小（最大）的元组。  
用于比较的字段必须是有效的关键字段，即可比较的字段。  
如果多个元组具有最小（最大）字段值，则返回这些元组中的任意元组。
```scala
val input: DataSet[(Int, String, Double)] = // [...]
val output: DataSet[(Int, String, Double)] = input                          
                                   .maxBy(0, 2) // select tuple with maximum values for first and third field.
```
### 4.18 Distinct（去重）
Distinct 转换计算源数据集的不同元素的数据集。以下代码从数据集中删除所有重复的元素：
```scala
val input: DataSet[(Int, Double, String)] = // [...]

val output = input.distinct() // 所有元组字段
val output = input.distinct(0,2) // 指定具体元组字段位置
val output = input.distinct {x => Math.abs(x)} // 使用  KeySelector 选择器


// some ordinary POJO
case class CustomType(aName : String, aNumber : Int) { }

val input: DataSet[CustomType] = // [...]
val output = input.distinct("aName", "aNumber") // 指定具体字段
val output = input.distinct("_") // 也可以通过通配符指示使用所有字段：
```
### 4.19 Join

```scala

```
### 4.20 OuterJoin

```scala

```
### 4.21 Cross
Cross转换将两个数据集组合为一个数据集。它构建两个输入数据集的元素的所有成对组合，即构建笛卡尔积。  
Cross转换要么在每对元素上调用用户定义的交叉函数，要么输出Tuple2

#### Cross with 自定义函数
```scala
roleLoginDs
    .filter(_.uid.equals("0|107"))
    .cross(userLoginDs.filter(_.uid.equals("0|107"))) {
      (c1, c2) => (c1.uid, c2.uid)
    }
    .print()
```
#### Cross with 数据集大小预估提示
```scala
  // crossWithTiny => 告诉系统假定右侧比左侧小很多
  roleLoginDs
    .filter(_.uid.equals("0|107"))
    .crossWithTiny(userLoginDs.filter(_.uid.equals("0|107"))) {
      (c1, c2) => (c1.uid, c2.uid)
    }
    .print()

  // crossWithHuge => 告诉系统假定左侧比右侧小很多
  roleLoginDs
    .filter(_.uid.equals("0|107"))
    .crossWithHuge(userLoginDs.filter(_.uid.equals("0|107"))) {
      (c1, c2) => (c1.uid, c2.uid)
    }
    .print()
```
### 4.22 CoGroup
CoGroup 转换共同处理两个数据集的组。两个数据集都分组在一个定义的键上，并且两个共享相同键的数据集的组一起交给用户定义的co-group function。  
如果对于一个特定的键，只有一个DataSet有一个组，则使用该组和一个空组调用共同组功能。协同功能可以分别迭代两个组的元素并返回任意数量的结果元素。


与Reduce，GroupReduce和Join相似，可以使用不同的键选择方法来定义键。
```scala
val iVals: DataSet[(String, Int)] = // [...]
val dVals: DataSet[(String, Double)] = // [...]

val output = iVals.coGroup(dVals).where(0).equalTo(0) {
  (iVals, dVals, out: Collector[Double]) =>
    val ints = iVals map { _._2 } toSet

    for (dVal <- dVals) {
      for (i <- ints) {
        out.collect(dVal._2 * i)
      }
    }
}
```
### 4.23 Union
产生两个必须具有相同类型的数据集的并集。可以通过多个联合调用实现两个以上DataSet的联合
```scala
val vals1: DataSet[(String, Int)] = // [...]
val vals2: DataSet[(String, Int)] = // [...]
val vals3: DataSet[(String, Int)] = // [...]

val unioned = vals1.union(vals2).union(vals3)
```
### 4.24 Rebalance(重新平衡)
均匀地重新平衡数据集的并行分区，以消除数据偏斜。  
**重要**：此操作会通过网络重新整理整个DataSet。可能会花费大量时间。
```scala
val in: DataSet[String] = // [...]
// rebalance DataSet and apply a Map transformation.
val out = in.rebalance().map { ... }
```
### 4.25 Hash-Partition(哈希分区)
**重要**：此操作会通过网络重新整理整个DataSet。可能会花费大量时间。
```scala
.partitionByHash(_.dataUnix)
```
### 4.26 Range-Partition（范围分区）
**重要**：此操作需要在DataSet上额外传递一次以计算范围，通过网络对整个DataSet进行边界划分和改组。这会花费大量时间。
```scala
.partitionByRange(_.dataUnix)
```
### 4.27 Sort Partition（分区排序）
以指定顺序对指定字段上的DataSet的所有分区进行**本地排序**。可以将字段指定为字段表达式或字段位置。  
可以通过链接sortPartition()调用在多个字段上对分区进行排序。
```scala
  roleLoginDs
    .sortPartition(_.dataUnix, Order.ASCENDING)
    .sortPartition(_.uid, Order.DESCENDING)
    .mapPartition((values: lang.Iterable[RolePay], out: Collector[(String, Int, Double)]) => {
      values.iterator().asScala.foreach(o => out.collect(o.rid, o.dataUnix, o.money))
    })
    .print()
```
### 4.28 First-n（前n个（任意）元素）
返回数据集的前n个（任意）元素。First-n可以应用于常规数据集，分组的数据集或分组排序的数据集。可以将分组键指定为键选择器功能或字段位置键。
```scala
val in: DataSet[(String, Int)] = // [...]
// Return the first five (arbitrary) elements of the DataSet
val out1 = in.first(5)

// Return the first two (arbitrary) elements of each String group
val out2 = in.groupBy(0).first(2)

// Return the first three elements of each String group ordered by the Integer field
val out3 = in.groupBy(0).sortGroup(1, Order.ASCENDING).first(3)
```