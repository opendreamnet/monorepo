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
        '@typescript-eslint/no-explicit-any': 'off',
        quotes: 'off',
        semi: 'off',
        'space-before-function-paren': 'off',
        
        'vue/html-indent': 'off',
        'vue/no-v-html': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/html-closing-bracket-newline': ['warn', {
          'singleline': 'never',
          'multiline': 'never'
        }],
        'vue/max-attributes-per-line': ['warn', {
          singleline: 3,
          multiline: 1
        }],
        'vue/singleline-html-element-content-newline': ['error', {
          ignores: [
            'a',
            'abbr',
            'audio',
            'b',
            'bdi',
            'bdo',
            'canvas',
            'cite',
            'code',
            'data',
            'del',
            'dfn',
            'em',
            'i',
            'iframe',
            'ins',
            'kbd',
            'label',
            'map',
            'mark',
            'noscript',
            'object',
            'output',
            'picture',
            'q',
            'ruby',
            's',
            'samp',
            'small',
            'span',
            'strong',
            'sub',
            'sup',
            'svg',
            'time',
            'u',
            'var',
            'video',
            'button',
            'NuxtLink'
          ]
        }]
      },
    },
  ],
}
