import util from 'util'
import fs from 'fs'
import { find } from 'lodash'
import { Storage, MutableFile } from 'megajs'
import slash from 'slash'
import { UrlHash } from '../modules/types'
import { Provider } from './base/base'

export class MEGA extends Provider {
  /**
   *
   *
   * @type {Storage}
   */
  storage: Storage

  /**
   *
   *
   * @type {string}
   */
  _email?: string

  /**
   *
   *
   * @type {string}
   */
  _password?: string

  /**
   *
   *
   * @type {string}
   */
  _folder?: string

  /**
   *
   *
   * @readonly
   * @type {boolean}
   */
  get hasDirectorySupport(): boolean {
    return false
  }

  /**
   *
   *
   * @readonly
   * @type {(string | undefined)}
   */
  get email(): string | undefined {
    return this._email || process.env.DEPLOY_MEGA_EMAIL
  }

  /**
   *
   *
   * @readonly
   * @type {(string | undefined)}
   */
  get password(): string | undefined {
    return this._password || process.env.DEPLOY_MEGA_PASSWORD
  }

  /**
   *
   *
   * @readonly
   * @type {(string | undefined)}
   */
  get folder(): string | undefined {
    return this._folder || process.env.DEPLOY_MEGA_FOLDER
  }

  /**
   *
   *
   * @param {string} value
   * @returns {this}
   */
  setEmail(value: string): this {
    this._email = value
    return this
  }

  /**
   *
   *
   * @param {string} value
   * @returns {this}
   */
  setPassword(value: string): this {
    this._password = value
    return this
  }

  /**
   *
   *
   * @param {string} value
   * @returns {this}
   */
  setFolder(value: string): this {
    this._folder = value
    return this
  }

  /**
   *
   *
   */
  validate(): void {
    if (!this.email) {
      throw new Error('Missing email: DEPLOY_MEGA_EMAIL')
    }

    if (!this.password) {
      throw new Error('Missing password: DEPLOY_MEGA_PASSWORD')
    }
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  setup(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage = new Storage({
        email: this.email,
        password: this.password,
        keepalive: false,
      }, (error: Error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   *
   *
   * @returns {Promise<any>}
   */
  async upload(): Promise<any> {
    const folderStorage = await this.getFolderStorage()

    // eslint-disable-next-line no-return-await
    return await new Promise((resolve, reject) => {
      fs.createReadStream(this.release.file.path)
      .pipe(folderStorage.upload(this.release.file.name))
      .on('complete', (file: MutableFile) => {
        file.link({}, (error, url) => {
          if (error) {
            reject(error)
          } else {
            resolve(url)
          }
        })
      })
      .on('error', (error: Error) => {
        reject(error)
      })
    })
  }

  /**
   *
   *
   * @param {*} response
   * @returns {Promise<UrlHash>}
   */
  async parse(response: any): Promise<UrlHash> {
    return {
      cid: null,
      url: response,
    }
  }

  /**
   *
   *
   * @returns {Promise<MutableFile>}
   */
  async getFolderStorage(): Promise<MutableFile> {
    let mutable = this.storage.root

    if (this.folder) {
      const dirTree = slash(this.folder).split('/').filter(item => item.length > 0)

      for (const folderName of dirTree) {
        const existsMutable = find(mutable.children, { directory: true, name: folderName })

        if (existsMutable) {
          mutable = existsMutable as MutableFile
        } else {
          // eslint-disable-next-line no-await-in-loop
          mutable = await util.promisify(mutable.mkdir.bind(mutable))(folderName) as MutableFile
        }
      }
    }

    return mutable
  }
}
