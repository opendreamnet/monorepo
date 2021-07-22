import { EventEmitter } from 'events'
import path from 'path'
import Cryptr from 'cryptr'
import fs from 'fs-extra'
import { isArray } from 'lodash'
import axios from 'axios'
import mime from 'mime-types'
import normalize from 'normalize-path'
import rfs from 'recursive-fs'
import * as DnsProviders from '../dnslink'
import { DnsProvider, DnsProviderEntity } from '../dnslink'
import * as Providers from '../uploaders'
import { Provider, ProviderEntity } from '../uploaders'
import { ReleaseFile, UploadResult } from '../types'
import gateways from '../data/gateways.json'
import { storage } from './storage'
import { isProvider } from './utils'

export class Release extends EventEmitter {
  /**
   *
   *
   */
  public initialized = false

  /**
   *
   *
   */
  public filepath: string

  /**
   *
   *
   */
  public name?: string

  /**
   *
   *
   */
  public version?: string

  /**
   *
   *
   */
  public cryptr?: Cryptr

  /**
   *
   *
   */
  public filestat: fs.Stats

  /**
   *
   *
   */
   public cid?: string

  /**
   *
   *
   */
  public previousCID?: string

  /**
   *
   *
   */
  public useCaching = false

  /**
   *
   *
   */
  public cacheTimeout = 5 * 1000

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

  /**
   *
   *
   * @readonly
   */
  public get rootPath(): string {
    return this.files[0].relpath
  }

  /**
   * Creates an instance of Release.
   *
   * @param filepath
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
   * @param [value]
   */
  public setName(value?: string): this {
    this.name = value
    return this
  }

  /**
   *
   *
   * @param value
   */
  public setCaching(value: boolean, timeout?: number): this {
    this.useCaching = value

    if (timeout) {
      this.cacheTimeout = timeout
    }

    return this
  }

  /**
   *
   *
   * @param value
   */
  public setEncryptKey(value: string): this {
    this.cryptr = new Cryptr(value)
    return this
  }

  /**
   *
   *
   */
  public clearEncryptKey(): this {
    this.cryptr = undefined
    return this
  }

  /**
   *
   *
   * @param value
   */
  public setPreviousCID(value: string): this {
    this.previousCID = value
    return this
  }

  /**
   *
   *
   */
  public clearPreviousCID(): this {
    this.previousCID = undefined
    return this
  }

  /**
   *
   *
   */
  public async init(): Promise<void> {
    const [files] = await Promise.all([
      this.getFiles(),
      storage.init()
    ])

    this.files = files

    this.initialized = true
  }

  /**
   *
   *
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
      isDirectory: this.filestat.isDirectory()
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
          isDirectory: false
        })
      })
    }

    return list
  }

  /**
   *
   *
   * @param provider
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
   * @param provider
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
   */
  public async deploy(): Promise<UploadResult[]> {
    if (!this.initialized) {
      await this.init()
    }

    if (this.name && !this.previousCID) {
      // Get the IPFS CID of the previous release
      this.previousCID = storage.get(this.name)
    }

    const responses: UploadResult[] = []

    // Upload the release to each provider.
    for (const provider of this.providers) {
      try {
        const response = await provider.run()
        responses.push(response)

        if (response.cid && !this.cid) {
          this.cid = response.cid
        }
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

    if (this.cid) {
      if (this.name) {
        // Store the new IPFS CID.
        storage.save(this.name, this.cid)
      }

      if (this.useCaching) {
        // Cache gateways
        await this.cacheCID()
      }
    }

    return responses
  }

  /**
   *
   *
   * @protected
   * @return {*}
   */
  protected async cacheCID(): Promise<void> {
    if (!this.cid) {
      throw new Error('Unable to cache CID. This release has not been uploaded to IPFS.')
    }

    for (const uri of gateways) {
      const url = uri.replace(':hash', this.cid)

      try {
        this.emit('cache:begin', url)

        await axios.head(url, {
          timeout: this.cacheTimeout
        })

        this.emit('cache:success', url)
      } catch (err) {
        this.emit('cache:fail', err, url)
      }
    }
  }
}
