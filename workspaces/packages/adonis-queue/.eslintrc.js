module.exports = {
  root: true,
  env: {
    browser: false
  },
  globals: {
    'use': false,
    'route': false
  },
  extends: [
    'eslint-config-airbnb-base',
    '@dreamnet/eslint-config-dreamnet-javascript'
  ],
  plugins: [
    'adonis'
  ]
}
