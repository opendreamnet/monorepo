import { type Linter } from 'eslint'

/**
 * This configuration serves as a reference for detecting missing rules from the "standard" library.
 *
 * Look at `getMissingRules` of `helpers.ts`
 */
export const baseConfig: Linter.Config = {
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
    },
  ],
}
