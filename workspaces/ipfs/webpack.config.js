const { merge } = require('lodash')
const path = require('path')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
const config = require('../../webpack.config.js')

module.exports = merge(config, {
  entry: './src/index.ts',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ipfs.umd.js'
  },

  resolve: {
    alias: {
      os: require.resolve('os-browserify')
    },

    fallback: {
      path: require.resolve('path-browserify'),
      assert: require.resolve('assert/'),
      stream: require.resolve('stream-browserify'),
      constants: require.resolve('constants-browserify'),
      vm: require.resolve('vm-browserify'),
      crypto: require.resolve('crypto-browserify'),
    }
  },

  plugins: [
    //new BundleAnalyzerPlugin.BundleAnalyzerPlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]
})