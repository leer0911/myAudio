## webpack 使用

> 本项目是用 `webpack` 结合 `npm` 命令行，来实现打包 。( 非 webpack 命令行 )

`package.json` 里面 `script` 属性里配置了两个命令，`build` 和 `dev`

下面分三部分讲解本项目中 `webpack` 的使用

* [base-config](#base-config)
* [dev](#dev)
* [build](#build)

### [base-config](../build/base-config.js)

此文件为 webpack 基础配置，包括入口文件，打包输出目录，常用 loader。

```javascript
function resolve(dir) {
  return path.join(__dirname, '..', dir);
}
```

`resolve`函数用于将文件准确定位以及解决不同系统路径不同的问题。由于配置文件是在 build 目录下，所以此时 `__dirname` 为 build 目录地址，使用 `path.join`，带参数`'..'`后可获得根目录路径。详细资料，可以了解 node 对应 [path 模块](http://nodejs.cn/api/path.html)

### [build](../build/build.js)

主要用到[CleanWebpackPlugin](https://github.com/johnagan/clean-webpack-plugin)和[UglifyjsWebpackPlugin](https://github.com/webpack-contrib/uglifyjs-webpack-plugin)插件。

**在使用`CleanWebpackPlugin`时需要注意路径问题。**

```javascript
// 该部分主要实现构建
webpack(webpackConfig, function(err, stats) {
  process.stdout.write(
    stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n'
  );
});
```

`process.stdout`相关配置可以参阅[process](http://nodejs.cn/api/process.html)

### [dev](../build/dev.js)

开发环境部分主要用到了 [express](http://expressjs.jser.us/4x_zh-cn/api.html) ，[webpackDevMiddleware](https://github.com/webpack/webpack-dev-middleware) ，[HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin),[webpackHotMiddleware](https://github.com/glenjamin/webpack-hot-middleware#readme)

要注意的是如果需要自定义模板需要配置 `HtmlWebpackPlugin`

```javascript
new HtmlWebpackPlugin({
  filename: 'index.html',
  template: 'index.html',
  inject: true
});
```

可以使用 `opn` 模块 来自动打开浏览器

```javascript
app.listen(3000, function() {
  console.log('Example app listening on port 3000:\n');
  opn('http://localhost:3000');
});
```

#### 热更新相关

[webpackDevMiddleware](https://github.com/webpack/webpack-dev-middleware)
[webpackHotMiddleware](https://github.com/glenjamin/webpack-hot-middleware#readme)

* 首先在中配置相关的插件 [dev](../build/dev.js)

```javascript
plugins: [
  new webpack.NamedModulesPlugin(), // 当开启 HMR 的时候使用该插件会显示模块的相对路径，建议用于开发环境。
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: 'index.html',
    inject: true
  }),
  new FriendlyErrorsPlugin()
];
```

* 处理入口 [dev](../build/dev.js)

```javascript
// 需要在入口配置 'webpack-hot-middleware/client' 参考 https://github.com/glenjamin/webpack-hot-middleware
Object.keys(baseWebpackConfig.entry).forEach(function(name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(
    baseWebpackConfig.entry[name]
  );
});
```

* 在 server 启动时挂载 [dev](../build/server.js)

```javascript
const compiler = webpack(config);
const HMR = webpackHotMiddleware(compiler);

app.use(webpackDevMiddleware(compiler));

app.use(HMR);

// 让模板也能热更新，比如修改根目录中的index.html
compiler.plugin('compilation', function(compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function(data, cb) {
    HMR.publish({ action: 'reload' });
    cb();
  });
});
```

项目正常运行后，在 `chrome` 中 `network` 有 `__webpack_hmr` (可修改名称) 说明成功了!

### 其他

* Es6 使用

`babel-loader`

* sass 使用

`style-loader` , `sass-loader` , `css-loader`

记得要安装 `node-sass`

[autoprefixer 的配置](./autoprefixer.md)

* 错误友好提示

```javascript
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
```

