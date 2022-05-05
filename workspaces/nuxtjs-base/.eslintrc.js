module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@opendreamnet/eslint-config-nuxtjs'
  ],
  plugins: [
  ],
  rules: {
    'vue/no-v-html': 'off'
  }
}
