// Official theme (legacy and modern)
export const theme = {
  zinc: {
    '50': '#fafafa',
    '100': '#f4f4f5',
    '200': '#e4e4e7',
    '300': '#d4d4d8',
    '400': '#a1a1aa',
    '500': '#71717a',
    '600': '#52525b',
    '700': '#3f3f46',
    '800': '#27272a',
    '900': '#18181b',
    '950': '#09090b',

    lighten: '#f4f4f5',
    light: '#d4d4d8',
    DEFAULT: '#71717a',
    dark: '#3f3f46',
    darken: '#18181b'
  },

  origin: {
    lighten: '#fafafa',
    light: '#f4f4f5',
    DEFAULT: '#e4e4e7',
    dark: '#d4d4d8',
    darken: '#a1a1aa'
  },

  night: {
    lighten: '#e3e7ea',
    light: '#a6b1ba',
    DEFAULT: '#5f6f7b',
    dark: '#464f58',
    darken: '#373c42'
  },

  snow: {
    darken: '#777E90',
    dark: '#B1B5C3',
    DEFAULT: '#D8DEE9',
    light: '#E5E9F0',
    lighten: '#FCFCFD',
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

  secondary: {
    lighten: '#8ec1d3',
    light: '#68adc4',
    DEFAULT: '#4298B5',
    dark: '#357a91',
    darken: '#285b6d'
  },

  blue: {
    lighten: '#daeef3',
    light: '#88c4d8',
    DEFAULT: '#3588a5',
    dark: '#2c5b72',
    darken: '#284151',
  },

  brand: {
    lighten: '#daf1e4',
    light: '#8acbaf',
    DEFAULT: '#379271',
    dark: '#1f5d4a',
    darken: '#163e32',
  },

  green: {
    lighten: '#daf1e4',
    light: '#8acbaf',
    DEFAULT: '#379271',
    dark: '#1f5d4a',
    darken: '#163e32',
  },

  cyan: {
    lighten: '#e9f1f5',
    light: '#94c4d1',
    DEFAULT: '#4e97a9',
    dark: '#316373',
    darken: '#294651',
  },

  red: {
    lighten: '#fbe8e8',
    light: '#f0a8af',
    DEFAULT: '#dc576a',
    dark: '#a72945',
    darken: '#79223b',
  },

  orange: {
    lighten: '#f8ece8',
    light: '#e9c3b8',
    DEFAULT: '#c9806a',
    dark: '#96533f',
    darken: '#694033',
  },

  yellow: {
    lighten: '#f9f0db',
    light: '#eac787',
    DEFAULT: '#da8f35',
    dark: '#a95d25',
    darken: '#6d3e21',
  },

  pink: {
    lighten: '#f4eff3',
    light: '#dac7d6',
    DEFAULT: '#ad87a5',
    dark: '#7f5773',
    darken: '#5a4152',
  },
}

export const colors = {
  ...theme,

  background: theme.zinc.darken,
  menus: theme.zinc,
  primary: theme.brand,

  danger: theme.red,
  success: theme.green,
  warning: theme.yellow,

  gray: theme.zinc,
}

/**
 *
 */
export const fontFamily = {
  sans: [
    'ui-sans-serif',
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI Variable Display',
    'Helvetica',
    'Arial',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol'
  ],

  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'SF Mono',
    'Cascadia Mono',
    'Segoe UI Mono',
    'Liberation Mono',
    'Menlo',
    'Monaco',
    'Consolas',
    'monospace',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol'
  ],

  logo: [
    'Anke',
    'Anke Regular',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI Variable Display',
    'Helvetica',
    'Arial',
    'sans-serif'
  ]
}

export default {
  theme: {
    extend: {
      fontFamily,
      colors,

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
  }
}
