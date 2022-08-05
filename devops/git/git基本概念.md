
## 工作区、版本库、暂存区

### 工作区（Working Directory）
你在电脑里能看到的目录，比如我的 `/Users/li/general-example` 文件夹就是一个工作区.
```shell script
➜  general-example git:(feature/spring) ✗ ll -la
.
..
.git
.gitignore
.idea
README.md
spring.md
```
### 版本库（Repository）
工作区有一个隐藏目录`.git`，这个不算工作区，而是 Git 的版本库。
```shell script
➜  general-example git:(feature/spring) ✗  ll -la .git
.
..
COMMIT_EDITMSG
FETCH_HEAD
HEAD
ORIG_HEAD
config
description
hooks
index
info
logs
objects
refs
```

### 暂存区
Git 的版本库 (`.git` 目录) 里存了很多东西，我们把版本库中的 `.git/index` 目录称为缓存区（也叫作索引）

为什么要设计暂存区？以下看起来比较束手无策的场景，只要理解暂存区，用好相应命令，都能轻易解决：
- 修改了 4 个文件，在不放弃任何修改的情况下，其中一个文件不想提交，如何操作？（没 add : git add 。已经 add: git reset --soft ）
- 修改到一半的文件，突然间不需要或者放弃修改了，怎么恢复未修改前文件？ (git checkout)
- 代码写一半，被打断去做其他功能开发，未完成代码保存？(git stash)
- 代码写一半，发现忘记切换分支了？(git stash & git checkout)
- 代码需要回滚了？（git reset）
- 等等

## HEAD
我们进入版本库 `.git` 目录，发现 HEAD 文件指向如下 `HEAD->refs/heads/feature/spring->c063b04d21c690c251fba9ba0f4b653be0b71597`
```shell script
$ll -la
COMMIT_EDITMSG
FETCH_HEAD
HEAD
ORIG_HEAD
config
description
hooks
index
info
logs
objects
refs

$cat HEAD
ref: refs/heads/feature/spring

$cat refs/heads/feature/spring
c063b04d21c690c251fba9ba0f4b653be0b71597
```

因为 `refs/heads/` 文件夹存储的内容是当前项目所有分支的头指针，每个分支的头指针都指向该分支的最新提交。为了保证多分支指向同一提交 ID 下， HEAD 还能正确指向，所以通过`refs/heads/`分支头指针指向而不是指向指向提交 ID。

### detached HEAD（游离的 HEAD 指针）
使用 `git checkout <commit id>` 或者 `git checkout --detach` 进入了 detached HEAD 状态。
在这个状态下，如果创建了新提交，新提交不属于任何分支。相对应的，现存的所有分支也不会受 detached HEAD 状态提交的影响。

> 例如:排查问题的时候，checkout 到怀疑的 commit 点上去做些测试，detached HEAD 会保护你的现有分支不受影响，测试完了不想保存直接 checkout 到其他地方，可以放弃修改。想保存修改，可以创建一个 git checkout -b <new-branch-name> 新分支保存。

### HEAD 指针总结
版本库 `.git` 目录下一共会出现以下五种 HEAD 类型指针。

- HEAD
指向当前正在操作的 commit。

- ORIG_HEAD
当使用一些在 Git 看来比较危险的操作去移动 HEAD 指针的时候，ORIG_HEAD 就会被创建出来，记录危险操作之前的 HEAD，方便 HEAD 的恢复，有点像修改前的备份。

- FETCH_HEAD
记录从远程仓库拉取的记录。

- MERGE_HEAD
当运行 git merge 时，MERGE_HEAD 记录你正在合并到你的分支中的提交。MERGE_HEAD 在合并的时候会出现，合并结束，就删除了这个文件。

- CHERRY_PICK_HEAD
记录您在运行运行 git cherry-pick 时要合并的提交。同上，这个文件只在 cherry-pick 期间存在。

我们要清楚的知道，在这么多 xxx_HEAD 中，HEAD 指向的永远都是当前提交。而且 Git 的很多命令,在不给参数的情况下，默认操作都是 HEAD 指针。例如最前面我说的 git show 和另外一个很强大的命令 git reflog。