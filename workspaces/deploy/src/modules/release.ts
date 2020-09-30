/* eslint-disable no-await-in-loop */
import path from 'path'
import { EventEmitter } from 'events'
import { isArray } from 'lodash'
import fs from 'fs-extra'
import rfs from 'recursive-fs'
import normalize from 'normalize-path'
import mime from 'mime-types'
import Cryptr from 'cryptr'
import * as Providers from '../uploaders'
import { Provider } from '../uploaders'
import * as DnsProviders from '../dnslink'
import { DnsProvider } from '../dnslink'
import { ReleaseFile, UrlHash, ProviderEntity, DNSProviderEntity as DnsProviderEntity } from './types'
import { isProvider } from './utils'
import { storage } from './storage'

export interface Release {
  /**
   *
   *
   * @type {string}
   */
  path: string;

  /**
   *
   *
   * @type {string}
   */
  name?: string;

  /**
   *
   *
   * @type {string}
   */
  version?: string;

  /**
   *
   *
   * @type {Cryptr}
   */
  cryptr?: Cryptr;

  /**
   *
   *
   * @type {fs.Stats}
   */
  stats: fs.Stats;

  /**
   *
   *
   * @type {string}
   */
  previousCID?: string;
}

export class Release extends EventEmitter {
  /**
   *
   *
   */
  initialized = false

  /**
   *
   *
   * @type {ReleaseFile[]}
   */
  files: ReleaseFile[] = []

  /**
   *
   *
   * @type {Provider[]}
   */
  providers: Provider[] = []

  /**
   *
   *
   * @type {DnsProvider[]}
   */
  dnsProviders: DnsProvider[] = []

  /**
   *
   *
   * @readonly
   * @type {boolean}
   */
  get isDirectory(): boolean {
    return this.stats.isDirectory()
  }

  /**
   *
   *
   * @readonly
   * @type {(ReleaseFile | null)}
   */
  get file(): ReleaseFile | null {
    if (this.isDirectory) {
      return null
    }

    return this.files[0]
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   */
  get cid(): string | null {
    for (const provider of this.providers) {
      if (provider.cid) {
        return provider.cid
      }
    }

    return null
  }

  /**
   * Creates an instance of Release.
   *
   * @param {string} releasePath
   * @param {string} [version]
   */
  constructor(releasePath: string) {
    super()

    this.path = path.resolve(releasePath)
    this.stats = fs.statSync(releasePath)

    if (process.env.DEPLOY_NAME) {
      this.setName(process.env.DEPLOY_NAME)
    }

    if (process.env.DEPLOY_ENCRYPT_KEY) {
      this.setEncryptKey(process.env.DEPLOY_ENCRYPT_KEY)
    }
  }

  /**
   *
   *
   * @param {string} value
   * @returns {this}
   */
  setName(value: string): this {
    this.name = value
    return this
  }

  /**
   *
   *
   * @param {string} value
   * @returns {this}
   */
  setEncryptKey(value: string): this {
    this.cryptr = new Cryptr(value)
    return this
  }

  /**
   *
   *
   * @returns {this}
   */
  clearEncryptKey(): this {
    this.cryptr = undefined
    return this
  }

  /**
   *
   *
   * @param {string} value
   * @returns {this}
   */
  setPreviousCID(value: string): this {
    this.previousCID = value
    return this
  }

  /**
   *
   *
   * @returns {this}
   */
  clearPreviousCID(): this {
    this.previousCID = undefined
    return this
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  async init(): Promise<void> {
    const [files] = await Promise.all([
      this._getFiles(),
      storage.init(),
    ])

    this.files = files

    this.initialized = true
  }

  /**
   *
   *
   * @returns {Promise<ReleaseFile[]>}
   */
  async _getFiles(): Promise<ReleaseFile[]> {
    const list: ReleaseFile[] = []

    const strip = path.dirname(this.path)

    // Release file/directory
    list.push({
      path: this.path,
      relpath: normalize(this.path.replace(strip, '')),
      name: path.basename(this.path),
      mimetype: mime.lookup(this.path),
      stats: this.stats,
      isDirectory: this.stats.isDirectory(),
    })

    if (this.isDirectory) {
      const { files } = await rfs.read(this.path)

      files.forEach((filepath: string) => {
        filepath = path.resolve(this.path, filepath)

        list.push({
          path: filepath,
          relpath: normalize(filepath.replace(strip, '')),
          name: path.basename(filepath),
          mimetype: mime.lookup(filepath),
          stats: fs.statSync(filepath),
          isDirectory: false,
        })
      })
    }

    return list
  }

  /**
   *
   *
   * @param {(ProviderEntity | ProviderEntity[])} provider
   * @returns {this}
   */
  addProvider(provider: ProviderEntity | ProviderEntity[]): this {
    if (isArray(provider)) {
      provider.forEach(prov => {
        this.addProvider(prov)
      })
    } else {
      try {
        if (!isProvider(provider)) {
          // eslint-disable-next-line import/namespace
          provider = new Providers[provider](this) as Provider
        }

        this.providers.push(provider)
      } catch (error) {
        this.emit('fail', error)
      }
    }

    return this
  }

  /**
   *
   *
   * @param {(DnsProviderEntity | DnsProviderEntity[])} provider
   * @returns {this}
   */
  addDnsProvider(provider: DnsProviderEntity | DnsProviderEntity[]): this {
    if (isArray(provider)) {
      provider.forEach(prov => {
        this.addDnsProvider(prov)
      })
    } else {
      try {
        if (!(provider instanceof DnsProvider)) {
          // eslint-disable-next-line import/namespace
          provider = new DnsProviders[provider](this) as DnsProvider
        }

        this.dnsProviders.push(provider)
      } catch (error) {
        this.emit('fail', error)
      }
    }

    return this
  }

  /**
   *
   *
   * @returns {Promise<UrlHash[]>}
   */
  async run(): Promise<UrlHash[]> {
    if (!this.initialized) {
      await this.init()
    }

    if (this.name) {
      this.previousCID = storage.get(this.name)
    }

    const response: UrlHash[] = []

    for (const provider of this.providers) {
      try {
        const parsed = await provider.run()
        response.push(parsed)
      } catch (error) {
        this.emit('fail', error, provider)
      }
    }

    for (const provider of this.dnsProviders) {
      try {
        await provider.run()
      } catch (error) {
        this.emit('fail', error, provider)
      }
    }

    if (this.name && this.cid) {
      storage.save(this.name, this.cid)
    }

    return response
  }
}
