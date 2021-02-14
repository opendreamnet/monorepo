/* eslint-disable no-await-in-loop */
import Cryptr from 'cryptr'
import { EventEmitter } from 'events'
import fs from 'fs-extra'
import { isArray } from 'lodash'
import mime from 'mime-types'
import normalize from 'normalize-path'
import path from 'path'
import rfs from 'recursive-fs'
import * as DnsProviders from '../dnslink'
import { DnsProvider, DnsProviderEntity } from '../dnslink'
import * as Providers from '../uploaders'
import { Provider, ProviderEntity } from '../uploaders'
import { storage } from './storage'
import { ReleaseFile, UploadResult } from '../types'
import { isProvider } from './utils'

export interface Release {
  /**
   *
   *
   * @type {string}
   */
  filepath: string;

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
  filestat: fs.Stats;

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
  public initialized = false

  /**
   *
   *
   * @type {ReleaseFile[]}
   */
  public files: ReleaseFile[] = []

  /**
   *
   *
   * @type {Provider[]}
   */
  public providers: Provider[] = []

  /**
   *
   *
   * @type {DnsProvider[]}
   */
  public dnsProviders: DnsProvider[] = []

  /**
   *
   *
   * @readonly
   * @type {boolean}
   */
  public get isDirectory(): boolean {
    return this.filestat.isDirectory()
  }

  /**
   *
   *
   * @readonly
   * @type {(ReleaseFile | null)}
   */
  public get file(): ReleaseFile | null {
    if (this.isDirectory) {
      return null
    }

    return this.files[0]
  }

  public get rootPath(): string {
    return this.files[0].relpath
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   */
  public get cid(): string | null {
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
   * @param {string} filepath
   * @param {string} [version]
   */
  public constructor(filepath: string) {
    super()

    this.filepath = path.resolve(filepath)
    this.filestat = fs.statSync(filepath)

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
  public setName(value?: string): this {
    this.name = value
    return this
  }

  /**
   *
   *
   * @param {string} value
   * @returns {this}
   */
  public setEncryptKey(value: string): this {
    this.cryptr = new Cryptr(value)
    return this
  }

  /**
   *
   *
   * @returns {this}
   */
  public clearEncryptKey(): this {
    this.cryptr = undefined
    return this
  }

  /**
   *
   *
   * @param {string} value
   * @returns {this}
   */
  public setPreviousCID(value: string): this {
    this.previousCID = value
    return this
  }

  /**
   *
   *
   * @returns {this}
   */
  public clearPreviousCID(): this {
    this.previousCID = undefined
    return this
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  public async init(): Promise<void> {
    const [files] = await Promise.all([
      this.getFiles(),
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
  protected async getFiles(): Promise<ReleaseFile[]> {
    const list: ReleaseFile[] = []

    const strip = path.dirname(this.filepath)

    // Release file/directory
    list.push({
      path: this.filepath,
      relpath: normalize(this.filepath.replace(strip, '')),
      name: path.basename(this.filepath),
      mimetype: mime.lookup(this.filepath) as string,
      stats: this.filestat,
      isDirectory: this.filestat.isDirectory(),
    })

    if (this.isDirectory) {
      const { files } = await rfs.read(this.filepath)

      files.forEach((filepath: string) => {
        filepath = path.resolve(this.filepath, filepath)

        list.push({
          path: filepath,
          relpath: normalize(filepath.replace(strip, '')),
          name: path.basename(filepath),
          mimetype: mime.lookup(filepath) as string,
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
  public addProvider(provider: ProviderEntity | ProviderEntity[]): this {
    if (isArray(provider)) {
      provider.forEach(prov => {
        this.addProvider(prov)
      })
    } else {
      try {
        if (!isProvider(provider)) {
          // @ts-ignore
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
  public addDnsProvider(provider: DnsProviderEntity | DnsProviderEntity[]): this {
    if (isArray(provider)) {
      provider.forEach(prov => {
        this.addDnsProvider(prov)
      })
    } else {
      try {
        if (!(provider instanceof DnsProvider)) {
          // @ts-ignore
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
   * @returns {Promise<UploadResult[]>}
   */
  public async deploy(): Promise<UploadResult[]> {
    if (!this.initialized) {
      await this.init()
    }

    if (this.name && !this.previousCID) {
      // Get the IPFS CID of the previous release,
      // to do unpin.
      this.previousCID = storage.get(this.name)
    }

    const response: UploadResult[] = []

    // Upload the release to each provider.
    for (const provider of this.providers) {
      try {
        const parsed = await provider.run()
        response.push(parsed)
      } catch (error) {
        this.emit('fail', error, provider)
      }
    }

    // Update DNS providers.
    for (const provider of this.dnsProviders) {
      try {
        await provider.run()
      } catch (error) {
        this.emit('fail', error, provider)
      }
    }

    if (this.name && this.cid) {
      // Store the new IPFS CID.
      storage.save(this.name, this.cid)
    }

    return response
  }
}
