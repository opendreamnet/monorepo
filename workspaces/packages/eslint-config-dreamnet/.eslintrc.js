/* eslint-disable */

const path = require('path')

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    mocha: true,
    browser: true,
    node: true
  },
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:promise/recommended',
    'plugin:lodash/recommended',
    'plugin:mocha/recommended'
  ],
  plugins: [
    '@typescript-eslint',
    'import',
    'promise',
    'lodash',
    'mocha'
  ],
  rules: {
    '@typescript-eslint/quotes': ['error', 'single'],
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-ignore': 'warn',
    '@typescript-eslint/camelcase': ['warn', {
      properties: 'never'
    }],
    'mocha/prefer-arrow-callback': 'error',
    'import/named': 'error',
    'import/no-cycle': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-webpack-loader-syntax': 'off',
    'import/order': 'error',
    'import/prefer-default-export': 'off',
    'import/no-duplicates': 'off',
    'lodash/import-scope': ['error', 'member'],
    'lodash/prefer-constant': 'off',
    'lodash/prefer-immutable-method': 'warn',
    'lodash/prefer-includes': 'warn',
    'lodash/prefer-lodash-method': 'off',
    'lodash/prefer-lodash-typecheck': 'warn',
    'lodash/prefer-noop': 'off',
    'lodash/prefer-spread': 'off',
    'linebreak-style': 'error',
    'max-len': ['warn', { code: 120 }],
    'no-await-in-loop': 'warn',
    'no-continue': 'off',
    'no-param-reassign': 'off',
    'no-restricted-globals': 'warn',
    'no-restricted-syntax': 'off',
    'no-trailing-spaces': 'warn',
    'no-tabs': 'error',
    'no-undef': 'warn',
    'no-console': 'warn',
    'no-underscore-dangle': 'off',
    'valid-jsdoc': 'off',
    'class-methods-use-this': 'off',
    'comma-dangle': ['warn', 'always-multiline'],
    'func-names': 'off',
    'global-require': 'off',
    'prefer-arrow-callback': 'off',
    'object-shorthand': ['error', 'always'],
    'padded-blocks': ['error', 'never'],
    'prefer-spread': 'off',
    'promise/no-callback-in-promise': 'off',
    'quote-props': ['error', 'as-needed'],
    'spaced-comment': 'warn',
    'object-curly-spacing': ['error', 'always']
  }
}
