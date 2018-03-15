const path = require('path');
const webpack = require('webpack');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}
module.exports = {
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: 'myaudio.js',
    path: resolve('dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src')]
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        include: [resolve('src')],
        loader: 'eslint-loader',
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: [resolve('src')]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          // {
          //   loader: 'css-loader',
          //   options: {
          //     sourceMap: true,
          //     modules: true,
          //     localIdentName: '[local]_[hash:base64:5]'
          //   }
          // },
          {
            loader: 'postcss-loader',
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
        ],
        include: [resolve('src')]
      }
    ]
  }
};
