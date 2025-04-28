# 添加子模块仓库

## 新建主仓库

在 github 上建立一个仓库作为主仓库，然后将主仓库克隆到本地 （git clone <主仓库 ssh 或者 https 地址>）

如本项目主仓库:

```
git clone  git@github.com:harryzgh/project-templates.git
```

## 添加子模块仓库

将 github 中已经存在的仓库作为子模块仓库加入到主仓库中： git submodule add <子模块仓库的 ssh 或者 https 地址> <子模块在主仓库目录下的本地路径>

如本项目主中添加 next-pages 子模块仓库:

```
// react/next-pages路径，最终会在主仓库目录project-templates下新建react目录，
// 然后再将远端git@github.com:harryzgh/temp-next-pages.git仓库拷贝到next-pages目录下

git submodule add git@github.com:harryzgh/temp-next-pages.git react/next-pages
```

比较重要的：

- git submodule add 后面必须跟子仓库模块的远端 git 仓库地址， 而不是本地文件的地址（幻想可以在本地主仓库下新建项目文件，然后再通过 git submodule add 的方式上传到远端主仓库下， 这是不可行的)
- 如果想要将本地的项目添加到远端主仓库的目录下作为子模块仓库，那要先在远端建立一个仓库，再将本地项目上传到远端新建的仓库中。然后再通过 git submodule add 的方式将这个远端仓库添加成为主仓库的子仓库
- git submodule add 命令是在主仓库目录的根路径下进行操作的，即 ~/project-templates 路径下。

## 添加后提交更新

添加子模块后，主仓库的 `.gitmodules` 文件和子模块的引用会被更新。你需要提交这些更改：

```
git add .gitmodules path/to/submodule
git commit -m "Add submodule"
git push
```

## 更新子模块

如果你需要更新子模块到最新版本，可以进入子模块目录并拉取最新更改。

1、**进入子模块目录** ：cd project-templates/react/next-pages

2、**拉取最新更改：**git pull origin main

3、**返回主仓库并提交更改** ：

```
cd ..
cd ..
git add project-templates/react/next-pages
git commit -m "Update submodule"
git push
```

## 删除子模块

1. **删除子模块目录** ： rm -rf project-templates/react/next-pages
2. **从 `.gitmodules` 文件中删除子模块配置** ：git rm --cached project-templates/react/next-pages
3. **提交更改** ：

```bash
   git commit -m "Remove submodule"
   git push
```

## 克隆包含子模块的仓库

**1、克隆主仓库** ：

```bash
git clone <主仓库的URL>
cd <主仓库的目录>
```

2、**初始化子模块** ：git submodule init

3、**更新子模块** ：git submodule update

**2 和 3 你也可以使用以下命令一次性完成初始化和更新：** git submodule update --init --recursive
