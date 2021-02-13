/* eslint-disable @typescript-eslint/no-empty-function */

import { isEmpty, isNil, isPlainObject } from 'lodash'
import { Multiaddress, UploadResult } from '../../types'
import { Release } from '../../modules/release'
import { getMultiaddr } from '../../modules/utils'

export interface Provider {
  /**
   * The file/folder to be uploaded
   *
   * @type {Release}
   */
  release: Release;

  /**
   * Url of the uploaded file
   *
   * @type {(string | null)}
   */
  url?: string;

  /**
   * IPFS CID of the uploaded file
   *
   * @type {(string | null)}
   */
  cid?: string;

  /**
   * Connection multiaddress
   *
   * @type {Multiaddress}
   */
  multi: Multiaddress

  /**
   * Connection multiaddress string
   *
   * @type {string}
   */
  _address: string

  /**
   * Headers for the request
   *
   * @type {unknown}
   */
  _headers: Record<string, unknown>;

  /**
   * Username for Basic HTTP Authorization
   *
   * @type {(string | null)}
   */
  _username?: string;

  /**
   * Password for Basic HTTP Authorization
   *
   * @type {(string | null)}
   */
  _password?: string;

  /**
   * Token for HTTP Authorization
   *
   * @type {(string | null)}
   */
  _token?: string;

  /**
   * Secret for HTTP Authorization
   *
   * @type {(string | null)}
   */
  _secret?: string;

  /**
   * Validate that the required information is correct
   */
  validate?(): void;

  /**
   *
   *
   * @returns {Promise<void>}
   */
  setup?(): Promise<void>;

  /**
   *
   *
   * @returns {Promise<unknown>}
   */
  upload(): Promise<unknown>;

  /**
   *
   *
   * @param {*} response
   * @returns {Promise<UploadResult>}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parse(response: unknown): Promise<UploadResult>;

  /**
   *
   *
   * @returns {Promise<void>}
   */
  pin?(): Promise<void>;

  /**
   *
   *
   * @returns {Promise<void>}
   * @memberof Provider
   */
  unpin?(): Promise<void>;
}

export class Provider {
  /**
   * Provider's technical name.
   *
   * @readonly
   * @type {string}
   */
  public get name(): string {
    return this.constructor.name
  }

  /**
   * Friendly provider name.
   *
   * @readonly
   * @type {string}
   */
  public get label(): string {
    return this.constructor.name
  }

  /**
   * Release location.
   *
   * @readonly
   * @type {string}
   */
  public get filepath(): string {
    return this.release.filepath
  }

  /**
   * Indicates if the release is a directory.
   *
   * @readonly
   * @type {boolean}
   */
  public get isDirectory(): boolean {
    return this.release.filestat.isDirectory()
  }

  /**
   * Indicates if this provider supports directory upload.
   *
   * @readonly
   * @type {boolean}
   */
  public get hasDirectorySupport(): boolean {
    return true
  }

  /**
   * Indicates if the provider has been prepared and is ready to use.
   *
   * @readonly
   * @type {boolean}
   */
  public get enabled(): boolean {
    return true
  }

  /**
   *
   *
   * @readonly
   * @type {(string | undefined)}
   */
  public get defaultAddress(): string | undefined {
    return undefined
  }

  /**
   * Connection multiaddress string
   *
   * @readonly
   * @type {(string | undefined)}
   */
  public get address(): string | undefined {
    return this._address || process.env[`DEPLOY_${this.name.toUpperCase()}_ADDRESS`] || this.defaultAddress
  }

  /**
   * Headers for the request.
   *
   * @readonly
   * @type {Record<string, unknown>}
   */
  public get headers(): Record<string, unknown> {
    const headers: Record<string, unknown> = {}

    if (!isEmpty(this.username) && !isEmpty(this.password)) {
      // Basic HTTP Authorization
      const token = Buffer.from(`${this.username}:${this.password}`).toString('base64')
      headers.Authorization = `Basic ${token}`
    }

    if (!isEmpty(this.token) && isEmpty(this.secret)) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return {
      ...headers,
      ...this._headers,
    }
  }

