# vimium 快捷键列表
一个使用快捷键来操作浏览器页面的插件。

## 浏览当前页面
```
?       显示所有可用键列表的帮助对话框
h       向左滚动
j       向下滚动
k       向上滑动
l       向右滚动
gg      滚动到页面顶部
G       滚动到页面的底部
d       向下滚动半页
u       向上滚动半页
f       在当前标签中打开一个链接
F       在新标签中打开链接
r       重新载入
gs      查看源代码
i       进入插入模式 - 所有的命令将被忽略，直到你按 Esc 退出
yy      将当前的网址复制到剪贴板
yf      将链接网址复制到剪贴板
gf      定位焦点到下一级框架
gF      定位焦点到顶部框架
```
## 导航到新页面
```
o       打开网址，书签或历史记录条目
O       在新标签中打开网址，书签，历史记录
b       打开书签
B       在新标签中打开书签
```
## 使用查找
```
/       进入查找模式。 键入您的搜索查询，然后按 Enter 键搜索，或按 Esc 键取消
n       循环前进到下一个匹配
N       向后循环到先前的匹配
有关高级用法，请参阅 [wiki](https://github.com/philc/vimium/wiki) 上的正则表达式。
```

## 浏览你的历史
```
H       上一个历史 (后退)
L       下一个历史 (前进)
```
## 操作标签
```
J, gT   跳到左边选项卡
K, gt   跳到右边选项卡
g0      跳到第一个选项卡
g$      跳到最后一个选项卡
^       访问先前访问的选项卡
t       创建选项卡
yt      重复当前选项卡
x       关闭当前选项卡
X       恢复 x 命令关闭的选项卡
T       搜索你打开的选项卡
W       将当前选项卡移至新窗口
<a-p>   固定/取消当前选项卡 (alt+p)
```
## 使用标记
```
ma, mA  设置当地标记"a"（全球标记"A"）
`a, `A  跳转到本地标记"a"（全局标记"A"）
``      跳回到前一跳之前的位置。 也就是在之前的 gg，g，n，N，或者 a 之前
```
## 其他高级浏览命令
```
]], [[  下一页,上一页 (可配置翻页标记)
<a-f>   在新标签页中打开某链接
gi      聚焦到输入框
gu      进入地址栏 URL 中的上一级
gU      进入地址栏 URL 中的最顶级
ge      编辑当前的 URL
gE      编辑当前 URL 并在新标签中打开
zH      向左滚动
zL      一路向右滚动
v       进入视觉模式; 使用 p/P 搜索，使用 y 复制
V       进入视线模式
```

## 说明
Vimium 支持命令重复。
```
例如，点击 5t 将快速连续打开 5 个选项卡。 <Esc>（或 <c - [>））将清除队列中的任何部分命令，也将退出插入和查找模式。
```
有一些先进的命令，这里没有记录; 请参阅帮助对话框（输入"?"）获取完整列表。

## 参考
- [vimium/wiki](https://github.com/philc/vimium/wiki)
- [github-vimium](https://github.com/philc/vimium)
- [chrome-扩展程序 ](https://chrome.google.com/extensions/detail/dbepggeogbaibhgnhhndojpepiihcmeb)

<div align="center">
    <img src="https://blog-review-notes.oss-cn-beijing.aliyuncs.com/gourderwa.footer.jpeg">
</div>