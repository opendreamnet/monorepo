const { theme, themeLight, themeDark, getExtendColors } = require('./helpers/theme')

/**
 * @type import('tailwindcss/tailwind-config').TailwindConfig
 */
module.exports = {
  darkMode: 'class',
  safelist: [
    'dark'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Arial',
          'sans-serif'
        ]
      },

      // https://www.crispedge.com/color-shades-generator
      // https://maketintsandshades.com/#1e202b
      colors: {
        ...theme,
        ...themeDark
      },

      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.snow.DEFAULT'),
            '[class~="lead"]': {
              color: theme('colors.snow.light')
            },
            a: {
              color: theme('colors.primary.light'),
              '&:hover': {
                color: theme('colors.primary.DEFAULT')
              }
            },
            strong: {
              color: theme('colors.snow.light')
            },
            'ol > li::before': {
              color: theme('colors.snow.DEFAULT')
            },
            'ul > li::before': {
              backgroundColor: theme('colors.snow.lighten')
            },
            hr: {
              borderColor: theme('colors.menus.light')
            },
            blockquote: {
              color: theme('colors.snow.darken'),
              borderLeftColor: theme('colors.snow.lighten')
            },
            h1: {
              color: 'white'
            },
            h2: {
              color: 'white'
            },
            h3: {
              color: theme('colors.snow.lighten')
            },
            h4: {
              color: theme('colors.snow.lighten')
            },
            'figure figcaption': {
              color: theme('colors.snow.DEFAULT')
            },
            code: {
              color: theme('colors.snow.DEFAULT'),
              backgroundColor: theme('colors.menus.darken'),
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
              borderRadius: '0.25rem'
            },
            'code::before': {
              content: 'none'
            },
            'code::after': {
              content: 'none'
            },
            'a code': {
              color: theme('colors.snow.darken')
            },
            pre: {
              color: theme('colors.snow.DEFAULT'),
              backgroundColor: theme('colors.menus.darken'),
              maxHeight: '400px'
            }
          }
        }
      })
    }
  },
  variants: {},
  plugins: [
    /*
    require('@mertasan/tailwindcss-variables')({
      variablePrefix: '--theme',
      colorVariables: true,
      extendColors: getExtendColors()
    })
    */
  ]
}