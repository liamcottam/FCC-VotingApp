const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.conf');

const utils = require('./utils');
const config = require('../config');

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach((name) => {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name]);
});

module.exports = merge(baseWebpackConfig, {
  devtool: '#cheap-module-eval-source-map',
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  plugins: [
    /* new webpack.DefinePlugin({
      'process.env': config.dev.env
    }), */
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'app/index.html',
      inject: true,
    }),
    new FriendlyErrorsPlugin(),
  ],
});
