> 专栏原创出处：[github-源笔记文件 ](https://github.com/GourdErwa/review-notes/tree/master/language/java-puzzle) ，欢迎 Star，转载请附上原文出处链接和本声明。

[toc]
## 生成一个新的 SSH Key
```shell script
$ ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# 执行命令生成 ssh-key，需要指定相应的邮箱

> Enter a file in which to save the key (/Users/you/.ssh/id_rsa): [如果不更改文件名直接回车 ]
# 推荐不使用默认文件名 id_rsa ，按实际场景重新命名文件名称，比如：/Users/you/.ssh/id_rsa_github_my

> Enter passphrase (empty for no passphrase): [输入密码，回车 ]
> Enter same passphrase again: [再次输入密码，回车 ]

$ ll /Users/you/.ssh
# 可以看到刚刚生成的 ssh-key id_rsa_github_my 文件
# 复制对应 id_rsa_github_my.pub 内容添加至 WEB 端配置 SSH 内容地方即可。
```

## 将 SSH Key 添加到不同的代理
```shell script
$ vim /Users/you/.ssh/config

# 配置文件参数
# Host : Host 可以看作是一个你要识别的模式，对识别的模式，进行配置对应的的主机名和 ssh 文件（可以直接填写 ip 地址）
# HostName : 要登录主机的主机名（建议与 Host 一致）
# User : 登录名（如 gitlab 的 username）
# IdentityFile : 指明上面 User 对应的 identityFile 路径
# Port: 端口号（如果不是默认 22 号端口则需要指定）

Host github.com
HostName github.com
Preferredauthentications publickey
IdentityFile ~/.ssh/id_rsa_github_my
Port 22

Host dev-git.gaolvzongheng.com
HostName dev-git.gaolvzongheng.com
Preferredauthentications publickey
IdentityFile ~/.ssh/id_rsa_github_gaolvgo
Port 22

Host 119.3.177.8
HostName 119.3.177.8
Preferredauthentications publickey
IdentityFile ~/.ssh/id_rsa_github_gaolvgo
Port 22
```

## 测试配置是否成功
```shell script
$ .ssh ssh -T git@github.com
Enter passphrase for key '/Users/liwei/.ssh/id_rsa_github_my':
Hi GourdErwa! You've successfully authenticated, but GitHub does not provide shell access.
```

## 参考
- [github-Generating a new SSH key and adding it to the ssh-agent](https://help.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)