## GIST 简单的命令行"片段"管理器

背景:

日常开发中, 使用一些常用的信息(比如测试账号, 常用命令等), 使用时会打开聊天软件或者笔记软件查找, 比较麻烦, 因此开发了命令行片段管理器, 用于快速获取这些信息.

如何实现:

用户通过命令`gist set 片段简称 片段内容`时将数据存在本地json文件中

用户通过命令`gist get 片段简称`时从json文件中取出数据, 并拷贝到系统剪贴板中方便使用

<p>
<img src="https://raw.githubusercontent.com/leonmin/static/master/images/display_gist.gif" />
</p>

## 如何使用

### 1. 安装

```bash
$ npm install -g @leonmin/gist
```

### 2. 使用

```bash
$ gist get your_key # 获取gist并拷贝到系统粘贴板
$ gist set your_key your_gist # 设置gist
$ gist last # 获取最近设置的gist
$ gist list # 获取gist列表
$ gist del your_key # 删除gist
$ gist clear # 清除所有gist
```