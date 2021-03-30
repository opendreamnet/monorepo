module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    es6: true,
  },
  plugins: [
    'import',
    'promise',
    'lodash',
    'mocha',
  ],
  extends: [
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:promise/recommended',
    'plugin:lodash/recommended',
    'plugin:mocha/recommended',
  ],
  rules: {
    // General Code Rules

    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'prefer-spread': 'error',
    'space-before-function-paren': ['error', 'never'],
    'linebreak-style': 'error',
    'max-len': 'off',
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
    'no-unused-vars': ['warn', { args: 'all', argsIgnorePattern: '^_' }],
    'valid-jsdoc': 'off',
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'never'],
    'func-names': 'off',
    'global-require': 'off',
    'prefer-arrow-callback': 'error',
    'object-shorthand': ['error'],
    'padded-blocks': ['error', 'never'],
    'prefer-spread': 'error',
    'quote-props': ['error', 'as-needed'],
    'spaced-comment': 'warn',
    'object-curly-spacing': ['error', 'always'],

    // Import

    'import/order': 'error',
    'import/first': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-unresolved': 'off',
    'import/named': 'error',

    // Lodash

    'lodash/import-scope': ['error', 'member'],
    'lodash/prefer-constant': 'off',
    'lodash/prefer-includes': 'warn',
    'lodash/prefer-lodash-method': 'off',
    'lodash/prefer-noop': 'off',

    // Mocha

    'mocha/prefer-arrow-callback': 'error',

    // Unicorn

    'unicorn/prefer-includes': 'off',
    'unicorn/prefer-text-content': 'off'
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: [
        '@typescript-eslint',
      ],
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/quotes': ['error', 'single'],
        '@typescript-eslint/semi': ['error', 'never'],
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/explicit-member-accessibility': ['error'],
        '@typescript-eslint/space-before-function-paren': ['error', 'never'],

        quotes: 'off',
        semi: 'off',
        'space-before-function-paren': 'off',
      },
    }
  ],
  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.mjs'] }
    }
  },
}