  /**
   * Username for Basic HTTP Authorization
   *
   * @readonly
   * @type {(string | undefined)}
   */
  public get username(): string | undefined {
    return this._username || process.env[`DEPLOY_${this.name.toUpperCase()}_USERNAME`]
  }

  /**
   * Password for Basic HTTP Authorization
   *
   * @readonly
   * @type {(string | undefined)}
   */
  public get password(): string | undefined {
    return this._password || process.env[`DEPLOY_${this.name.toUpperCase()}_PASSWORD`]
  }

  /**
   * Token for HTTP Authorization
   *
   * @readonly
   * @type {(string | undefined)}
   */
  public get token(): string | undefined {
    return this._token ||
      process.env[`DEPLOY_${this.name.toUpperCase()}_TOKEN`] ||
      process.env[`DEPLOY_${this.name.toUpperCase()}_KEY`]
  }

  /**
   * Secret for HTTP Authorization
   *
   * @readonly
   * @type {(string | undefined)}
   */
  public get secret(): string | undefined {
    return this._secret || process.env[`DEPLOY_${this.name.toUpperCase()}_SECRET`]
  }

  /**
   * Creates an instance of Base.
   *
   * @param {Release} release
   */
  public constructor(release: Release) {
    this.release = release
  }

  /**
   *
   *
   * @param {string} value
   * @return {*}  {this}
   */
  public setAddress(value: string): this {
    this._address = value
    return this
  }

  /**
   *
   *
   * @param {string} value
   * @returns {this}
   */
  public setUsername(value: string): this {
    this._username = value
    return this
  }

  /**
   *
   *
   * @param {string} value
   * @returns {this}
   */
  public setPassword(value: string): this {
    this._password = value
    return this
  }

  /**
   *
   *
   * @param {(string)} [value]
   * @returns {this}
   */
  public setToken(value?: string): this {
    this._token = value
    return this
  }

  /**
   *
   *
   * @param {(string)} value
   * @returns {this}
   */
  public setSecret(value?: string): this {
    this._secret = value
    return this
  }

  /**
   *
   *
   * @param {(string|object)} key
   * @param {string} [value]
   * @returns {this}
   */
  public setHeader(key: string | Record<string, unknown>, value?: string): this {
    if (isPlainObject(key)) {
      this._headers = key as Record<string, unknown>
    } else if (isNil(value)) {
      delete this._headers[key as string]
    } else {
      this._headers[key as string] = value
    }

    return this
  }

  /**
   * Upload the release to the provider.
   *
   * @returns {Promise<UploadResult>}
   */
  public async run(): Promise<UploadResult> {
    let result: UploadResult

    try {
      this.release.emit('upload:begin', this)

      if (this.release.isDirectory && !this.hasDirectorySupport) {
        throw new Error(`You can't upload a directory to ${this.name}!`)
      }

      if (this.address) {
        this.multi = getMultiaddr(this.address)
      }

      if (this.validate) {
        this.validate()
      }

      if (this.setup) {
        await this.setup()
      }

      const response = await this.upload()

      result = await this.parse(response)

      this.release.emit('upload:success', result, this)
    } catch (error) {
      this.release.emit('upload:fail', error, this)
      throw error
    }

    this.url = result.url
    this.cid = result.cid

    if (this.pin) {
      try {
        this.release.emit('pin:begin', this)

        await this.pin()

        this.release.emit('pin:success', this.cid, this)
      } catch (error) {
        this.release.emit('pin:fail', error, this)
        throw error
      }
    }

    if (this.unpin && this.release.previousCID && this.release.previousCID !== this.cid) {
      try {
        this.release.emit('unpin:begin', this)

        await this.unpin()

        this.release.emit('unpin:success', this)
      } catch (error) {
        this.release.emit('unpin:fail', error, this)
        throw error
      }
    }

    return {
      provider: this.name,
      url: this.url,
      cid: this.cid,
    }
  }
}

export type ProviderEntity = Provider | string
