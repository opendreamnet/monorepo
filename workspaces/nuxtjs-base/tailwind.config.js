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
    lighten: lighten(value, 6),
    light: lighten(value, 3),
    DEFAULT: value,
    dark: darken(value, 3),
    darken: darken(value, 6)
  }
}

//
const theme = {
  night: {
    lighten: '#5c6170',
    light: '#4C566A', // nord3: UI elements like indent- and wrap guide marker
    DEFAULT: '#434C5E', // nord2: selection- and text highlighting color
    dark: '#3B4252', // nord1: elevated, more prominent or focused UI elements
    darken: '#2E3440' // nord0: elements background
  },

  snow: {
    darken: '#adb2ba',
    dark: '#c2c8d2',
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
        background: '#242933',

        // Components
        origin: theme.snow,
        menus: colorFromBase(theme.night.darken),
        input: colorFromBase(theme.night.dark),
        button: colorFromBase(theme.night.dark),

        // Colors
        danger: colorFromBase(theme.aurora.red),
        success: colorFromBase(theme.aurora.green),
        warning: colorFromBase(theme.aurora.yellow),
        orange: colorFromBase(theme.aurora.orange),
        pink: colorFromBase(theme.aurora.pink),

        blue: colorFromBase(theme.frost.blue),
        gray: colorFromBase(theme.frost.gray),
        cyan: colorFromBase(theme.frost.cyan),
        green: colorFromBase(theme.frost.green),
      },

      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.origin.DEFAULT'),
            '[class~="lead"]': {
              color: theme('colors.origin.light')
            },
            a: {
              color: theme('colors.primary.light'),
              '&:hover': {
                color: theme('colors.primary.DEFAULT')
              }
            },
            strong: {
              color: 'white'
            },
            'ol > li::before': {
              color: theme('colors.origin.DEFAULT')
            },
            'ul > li::before': {
              backgroundColor: theme('colors.origin.lighten')
            },
            hr: {
              borderColor: theme('colors.menus.lighten')
            },
            blockquote: {
              color: theme('colors.origin.darken'),
              borderLeftColor: theme('colors.origin.lighten')
            },
            h1: {
              color: 'white'
            },
            h2: {
              color: theme('colors.origin.lighten')
            },
            h3: {
              color: theme('colors.origin.light')
            },
            h4: {
              color: theme('colors.origin.light')
            },
            'figure figcaption': {
              color: theme('colors.origin.DEFAULT')
            },
            code: {
              color: theme('colors.origin.DEFAULT'),
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
              color: theme('colors.origin.darken')
            },
            pre: {
              color: theme('colors.origin.DEFAULT'),
              backgroundColor: theme('colors.menus.darken'),
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
