# grunt-cmd-combo

用来打包 [SeaJS] 模块的 [grunt] 任务。

## 特点

grunt-cmd-combo 打包后的文件可以脱离 SeaJS 直接执行。

grunt-cmd-combo 的模块化标准是 SeaJS 的一个子集，规则非常简单：

* 所有的 `define` 定义只包含一个参数，即 `factory` 函数：
* `factory` 函数只接受 `require` 函数以及 `exports` 对象，不接受 `module` 对象
* `require` 只支持相对路径 `require`

例子：

```
/* math.js */
define(function (require) {
    return {
        plus: function (a, b) {
            return a + b;
        }
    };
});

/* main.js */
define(function (require) {
    require('./math').plus(1, 2); // 3
});
```

## 原理

以上面给的例子 `math.js` 以及 `main.js` 为例，在对 `main.js` 打包时的流程如下：

1. 分析入口模块 `main.js`，建立主模块的依赖数组 `dpes`
1. 将所有的 require 参数由相对于当前文件的路径转为相对于源码根目录的路径：`require('./math')` 会被转换为 `require('math')`
1. 分析所有依赖的模块，将依赖的模块名加入 `deps`
1. 对所有依赖的模块，递归地进行 2-4 步
1. 将 `deps` 中所有的模块中的代码按顺序合并成一个文件
1. 将 `loader.js` 的内容加到最终输出文件的开头（提供无 SeaJS 环境下的 `define` 函数支持）
1. 将 `main.js` 的内容加到最终输出文件的结尾

### loader.js

`loader.js` 提供了最简单的一个 `define` 函数实现，以使得代码在打包后可以脱离 SeaJS 执行。

## 使用

grunt-cmd-combo 是一个 MultiTask，支持 3 个参数：

`src` 源码目录。所有的模块都应该放在这个目录下，必须以 `/` 结尾。

`dest` 目标目录。打包后的文件会输出到这个目录下，并且保持 `src` 目录中的目录结构，必须以 `/` 结尾。

`initModules` 入口模块。文件路径应该相对于 `src` 目录，支持文件通配符指定多个入口模块，会分别打包输出成多个文件。

参考例子：

```
grunt.initConfig({
    combo: {
        build: {
            src: 'src/', // 源码目录
            dest: 'dist/', // 目标目录
            initModules: 'main.js' // 入口模块，支持文件通配符
        }
    }
});
```

会将 `src/main.js` 打包输出到 `dist/main.js`。

打包后的代码只需要一个 `<script>` 标签来载入，不需要 SeaJS 支持：

```
    <script src="/dist/main.js" data-main="main" type="text/javascript"></script>
```

## 优点

* 简单，只支持 SeaJS 模块化规范中最精简的一个子集
* 可靠，经历过[网易微博]、[有道云笔记]等多个项目近 2 年的实际应用检验，从来没出过问题

## Push Request

欢迎提交 Push Request，提交前请先通过 `grunt test` 保证代码通过单元测试和 jslint 检查。

## 发布历史

`0.1.0` 2012-12-10 首次发布。

## License
Copyright (c) 2012 PerfectWorks  
Licensed under the MIT license.

[SeaJS]: http://seajs.org
[grunt]: http://gruntjs.com
