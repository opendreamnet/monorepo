module.exports = {
  extends: [
    '@dreamnet/eslint-config-dreamnet',
  ],
  overrides: [
    {
      files: ['**/*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      plugins: [
        '@typescript-eslint',
      ],
      extends: [
        '@nuxtjs',
        'plugin:nuxt/recommended',
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
    },
  ],
}
