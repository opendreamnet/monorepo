const color = require('tinycolor2')

//
function lighten(col, amount = 5) {
  return color(col).lighten(amount).toString()
}

function darken(col, amount = 5) {
  return color(col).darken(amount).toString()
}

//
const theme = {
  night: {
    light: '#4C566A', // nord3: UI elements like indent- and wrap guide marker
    DEFAULT: '#434C5E', // nord2: selection- and text highlighting color
    dark: '#3B4252', // nord1: elevated, more prominent or focused UI elements
    darker: '#2E3440' // nord0: elements background
  },

  snow: {
    darker: '#82858c',
    dark: '#adb2ba',
    DEFAULT: '#D8DEE9',
    light: '#E5E9F0',
    lighter: '#ECEFF4'
  },

  frost: {
    green: '#9fc6c5', // stand out and get more visual attention
    cyan: '#94c4d1', // primary UI elements with main usage purposes
    gray: '#81A1C1', // secondary UI elements that also require more visual attention than other elements
    blue: '#94afd1' // tertiary UI elements that require more visual attention
  },

  aurora: {
    red: '#f0a8af', // errors
    orange: '#d99e8c', // rarely used for UI elements
    yellow: '#f0d8a8', // warnings
    green: '#A3BE8C', // success
    pink: '#c2a3bc' // rarely used for UI elements
  },

  primary: {
    light: lighten('#7db8e8', 10),
    DEFAULT: '#7db8e8',
    dark: darken('#7db8e8', 10)
  }
}

module.exports = {
  important: true,
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
        night: theme.night,
        snow: theme.snow,
        frost: theme.frost,
        aurora: theme.aurora,
        primary: theme.primary,
        background: '#242933',

        menus: {
          lighten: lighten(theme.night.darker, 6),
          light: lighten(theme.night.darker, 3),
          DEFAULT: theme.night.darker,
          dark: darken(theme.night.darker, 3),
          darker: darken(theme.night.darker, 6)
        },
        input: {
          light: lighten(theme.night.DEFAULT),
          DEFAULT: theme.night.DEFAULT,
          dark: darken(theme.night.DEFAULT, 8)
        },
        button: {
          light: lighten(theme.night.DEFAULT),
          DEFAULT: theme.night.DEFAULT,
          dark: darken(theme.night.DEFAULT)
        },
        danger: {
          light: lighten(theme.aurora.red),
          DEFAULT: theme.aurora.red,
          dark: darken(theme.aurora.red)
        },
        success: {
          light: lighten(theme.aurora.green),
          DEFAULT: theme.aurora.green,
          dark: darken(theme.aurora.green)
        },
        warning: {
          light: lighten(theme.aurora.yellow),
          DEFAULT: theme.aurora.yellow,
          dark: darken(theme.aurora.yellow)
        },
        blue: {
          light: lighten(theme.frost.blue),
          DEFAULT: theme.frost.blue,
          dark: darken(theme.frost.blue)
        },
        orange: {
          light: lighten(theme.aurora.orange),
          DEFAULT: theme.aurora.orange,
          dark: darken(theme.aurora.orange)
        },
        pink: {
          light: lighten(theme.aurora.pink),
          DEFAULT: theme.aurora.pink,
          dark: darken(theme.aurora.pink)
        },
        gray: {
          light: lighten(theme.frost.gray),
          DEFAULT: theme.frost.gray,
          dark: darken(theme.frost.gray)
        },
        cyan: {
          light: lighten(theme.frost.cyan),
          DEFAULT: theme.frost.cyan,
          dark: darken(theme.frost.cyan)
        },
        green: {
          light: lighten(theme.frost.green),
          DEFAULT: theme.frost.green,
          dark: darken(theme.frost.green)
        }
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
              backgroundColor: theme('colors.snow.lighter')
            },
            hr: {
              borderColor: theme('colors.menus.light')
            },
            blockquote: {
              color: theme('colors.snow.darker'),
              borderLeftColor: theme('colors.snow.lighter')
            },
            h1: {
              color: theme('colors.snow.lighter')
            },
            h2: {
              color: theme('colors.snow.lighter')
            },
            h3: {
              color: theme('colors.snow.lighter')
            },
            h4: {
              color: theme('colors.snow.lighter')
            },
            'figure figcaption': {
              color: theme('colors.snow.DEFAULT')
            },
            code: {
              color: theme('colors.snow.DEFAULT'),
              backgroundColor: theme('colors.menus.darker'),
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
              color: theme('colors.snow.darker')
            },
            pre: {
              color: theme('colors.snow.DEFAULT'),
              backgroundColor: theme('colors.menus.darker'),
              maxHeight: '400px'
            }
          }
        }
      })
    }
  },
  variants: {},
  plugins: []
}
