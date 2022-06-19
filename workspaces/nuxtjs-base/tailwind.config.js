const color = require('tinycolor2')

/**
 * Lightens a color
 * 
 * @param {color.ColorInput} col 
 * @param {number} amount 
 * @returns {string}
 */
function lighten(col, amount = 5) {
  return color(col).lighten(amount).toString()
}

/**
 * Darken a color
 * 
 * @param {color.ColorInput} col 
 * @param {number} amount 
 * @returns {string}
 */
function darken(col, amount = 5) {
  return color(col).darken(amount).toString()
}

/**
 * 
 * @param {string} value 
 * @returns 
 */
function colorFromBase(value) {
  return {
    lighten: lighten(value, 8),
    light: lighten(value, 4),
    DEFAULT: value,
    dark: darken(value, 4),
    darken: darken(value, 8)
  }
}

//
const theme = {
  night: {
    lighten: '#5c6170',
    light: '#484c59', // nord3: UI elements like indent- and wrap guide marker
    DEFAULT: '#3c3f49', // nord2: selection- and text highlighting color
    dark: '#33343c', // nord1: elevated, more prominent or focused UI elements
    darken: '#1f2024' // nord0: elements background
  },

  snow: {
    darken: '#7f84ac',
    dark: '#abb3ce',
    DEFAULT: '#D8DEE9', // nord4
    light: '#E5E9F0', // nord5
    lighten: '#ECEFF4', // nord6
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
    lighten: '#c7e1f6',
    light: '#a1ceef',
    DEFAULT: '#7db8e8',
    dark: '#5396de',
    darken: '#3e7bd2'
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
        background: '#121212',

        // Components
        origin: colorFromBase(theme.snow.DEFAULT),
        menus: colorFromBase(theme.night.darken),
        input: colorFromBase(theme.night.dark),
        button: colorFromBase(theme.night.DEFAULT),

        // Colors
        danger: colorFromBase(theme.aurora.red),
        success: colorFromBase(theme.aurora.green),
        warning: colorFromBase(theme.aurora.yellow),
        blue: colorFromBase(theme.frost.blue),
        orange: colorFromBase(theme.frost.orange),
        pink: colorFromBase(theme.frost.pink),
        gray: colorFromBase(theme.frost.gray),
        cyan: colorFromBase(theme.frost.cyan),
        green: colorFromBase(theme.frost.green),
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
              color: 'white'
            },
            h2: {
              color: 'white'
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
