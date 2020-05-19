module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: 'last 2 major versions',
          node: '10',
        },
      },
    ],
  ],
  plugins: [
    'lodash',
  ],
}
