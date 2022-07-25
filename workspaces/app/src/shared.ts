import isNil from 'lodash/isNil'

export interface IIs {
  browser: boolean
  webWorker: boolean
  electron: { any: boolean, renderer: boolean, main: boolean }
  node: boolean
  nodeIntegration: boolean
  macos: boolean
  windows: boolean
  linux: boolean
  android: boolean
  dev: boolean
}

export interface IApp {
  getName(): string
  setName(value: string): void
  getPlatform(): string
  is: IIs
  choice(choices: Choices, defaultValue?: any): any
  getPath(name: PathName, ...paths: string[]): string | undefined
}

/**
 * Indicates if the platform is a web browser.
 */
export const isBrowser = typeof window !== 'undefined' && !isNil(window.document)

/**
 * Indicates if the platform is a webworker.
 */
export const isWebWorker = typeof self !== 'undefined'
   && self.constructor
   && self.constructor.name === 'DedicatedWorkerGlobalScope'

/**
 * Indicates if the platform is NodeJS.
 */
export const isNode = typeof process !== 'undefined'
   && !isNil(process.versions?.node)

/**
 * Indicates if the platform is the ElectronJS renderer process.
 */
export const isElectronRenderer = typeof process !== 'undefined'
   // @ts-ignore
   && !isNil(process.type)
   // @ts-ignore
   && process.type === 'renderer'

/**
 * Indicates if the platform is the ElectronJS main process.
 */
export const isElectronMain = typeof process !== 'undefined'
   // @ts-ignore
   && !isNil(process.versions?.electron)

/**
 * Indicates if the platform has access to the NodeJS engine.
 */
export const hasNodeIntegration = isNode || isElectronMain

export interface Choices {
  browser?: any
  webWorker?: any
  electron?: { any?: any, renderer?: any, main?: any }
  node?: any
  nodeIntegration?: any
  macos?: any
  windows?: any
  linux?: any
  android?: any
  dev?: any
}

export type PathName = 'cwd' | 'home' | 'temp' | 'temporary' | 'temporal' | 'appData' | 'userData' | 'downloads' | 'cache' | 'savegames' | 'desktop' | 'downloads' | 'music' | 'pictures' | 'videos'