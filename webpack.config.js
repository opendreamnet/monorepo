const path = require('path')

module.exports = {
  // Chosen mode tells webpack to use its built-in optimizations accordingly.
  mode: process.env.NODE_ENV || 'development',
  
  // enhance debugging by adding meta info for the browser devtools
  devtool: 'source-map',

  // Don't follow/bundle these modules, but request them at runtime from the environment
  externals: ['os', 'path', 'fs', 'platform-folders', 'electron'],

  resolve: {
    // extensions that are used
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      {
        // Include ts and tsx
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },

  optimization: {
    // rename export names to shorter names
    minimize: process.env.NODE_ENV === 'production'
  }
}