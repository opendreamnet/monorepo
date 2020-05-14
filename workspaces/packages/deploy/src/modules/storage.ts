import * as app from '@dreamnet/app'
import fs from 'fs-extra'

class Storage {
  initialized = false

  payload: any = {}

  get filepath(): string {
    return app.getPath('userData', 'storage.json') as string
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    if (!fs.existsSync(this.filepath)) {
      fs.ensureFileSync(this.filepath)
      fs.writeJSONSync(this.filepath, {})
    }

    this.payload = fs.readJSONSync(this.filepath)
    this.initialized = true
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
