module.exports = {
  sourceType: 'unambiguous',
  presets: [
    '@babel/typescript',
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
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
  ],
}
