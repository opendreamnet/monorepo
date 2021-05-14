import path from 'path'
import { isNil, keys, startCase } from 'lodash'

/**
 * Indicates if the platform is a web browser.
 */
const isBrowser = typeof window !== 'undefined' && !isNil(window.document)

/**
 * Indicates if the platform is a webworker.
 */
const isWebWorker = typeof self !== 'undefined'
  && self.constructor
  && self.constructor.name === 'DedicatedWorkerGlobalScope'

/**
 * Indicates if the platform is NodeJS.
 */
const isNode = typeof process !== 'undefined'
  && !isNil(process.versions?.node)

/**
 * Indicates if the platform is the ElectronJS renderer process.
 */
const isElectronRenderer = typeof process !== 'undefined'
  // @ts-ignore
  && !isNil(process.type)
  // @ts-ignore
  && process.type === 'renderer'

/**
 * Indicates if the platform is the ElectronJS main process.
 */
const isElectronMain = typeof process !== 'undefined'
  // @ts-ignore
  && !isNil(process.versions?.electron)

/**
 * Indicates if the platform has access to the NodeJS engine.
 */
const hasNodeIntegration = isNode || isElectronMain

/**
 * Application name.
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
    main: isElectronMain
  },
  node: isNode,
  nodeIntegration: hasNodeIntegration,
  macos: getPlatform() === 'darwin',
  windows: getPlatform() === 'win32',
  linux: getPlatform() === 'linux',
  android: getPlatform() === 'android',
  dev: hasNodeIntegration ? process.env.NODE_ENV !== 'production' : null
}

/**
 *
 */
export const isDev = hasNodeIntegration ? process.env.NODE_ENV !== 'production' : null

export interface Choices {
  browser?: unknown
  webWorker?: unknown
  electron?: { any?: unknown, renderer?: unknown, main?: unknown }
  node?: unknown
  nodeIntegration?: unknown
  macos?: unknown
  windows?: unknown
  linux?: unknown
  android?: unknown
  dev?: unknown
}

/**
 *
 * @param choices
 */
export function choice(choices: Choices, defaultValue?: unknown): unknown {
  for (const key of keys(choices)) {
    if (!isNil(is[key]) && is[key] === true) {
      return choices[key]
    }
  }

  return defaultValue
}

function getElectronPath(name: string, ...paths: string[]): string | undefined {
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

  return undefined
}

export type PathName = 'cwd' | 'home' | 'temp' | 'temporary' | 'temporal' | 'appData' | 'userData' | 'downloads' | 'cache' | 'savegames' | 'desktop' | 'downloads' | 'music' | 'pictures' | 'videos'

/**
 *
 * @param name
 * @param paths
 */
export function getPath(name: PathName, ...paths: string[]): string | undefined {
  if (!hasNodeIntegration) {
    return undefined
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
        macos: path.resolve(os.homedir(), 'Library', 'Application Support')
      }, path.resolve(os.homedir(), '.config')) as string
      break

    case 'userData':
      return getPath('appData', 'dreamnet', getName(), ...paths)

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
