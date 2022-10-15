import path from 'path'
import * as app from '@opendreamnet/app'
import fs from 'fs-extra'

class Storage {
  public initialized = false

  public payload: Record<string, string> = {}

  public filepath!: string

  public async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    if (!this.filepath || !fs.existsSync(this.filepath)) {
      this.filepath = await app.getPath('userData', 'storage.json') as string
    } else if (fs.lstatSync(this.filepath).isDirectory()) {
      this.filepath = path.resolve(this.filepath, 'storage.json')
    }

    if (!fs.existsSync(this.filepath)) {
      fs.ensureFileSync(this.filepath)
      fs.writeJSONSync(this.filepath, {})
    }

    this.payload = fs.readJSONSync(this.filepath)
    this.initialized = true
  }

  public setFilepath(value: string): this {
    this.filepath = value
    return this
  }

  public save(name: string, value: string): void {
    this.payload[name] = value
    fs.writeJSONSync(this.filepath, this.payload, { spaces: 2 })
  }

  public get(name: string): string | undefined {
    return this.payload[name]
  }
}

export const storage = new Storage()
