## Webpack3+postcss+sass+css 自动添加前缀配置

配置用到了 webpack、style-loader、css-loader、postcss-loader、sass-loader、autoprefixer 模块

### 配置 webpack.config.js

```javascript
module: {
  rules: [
    { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    {
      test: /\.scss$/,
      use: [
        { loader: 'style-loader' },
        {
          loader: 'css-loader', // https://doc.webpack-china.org/loaders/css-loader/
          options: {
            sourceMap: true,
            modules: true,
            localIdentName: '[local]_[hash:base64:5]'
          }
        },
        {
          loader: 'postcss-loader', // https://doc.webpack-china.org/loaders/postcss-loader/#src/components/Sidebar/Sidebar.jsx
          options: {
            sourceMap: true,
            config: {
              path: 'postcss.config.js' // 这个得在项目根目录创建此文件
            }
          }
        },
        {
          loader: 'sass-loader',
          options: { sourceMap: true }
        }
      ]
    }
  ];
}
```

### 在项目根目录创建 postcss.config.js

```javascript
module.exports = {
  plugins: [require('autoprefixer')]
};
```

### package.json 文件里添加支持哪些浏览器。

```javascript
 "browserslist": [
    "defaults",
    "not ie < 11",
    "last 2 versions",
    "> 1%",
    "iOS 7",
    "last 3 iOS versions"
  ]
```

### Browserslist

[gitHub](https://github.com/ai/browserslist)
[caniuse](http://caniuse.com/)
[在线配置](http://browserl.ist/?q=defaults)
[browserslist-useragent](https://github.com/pastelsky/browserslist-useragent)
[caniuse-api](https://github.com/Nyalab/caniuse-api)

可以在`package.json`中添加

```javascript
{
  "browserslist": [
    "> 1%",
    "last 2 versions"
  ]
}
```

也可以在 `.browserslistrc` 配置文件中添加

```
# Browsers that we support

> 1%
Last 2 versions
IE 10 # sorry
```

#### 相关配置

## 参数

你可以通过参数来指定浏览器版本

* `last 2 versions`: 所有浏览器的最后两个版本
* `last 2 Chrome versions`: Chrome 的最后两个版本
* `> 5%`: 用户量大于 5%
  `>=`, `<` and `<=` work too.
* `> 5% in US`: 在美国用户量大于 5% [可以使用缩写]
* `> 5% in alt-AS`: 亚洲地区的用户量大于 5%
  can be found at [`caniuse-lite/data/regions`].
* `> 5% in my stats`: uses [custom usage data].
* `extends browserslist-config-mycompany`: take queries from
  `browserslist-config-mycompany` npm package.
* `ie 6-8`: 版本区间
* `Firefox > 20`: Firefox 版本大于 20
  `>=`, `<` and `<=` work too.
* `iOS 7`: 只针对ios 7
* `Firefox ESR`: the latest [Firefox ESR] version.
* `unreleased versions` or `unreleased Chrome versions`:
  alpha and beta versions.
* `last 2 major versions` or `last 2 iOS major versions`:
  all minor/patch releases of last 2 major versions.
* `since 2015` or `last 2 years`: all versions released since year 2015
  (also `since 2015-03` and `since 2015-03-10`).
* `dead`: browsers from `last 2 version` query, but with less than 0.5%
  in global usage statistics and without official support or updates
  for 24 months. Right now it is `IE 10`, `IE_Mob 10`, `BlackBerry 10`,
  and `BlackBerry 7`.
* `defaults`: Browserslist’s default browsers
  (`> 0.5%, last 2 versions, Firefox ESR, not dead`).
* `not ie <= 8`: exclude browsers selected by previous queries.

You can add `not` to any query.

### Browsers

Names are case insensitive:

* `Android` for Android WebView.
* `Baidu` for Baidu Browser.
* `BlackBerry` or `bb` for Blackberry browser.
* `Chrome` for Google Chrome.
* `ChromeAndroid` or `and_chr` for Chrome for Android
* `Edge` for Microsoft Edge.
* `Electron` for Electron framework. It will be converted to Chrome version.
* `Explorer` or `ie` for Internet Explorer.
* `ExplorerMobile` or `ie_mob` for Internet Explorer Mobile.
* `Firefox` or `ff` for Mozilla Firefox.
* `FirefoxAndroid` or `and_ff` for Firefox for Android.
* `iOS` or `ios_saf` for iOS Safari.
* `Opera` for Opera.
* `OperaMini` or `op_mini` for Opera Mini.
* `OperaMobile` or `op_mob` for Opera Mobile.
* `QQAndroid` or `and_qq` for QQ Browser for Android.
* `Safari` for desktop Safari.
* `Samsung` for Samsung Internet.
* `UCAndroid` or `and_uc` for UC Browser for Android.
