const path = require('path')
const config = require('../../webpack.config')

module.exports = {
  ...config,

  entry: './src/queue.ts',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'queue.umd.js',
    library: {
      type: 'umd',
      name: 'queue'
    }
  }
}