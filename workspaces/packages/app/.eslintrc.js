module.exports = {
  extends: [
    '@dreamnet/eslint-config-dreamnet'
  ],
  rules: {
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-restricted-globals': 'off',
    'import/order': 'off'
  }
}
