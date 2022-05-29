import os from 'os'
import path from 'path'
import fs from 'fs'
import { startCase, keys, isNil } from 'lodash'
import parent from 'parent-package-json'
import * as $ from './shared'

/**
 * Application name.
 */
let appName: string

/**
 * Returns the application name.
 */
export function getName(): string {
 if (!appName && $.hasNodeIntegration) {
   const pkg = parent(null, 1)

   if (pkg) {
     // Try to find the name of the application in the package.json
     const payload = pkg.parse()
     appName = startCase(payload.productName || payload.displayName || payload.name)
   } else {
     appName = 'OpenDreamApp'
   }
 }

 return appName
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
  if ($.hasNodeIntegration) {
    return os.platform()
  } else {
    // @ts-ignore
    return (navigator?.userAgentData?.platform || navigator?.platform || 'Unknown').toLowerCase()
  }
}

/**
 *
 */
export const is = {
  browser: $.isBrowser,
  webWorker: $.isWebWorker,
  electron: {
    any: $.isElectronRenderer || $.isElectronMain,
    renderer: $.isElectronRenderer,
    main: $.isElectronMain
  },
  node: $.isNode,
  nodeIntegration: $.hasNodeIntegration,
  macos: getPlatform() === 'darwin',
  windows: getPlatform() === 'win32',
  linux: getPlatform() === 'linux',
  android: getPlatform() === 'android',
  dev: $.hasNodeIntegration ? process.env.NODE_ENV !== 'production' : null
}

/**
 *
 *
 * @export
 * @param choices
 * @param [defaultValue]
 * @return {*}
 */
export function choice(choices: $.Choices, defaultValue?: any): any {
  for (const key of keys(choices)) {
    if (!isNil(is[key]) && is[key] === true) {
      return choices[key]
    }
  }

  return defaultValue
}

/**
 *
 * @param name
 * @param paths
 */
export async function getPath(name: $.PathName, ...paths: string[]): Promise<string | undefined> {
  if (!$.hasNodeIntegration) {
    return undefined
  }

  let getPlatformPath: (name: $.PathName) => string | undefined

  try {
    // @ts-expect-error
    getPlatformPath = (await import('platform-folders')).default
  } catch (err: any) {
    return undefined
  }

  let basePath: string | undefined

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
      return getPath('appData', 'opendreamnet', getName(), ...paths)

    case 'downloads': {
      const commonPath = await getPath('home', 'Downloads')

      if (commonPath && fs.existsSync(commonPath)) {
        basePath = commonPath
      } else {
        basePath = getPlatformPath(name)
      }
      break
    }

    case 'cache':
    case 'savegames':
      basePath = path.resolve(getPlatformPath(name) || '', getName())
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

  if (basePath) {
    return path.resolve(basePath, ...paths)
  }

  return undefined
}