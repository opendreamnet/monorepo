import path from 'path'
import { merge } from 'lodash'
import { Configuration, ProvidePlugin } from 'webpack'
import webpackConfig from '@opendreamnet/build/webpack.config'

const config: Configuration = merge(webpackConfig, {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.umd.js'
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
    new ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer']
    })
  ]
} as Configuration)

export default config