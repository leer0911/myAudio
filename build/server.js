const opn = require('opn');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const app = express();
const config = require('./dev');
const port = '3003';

// 热更新 Start----------------------------------------------------------------------
const compiler = webpack(config);
const HMR = webpackHotMiddleware(compiler, {
  log: false // https://github.com/geowarin/friendly-errors-webpack-plugin
});

app.use(
  webpackDevMiddleware(compiler, {
    quiet: true // https://github.com/geowarin/friendly-errors-webpack-plugin
  })
);

app.use(HMR);

// 让模板也能热更新，比如修改根目录中的index.html
compiler.plugin('compilation', function(compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function(data, cb) {
    HMR.publish({ action: 'reload' });
    cb();
  });
});
// 热更新 END----------------------------------------------------------------------

// 静态资源
app.use('/static', express.static('./static'));

app.listen(port, function() {
  console.log('Example app listening on port' + port);
  opn('http://localhost:' + port);
});
