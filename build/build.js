process.env.NODE_ENV = 'production';
require('dotenv').config();
const webpack = require('webpack');
const webpackConfig = require('./webpack.prod.conf');
const config = require('../config');

webpack(webpackConfig, function (err, stats) {
  if (err) throw err;
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n\n')
});
