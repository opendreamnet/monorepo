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

        'vue/html-closing-bracket-newline': ['warn', {
          'singleline': 'never',
          'multiline': 'never'
        }],
        'vue/max-attributes-per-line': ['warn', {
          singleline: {
            max: 3,
            allowFirstLine: true
          },
          multiline: {
            max: 1,
            allowFirstLine: true
          }
        }],

        quotes: 'off',
        semi: 'off',
        'space-before-function-paren': 'off',
      },
    },
  ],
}
