/* eslint-disable */

module.exports = {
  // Chosen mode tells webpack to use its built-in optimizations accordingly.
  mode: process.env.NODE_ENV || 'development',
  
  // enhance debugging by adding meta info for the browser devtools
  devtool: 'source-map',

  // Don't follow/bundle these modules, but request them at runtime from the environment
  externals: ['electron'],

  output: {
    library: {
      type: 'umd',
      name: 'odn'
    }
  },

  resolve: {
    // extensions that are used
    extensions: ['.ts', '.tsx', '.js', '.json'],

    alias: {
      'platform-folders': false,
    }
  },

  module: {
    rules: [
      {
        // Include ts and tsx
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              rootMode: 'upward'
            }
          },
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                target: 'esnext',
                module: 'esnext',
                declaration: false,
                composite: false
              }
            }
          }
        ]
      },
      {
        // Include js and jsx
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              rootMode: 'upward'
            }
          }
        ]
      }
    ]
  },

  optimization: {
    // rename export names to shorter names
    minimize: process.env.NODE_ENV === 'production'
  },

  plugins: []
}