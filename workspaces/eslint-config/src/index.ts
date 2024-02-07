import { type Linter } from 'eslint'
import standardRules from './json/standard.rules.json'
import tsStandardRules from './json/standard.typescript.rules.json'
import '@rushstack/eslint-patch/modern-module-resolution'

const config: Linter.Config = {
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  globals: {
    document: 'readonly',
    navigator: 'readonly',
    window: 'readonly',
  },

  plugins: [
    'n',
    'import',
    'promise',
    '@stylistic',
    '@stylistic/migrate',
  ],

  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'plugin:n/recommended',
    'plugin:@stylistic/disable-legacy',
    'plugin:@stylistic/recommended-extends',
  ],

  rules: {
    // Rules from "standard" library.
    ...(standardRules as unknown as Linter.RulesRecord),

    // import
    'import/no-unresolved': 'off',
    'import/order': [
      'warn',
      {
        groups: [
          'type',
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
        ],
      },
    ],

    // n
    'n/no-missing-import': 'off',
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.mts', '*.cts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: true,
      },
      plugins: [
        '@typescript-eslint',
      ],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/stylistic',
      ],
      rules: {
        // Rules from "standard-with-typescript" library.
        ...(tsStandardRules as unknown as Linter.RulesRecord),
      },
    },
  ],
}

export = config
