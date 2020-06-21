module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    '@dreamnet/eslint-config-dreamnet-javascript'
  ],
  rules: {
    '@typescript-eslint/quotes': ['error', 'single'],
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-ignore': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
    '@typescript-eslint/camelcase': ['warn', {
      properties: 'never',
    }],
    quotes: 'off',
    semi: 'off',
  },
  settings: {
    'import/extensions': [
      '.js',
      '.jsx',
      '.ts'
    ]
  }
}
