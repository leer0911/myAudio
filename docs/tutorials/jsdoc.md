## JSDOC

`Jsdoc` 主要用来生成文档，在 js 文件中使用 `jsdoc` 版的注释便可以用于生成文档。

[官方文档/英文](http://usejsdoc.org/)
[中文参考](http://www.css88.com/doc/jsdoc/index.html)
[github](https://github.com/jsdoc3/jsdoc)

jsdoc 文档模板推荐使用

[docstrap](https://github.com/docstrap/docstrap)

### 配置

首先全局安装 jsdoc

```bash
npm install -g jsdoc
```

在根目录新建 `jsdoc.json` 用于配置生成规则，如下

```json
{
  "source": {
    // 需要生成文档的对应 js 路径
    "include": ["src/"],
    "includePattern": ".js$"
  },
  "opts": {
    "destination": "docs/", // 文档生成目录
    "readme": "docs/index.md", // 文档首页展示内容
    "template": "node_modules/ink-docstrap/template/", // 文档模板
    "package": "package.json",
    "recurse": true,
    "tutorials": "docs/tutorials", // 生成教程内容
    "encoding": "utf8"
  },
  "templates": {
    // 模板配置，此处跟模板设置有关。
    "cleverLinks": true,
    "monospaceLinks": true,
    "dateFormat": "ddd MMM Do YYYY",
    "outputSourceFiles": true,
    "outputSourcePath": true,
    "systemName": "DocMyAudio",
    "navType": "vertical",
    "theme": "cosmo",
    "linenums": true,
    "collapseSymbols": false,
    "inverseNav": true,
    "sort": true
  },
  "plugins": ["plugins/markdown"],
  "markdown": {
    "tags": ["example"],
    "idInHeadings": true
  }
}
```

完成后，可在 package 下新建 `script` 命令

```json
{
  "scripts": {
    "doc": "jsdoc -c .jsdoc.json"
  }
}
```

之后生成文档可运行

```bash
npm run doc
```
