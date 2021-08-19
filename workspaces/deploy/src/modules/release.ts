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
import { ReleaseFile, DeployResult } from '../types'
import gateways from '../data/gateways.json'
import { isProvider } from './utils'

export class Release extends EventEmitter {
  /**
   * True if initialized.
   */
  public initialized = false

  /**
   * Absolute file path.
   */
  public filepath: string

  /**
   * File information.
   */
   public filestat: fs.Stats

  /**
   * Release name.
   *
   * @remarks
   * Used to search for past versions and unpin it.
   */
  public name: string

  /**
   * Cryptr instance to encrypt the results.
   *
   * @remarks
   * Used for example for early access/paid releases.
   */
  public cryptr?: Cryptr

  /**
   * Release CID.
   */
   public cid?: string

  /**
   * Release previous CID.
   */
  public previousCID?: string

  /**
   * True to find the CID of the previous release and unpin it.
   *
   * @remarks
   * Recommended to specify a name with `setName()` and not change it.
   */
  public unpinPrevious = false

  /**
   * True to do caching of the file on public IPFS gateways.
   */
  public useCaching = false

  /**
   * Cache attempt timeout.
   */
  public cachingTimeout = 5 * 1000

  /**
   *
   */
  public files: ReleaseFile[] = []

  /**
   *
   */
  public providers: Provider[] = []

  /**
   *
   */
  public dnsProviders: DnsProvider[] = []

  /**
   * True if the release is a directory.
   *
   * @readonly
   */
  public get isDirectory(): boolean {
    return this.filestat.isDirectory()
  }

  /**
   * ReleaseFile instance if it is a file, not a directory.
   *
   * @readonly
   */
  public get file(): ReleaseFile | null {
    if (this.isDirectory) {
      return null
    }

    return this.files[0]
  }

  /**
   * Path of the root directory.
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
    } else {
      this.setName(path.basename(this.filepath))
    }

    if (process.env.DEPLOY_ENCRYPT_KEY) {
      this.setEncryptKey(process.env.DEPLOY_ENCRYPT_KEY)
    }
  }

  /**
   *
   * @param [value]
   */
  public setName(value: string): this {
    this.name = value
    return this
  }

  /**
   *
   * @param value
   */
  public setUnpinPrevious(value: boolean): this {
    this.unpinPrevious = value
    return this
  }

  /**
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
   * @param value
   */
  public setCaching(value: boolean, timeout?: number): this {
    this.useCaching = value

    if (timeout) {
      this.cachingTimeout = timeout
    }

    return this
  }

  /**
   *
   * @param value
   */
  public setEncryptKey(value: string): this {
    this.cryptr = new Cryptr(value)
    return this
  }

  /**
   *
   */
  public clearEncryptKey(): this {
    this.cryptr = undefined
    return this
  }

  /**
   * Initialization.
   */
  public async init(): Promise<void> {
    this.files = await this.getFiles()
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
        throw error
      }
    }

    return this
  }

  /**
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
   * Upload the release to all providers.
   */
  public async deploy(): Promise<DeployResult[]> {
    if (!this.initialized) {
      await this.init()
    }

    const responses: DeployResult[] = []

    // Upload to each provider.
    for (const provider of this.providers) {
      try {
        const response = await provider.deploy()
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

    if (this.cid && this.useCaching) {
      // Cache on public gateways.
      await this.cacheCID()
    }

    return responses
  }

  /**
   *
   *
   * @protected
   */
  protected async cacheCID(): Promise<void> {
    if (!this.cid) {
      throw new Error('No CID!')
    }

    for (const uri of gateways) {
      const url = uri.replace(':hash', this.cid)

      try {
        this.emit('cache:begin', url)

        await axios.head(url, {
          timeout: this.cachingTimeout
        })

        this.emit('cache:success', url)
      } catch (err) {
        this.emit('cache:fail', err, url)
      }
    }
  }
}
