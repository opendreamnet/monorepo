import * as webpack from 'webpack'

const config: webpack.Configuration = {
  // enhance debugging by adding meta info for the browser devtools
  devtool: 'source-map',

  // UMD
  output: {
    library: {
      type: 'umd',
      name: 'odn'
    }
  },

  resolve: {
    // extensions that are used
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      // Typescript
      // babel-loader & ts-loader
      {
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
      // Javascript
      // babel-loader
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
}

export default config