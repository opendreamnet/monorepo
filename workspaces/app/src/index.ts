import { isNil, keys, startCase } from 'lodash'
import path from 'path'

/**
 * Indicate if it is a web platform.
 */
const isBrowser = typeof window !== 'undefined' && !isNil(window.document)

/**
 * Indicates if it is a webworker platform.
 */
const isWebWorker = typeof self !== 'undefined'
  && self.constructor
  && self.constructor.name === 'DedicatedWorkerGlobalScope'

/**
 * Indicates if the platform is NodeJS.
 */
const isNode = typeof process !== 'undefined'
  && !isNil(process.versions)
  && !isNil(process.versions.node)

/**
 * Indicates if the platform is the ElectronJS renderer.
 */
const isElectronRenderer = typeof process !== 'undefined'
  // @ts-ignore
  && !isNil(process.type)
  // @ts-ignore
  && process.type === 'renderer'

/**
 * Indicates if the platform is the ElectronJS main.
 */
const isElectronMain = typeof process !== 'undefined'
  && !isNil(process.versions)
  // @ts-ignore
  && !isNil(process.versions.electron)

/**
 * Indicates whether there is access to the NodeJS engine.
 */
const hasNodeIntegration = isNode || isElectronMain

/**
 * Application Name.
 */
let appName: string

/**
 * Returns the application name.
 */
export function getName(): string {
  if (!appName && isNode) {
    const pkg = require('parent-package-json')(null, 1)

    if (pkg) {
      // Try to find the name of the application in the package.json
      const payload = pkg.parse()
      appName = startCase(payload.productName || payload.displayName || payload.name)
    } else {
      appName = 'DreamApp'
    }
  }

  return appName || 'DreamApp'
}

/**
 *
 *
 * @export
 * @param {string} value
 */
export function setName(value: string): void {
  appName = value
}

/**
 * Returns the operating system.
 */
export function getPlatform(): string {
  if (!isNode) {
    return navigator.platform.toLowerCase()
  }

  return require('os').platform()
}

/**
 *
 */
export const is = {
  browser: isBrowser,
  webWorker: isWebWorker,
  electron: {
    any: isElectronRenderer || isElectronMain,
    renderer: isElectronRenderer,
    main: isElectronMain,
  },
  node: isNode,
  nodeIntegration: hasNodeIntegration,
  macos: getPlatform() === 'darwin',
  windows: getPlatform() === 'win32',
  linux: getPlatform() === 'linux',
  android: getPlatform() === 'android',
  dev: process.env.NODE_ENV !== 'production',
}

/**
 *
 */
export const isDev = process.env.NODE_ENV !== 'production'

/**
 *
 * @param choices
 */
export function choice(choices: Record<string, unknown>, defaultValue?: unknown): unknown {
  for (const key of keys(choices)) {
    if (!isNil(is[key]) && is[key] === true) {
      return choices[key]
    }
  }

  return defaultValue
}

function getElectronPath(name: string, ...paths: string[]): string | null {
  let basePath = ''

  try {
    const { app } = require('electron')

    switch (name) {
      case 'cwd':
        basePath = process.cwd()
        break

      case 'cache':
      case 'documents':
        basePath = path.resolve(app.getPath(name), getName())
        break

      default:
        basePath = app.getPath(name)
        break
    }

    return path.resolve(basePath, ...paths)
  } catch (error) { }

  return null
}

type PathName = 'cwd' | 'home' | 'temp' | 'appData' | 'userData' | 'downloads' | 'cache' | 'savegames' | 'desktop' | 'downloads' | 'music' | 'pictures' | 'videos'

/**
 *
 * @param name
 * @param paths
 */
export function getPath(name: PathName, ...paths: string[]): string | null {
  if (!hasNodeIntegration) {
    return null
  }

  if (isElectronMain || isElectronRenderer) {
    const electronPath = getElectronPath(name, ...paths)

    if (electronPath) {
      return electronPath
    }
  }

  let basePath = ''

  const fs = require('fs')
  const os = require('os')
  const getPlatformPath = require('platform-folders').default

  switch (name) {
    case 'cwd':
      basePath = process.cwd()
      break

    case 'home':
      basePath = os.homedir()
      break

    case 'temp':
    case 'temporary':
    case 'temporal':
      basePath = os.tmpdir()
      break

    case 'appData':
      basePath = choice({
        windows: path.resolve(os.homedir(), 'AppData', 'Roaming'),
        macos: path.resolve(os.homedir(), 'Library', 'Application Support'),
      }, path.resolve(os.homedir(), '.config')) as string
      break

    case 'userData':
      return getPath('appData', 'DreamNet', getName(), ...paths)

    case 'downloads': {
      const commonPath = getPath('home', 'Downloads')

      if (commonPath && fs.existsSync(commonPath)) {
        basePath = commonPath
      } else {
        basePath = getPlatformPath(name)
      }
      break
    }

    case 'cache':
    case 'savegames':
      basePath = path.resolve(getPlatformPath(name), getName())
      break

    // desktop
    // downloads
    // music
    // pictures
    // videos
    default:
      basePath = getPlatformPath(name)
      break
  }

  return path.resolve(basePath, ...paths)
}
