import path from 'path'
import type { Configuration } from 'webpack'
import { merge } from 'lodash'
import webpackConfig from '@opendreamnet/build/webpack.config'

const config: Configuration = merge(webpackConfig, {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.umd.js'
  }
} as Configuration)

export default config