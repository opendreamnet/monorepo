const path = require('path')
const { merge } = require('lodash')
const config = require('../../webpack.config')

module.exports = merge(config, {
  entry: './src/index.ts',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.umd.js'
  }
})