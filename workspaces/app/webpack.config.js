const path = require('path')
const config = require('../../webpack.config')

module.exports = {
  ...config,

  entry: './src/index.ts',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.umd.js',
    library: {
      type: 'umd',
      name: 'dreamnet'
    }
  }
}