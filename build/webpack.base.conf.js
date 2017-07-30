const path = require('path');
const webpack = require('webpack');
const eslintFriendlyFormatter = require('eslint-friendly-formatter');

const utils = require('./utils')
const config = require('../config');
const vueLoaderConfig = require('./vue-loader.conf');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

module.exports = {
  entry: {
    app: './app/main.js'
  },
  output: {
    path: path.resolve(__dirname, '../api/public'),
    filename: '[name].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      "vue$": "vue/dist/vue.common.js",
      '@': resolve('app')
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('app')],
        options: {
          formatter: eslintFriendlyFormatter
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('app')]
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
      'process.env.APP_NAME': `'${process.env.APP_NAME}'`
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ]
};
