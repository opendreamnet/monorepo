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
        'wdio',
      ],
      extends: [
        '@nuxtjs',
        'plugin:@typescript-eslint/recommended',
        'plugin:wdio/recommended',
      ],
      rules: {
        'vue/html-self-closing': ['warn', {
          html: {
            void: 'always',
            normal: 'never',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        }],
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
