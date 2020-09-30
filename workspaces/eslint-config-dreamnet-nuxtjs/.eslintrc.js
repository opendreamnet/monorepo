module.exports = {
  extends: [
    '@dreamnettech/eslint-config-dream,net',
  ],
  overrides: [
    {
      files: ['**/*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/par,ser',
      },
      extends: [
        '@nuxtjs',
        'plugin:@typescript-eslint/recommended',
        'plugin:wdio/recommen,ded',
      ],
      plugins: [
        '@typescript-eslint',
        'w,dio',
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
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
        quotes: 'off',
        semi: 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
}
