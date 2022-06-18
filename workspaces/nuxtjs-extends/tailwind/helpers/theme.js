const color = require('tinycolor2')
const { keys, isString } = require('lodash')

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
 *
 * @param {string} name
 * @param {object|string} tree
 * @return {object}
 */
function resolveExtendColor(name, tree) {
  const response = {}

  if (isString(tree)) {
    return `var(--theme-${name})`
  }

  keys(tree).forEach((value) => {
    if (value === 'DEFAULT') {
      response[value] = `var(--theme-${name})`
    } else {
      response[value] = `var(--theme-${name}-${value})`
    }
  })

  return response
}

function getExtendColors() {
  const response = {}
  const themes = ['theme', 'themeLight', 'themeDark']

  themes.forEach((list) => {
    list = eval(list)

    keys(list).forEach((value) => {
      if (response[value]) {
        return
      }

      response[value] = resolveExtendColor(value, list[value])
    })
  })

  return response
}

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

const themeLight = {
  background: '#fff',

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

  // Components
  origin: colorFromBase(theme.night.darker),
  menus: colorFromBase('#f0eeeb'),
  input: colorFromBase(theme.night.dark),
  button: colorFromBase(theme.night.DEFAULT),
}

const themeDark = {
  background: '#121212',

  // Components
  origin: colorFromBase(theme.snow.DEFAULT),
  menus: colorFromBase(theme.night.darken),
  input: colorFromBase(theme.night.dark),
  button: colorFromBase(theme.night.DEFAULT),
}

module.exports = {
  lighten,
  darken,
  resolveExtendColor,
  getExtendColors,
  colorFromBase,
  theme,
  themeLight,
  themeDark,
}