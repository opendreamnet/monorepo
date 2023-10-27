require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  parserOptions: {
    ecmaVersion: 'latest'
  },
  env: {
    node: true
  },
  globals: {
    document: 'readonly',
    navigator: 'readonly'
  },
  plugins: [
    'import',
    'promise',
    'lodash'
  ],
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'plugin:lodash/recommended'
  ],
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'linebreak-style': 'error',
    'no-await-in-loop': 'warn',
    'no-continue': 'off',
    'no-trailing-spaces': 'warn',
    'no-tabs': 'error',
    'prefer-arrow-callback': 'error',
    'object-shorthand': ['error'],
    'padded-blocks': ['error', 'never'],
    'prefer-spread': 'error',
    'quote-props': ['error', 'consistent'],
    'spaced-comment': 'error',
    'object-curly-spacing': ['error', 'always'],

    'import/order': ['warn', ['type', 'builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object']],
    'import/first': 'error',
    'import/no-mutable-exports': 'error',

    'lodash/prefer-constant': 'off',
    'lodash/prefer-includes': 'warn',
    'lodash/prefer-lodash-method': 'off',
    'lodash/prefer-noop': 'off'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.mts', '*.cts'],
      parser: '@typescript-eslint/parser',
      plugins: [
        '@typescript-eslint'
      ],
      extends: [
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        '@typescript-eslint/quotes': ['error', 'single'],
        '@typescript-eslint/semi': ['error', 'never'],
        '@typescript-eslint/explicit-member-accessibility': ['error', 'explicit'],
        '@typescript-eslint/space-before-function-paren': ['error', 'never'],
        '@typescript-eslint/no-explicit-any': ['warn'],

        quotes: ['off'],
        semi: ['off'],
        'space-before-function-paren': ['off']
      }
    }
  ]
}