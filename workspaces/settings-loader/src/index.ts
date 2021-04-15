/* eslint-disable @typescript-eslint/ban-types */
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { get, set, merge } from 'lodash'

export function recursiveProxyHandler<T extends object>(setFunc: () => void): ProxyHandler<T> {
  return {
    get(target, p, receiver) {
      try {
        return new Proxy(target[p.toString()], recursiveProxyHandler(setFunc))
      } catch (err) {
        return Reflect.get(target, p, receiver)
      }
    },
    set(target, p, value, receiver) {
      const response = Reflect.set(target, p, value, receiver)
      setFunc()
      return response
    },
    defineProperty(target, p, attributes) {
      const response = Reflect.defineProperty(target, p, attributes)
      setFunc()
      return response
    }
  }
}

/**
 * Creates a proxied version that allows access to
 * the payload using the properties of the class.
 *
 * @remarks
 * If `options.autoSave` is true then the payload will
 * be saved whenever a value is set to a property.
 *
 * @example
 * ```
 * // settings.yml:
 * // user:
 * //   name: "Ivan Bravo"
 * //   email: "kolessios@example.com"
 * const settings = Settings.createProxied()
 * settings.user.name // "Ivan Bravo"
 * settings.user.email = 'ivan@example.com' // Saved to file
 * ```
 *
 * @param instance
 * @param [options]
 */
export function createProxied<T extends ProxiedSettings>(instance: new(options?: SettingsOptions) => T, options?: SettingsOptions): T {
  return new Proxy(new instance(options), {
    get(target, p, receiver) {
      if (p in target.payload) {
        try {
          return new Proxy(target.payload[p.toString()] as object, recursiveProxyHandler(target.autosave.bind(target)))
        } catch (err) {
          return target.payload[p.toString()]
        }
      }

      return Reflect.get(target, p, receiver)
    },
    set(target, p, value, receiver) {
      if (p in target.payload) {
        const response = Reflect.set(target.payload, p, value, receiver)
        target.autosave()
        return response
      }

      return Reflect.set(target, p, value, receiver)
    },
    defineProperty(target, p, attributes) {
      const response = Reflect.defineProperty(target.payload, p, attributes)
      target.autosave()
      return response
    }
  })
}

/**
 * Same as `new Settings(options)`
 *
 * @param instance
 * @param [options]
 */
export function create<T extends Settings>(instance: new(options?: SettingsOptions) => T, options?: SettingsOptions): T {
  return new instance(options)
}

export interface SettingsOptions {
  /**
   * Settings file location.
   */
  filepath?: string
  /**
   * Save changes automatically when using `set`?
   */
  autoSave?: boolean
  /**
   * Load the settings file automatically in the constructor?
   */
  autoLoad?: boolean
}

export class Settings {
  public payload: Record<string, unknown> = {}

  public options: SettingsOptions = {
    autoSave: true
  }

  public filepath = path.resolve(process.cwd(), 'settings.yml')

  /**
   * Creates a proxied version that allows access to
   * the payload using the properties of the class.
   *
   * @remarks
   * If `options.autoSave` is true then the payload will
   * be saved whenever a value is set to a property.
   *
   * @example
   * ```
   * // settings.yml:
   * // user:
   * //   name: "Ivan Bravo"
   * //   email: "kolessios@example.com"
   * const settings = Settings.createProxied()
   * settings.user.name // "Ivan Bravo"
   * settings.user.email = 'ivan@example.com' // Saved to file
   * ```
   *
   * @param [options]
   */
  public static createProxied(options?: SettingsOptions): ProxiedSettings {
    return createProxied(ProxiedSettings, options)
  }

  /**
   * Same as `new Settings(options)`
   *
   * @param [options]
   */
  public static create(options?: SettingsOptions): Settings {
    return create(Settings, options)
  }

  public constructor(options?: SettingsOptions) {
    if (options) {
      this.setOptions(options)
    }

    if (this.options.filepath) {
      this.filepath = this.options.filepath
    }

    if (this.options.autoLoad) {
      this.load()
    }
  }

  /**
   *
   *
   * @param value
   */
  public setFilepath(value: string): this {
    this.options.filepath = value

    if (this.options.autoLoad) {
      this.load()
    }

    return this
  }

  /**
   *
   *
   * @param options
   */
  public setOptions(options: SettingsOptions): this {
    this.options = merge(this.options, options)
    return this
  }

  /**
   * Load the settings file.
   */
  public load(): void {
    this.payload = yaml.load(fs.readFileSync(this.filepath, 'utf-8')) as Record<string, unknown>
  }

  /**
   * Returns a value from the settings file.
   * Examples:
   * ```
   * settings.get('example')
   * settings.get('serversList.first', 'default')
   * ```
   *
   * @param key
   * @param [defaultValue]
   */
  public get(key: string, defaultValue?: unknown): unknown {
    return get(this.payload, key, defaultValue)
  }

  /**
   * Set a new value in the settings file.
   *
   * @param key
   * @param value
   * @param [forceSave] Save changes (Even if `options.autoSave` is` false`)
   */
  public set(key: string, value: unknown, forceSave = false): void {
    set(this.payload, key, value)

    if (this.options.autoSave || forceSave) {
      this.save()
    }
  }

  /**
   * Save the current payload to the file.
   */
  public save(): void {
    const payload = yaml.dump(this.payload)
    fs.writeFileSync(this.filepath, payload)
  }

  /**
   *
   *
   */
  public autosave(): void {
    if (this.options.autoSave) {
      this.save()
    }
  }
}

export class ProxiedSettings extends Settings {
  [index: string]: unknown
}