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
    lighten: '#40464d',
    light: '#282f36', // nord3: UI elements like indent- and wrap guide marker
    DEFAULT: '#101820', // nord2: selection- and text highlighting color
    dark: '#0d131a', // nord1: elevated, more prominent or focused UI elements
    darken: '#0a0e13' // nord0: elements background
  },

  snow: {
    darken: '#777E90',
    dark: '#B1B5C3',

    DEFAULT: '#D8DEE9', // nord4
    light: '#E5E9F0', // nord5

    lighten: '#FCFCFD', // nord6
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
    lighten: '#96cab5',
    light: '#73b89d',
    DEFAULT: '#50A684',
    dark: '#40856a',
    darken: '#30644f'
  },

  secondary: {
    lighten: '#8ec1d3',
    light: '#68adc4',
    DEFAULT: '#4298B5',
    dark: '#357a91',
    darken: '#285b6d'
  }
}

module.exports = {
  important: true,

  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Noto Sans',
          'Helvetica',
          'Arial',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji'
        ],
        logo: [
          'Anke',
          'Anke Regular',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Noto Sans',
          'Helvetica',
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
        secondary: theme.secondary,
        background: '#141416',

        // Components
        origin: theme.snow,
        menus: colorFromBase('#202022'),
        input: colorFromBase('#202022'),
        button: colorFromBase('#202022'),

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
