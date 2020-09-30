import path from 'path'
import * as app from '@dreamnettech/app'
import fs from 'fs-extra'

class Storage {
  initialized = false

  payload: any = {}

  filepath: string

  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    if (!this.filepath || !fs.existsSync(this.filepath)) {
      this.filepath = app.getPath('userData', 'storage.json')
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

  setFilepath(value: string): this {
    this.filepath = value
    return this
  }

  save(name: string, value: string): void {
    this.payload[name] = value
    fs.writeJSONSync(this.filepath, this.payload, { spaces: 2 })
  }

  get(name: string): string | null {
    return this.payload[name]
  }
}

export const storage = new Storage()
