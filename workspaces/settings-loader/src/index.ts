import fs from 'fs'
import yaml from 'js-yaml'
import { get, set, merge } from 'lodash'

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
    autoSave: true,
  }

  public filepath = './settings.yml'

  public constructor(options?: SettingsOptions) {
    if (options) {
      this.options = merge(this.options, options)
    }

    if (this.options.filepath) {
      this.filepath = options.filepath
    }

    if (this.options.autoLoad) {
      this.load()
    }
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
   * @returns get
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
}
