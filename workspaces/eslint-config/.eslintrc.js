// const config = require('./dist/index.js')
module.exports = {
  extends: [
    './dist/index.js',
  ],

  rules: {
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-unsafe-argument': ['off'],
  },
}
