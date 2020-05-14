const path = require('path')

module.exports = {
  entry: './src/index.ts',
  devtool: 'source-map',
  mode: process.env.NODE_ENV,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'dreamapp.min.js',
    library: 'dreamapp',
    libraryTarget: 'umd',
    globalObject: '(typeof self !== \'undefined\' ? self : this)',
  },
  node: {
    process: false,
  },
  externals: {
    os: 'os',
    path: 'path',
    fs: 'fs',
    'platform-folders': 'platform-folders',
    electron: 'electron',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    // Disable handling of requires with a single expression.
    exprContextCritical: false,
    rules: [{
      // Include ts, tsx, js, and jsx files.
      test: /\.(ts|js)x?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        rootMode: 'upward',
      },
    }],
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
  },
  performance: {
    // Don't throw warning when asset created is over 250kb
    hints: false,
  },
}
