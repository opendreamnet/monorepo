/* eslint-disable @typescript-eslint/no-empty-function */

import { isEmpty, isNil, isPlainObject } from 'lodash'
import { Multiaddress, UploadResult } from '../../types'
import { Release } from '../../modules/release'
import { getMultiaddr } from '../../modules/utils'

export interface Provider {
  /**
   * The file/folder to be uploaded.
   */
  release: Release;

  /**
   * Url of the uploaded file.
   */
  url?: string;

  /**
   * IPFS CID of the uploaded file.
   */
  cid?: string;

  /**
   * Connection multiaddress.
   */
  multi: Multiaddress

  /**
   * Connection multiaddress string.
   */
  _address: string

  /**
   * Request headers.
   */
  _headers: Record<string, unknown>;

  /**
   * Username for Basic HTTP Authorization.
   */
  _username?: string;

  /**
   * Password for Basic HTTP Authorization.
   */
  _password?: string;

  /**
   * Token for HTTP Authorization.
   */
  _token?: string;

  /**
   * Secret for HTTP Authorization.
   */
  _secret?: string;

  /**
   * Validate input.
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
   */
  pin?(): Promise<unknown>;

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
   */
  public get name(): string {
    return this.constructor.name
  }

  /**
   * Friendly provider name.
   *
   * @readonly
   */
  public get label(): string {
    return this.constructor.name
  }

  /**
   * Release location.
   *
   * @readonly
   */
  public get filepath(): string {
    return this.release.filepath
  }

  /**
   * Indicates if the release is a directory.
   *
   * @readonly
   */
  public get isDirectory(): boolean {
    return this.release.filestat.isDirectory()
  }

  /**
   * Indicates if this provider supports directory upload.
   *
   * @readonly
   */
  public get hasDirectorySupport(): boolean {
    return true
  }

  /**
   * Indicates if the provider has been prepared and is ready to use.
   *
   * @readonly
   */
  public get enabled(): boolean {
    return true
  }

  /**
   *
   *
   * @readonly
   */
  public get defaultAddress(): string | undefined {
    return undefined
  }

  /**
   * Connection multiaddress string.
   *
   * @readonly
   */
  public get address(): string | undefined {
    return this._address || process.env[`DEPLOY_${this.name.toUpperCase()}_ADDRESS`] || this.defaultAddress
  }

  /**
   * Request headers.
   *
   * @readonly
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
   * Username for Basic HTTP Authorization.
   *
   * @readonly
   */
  public get username(): string | undefined {
    return this._username || process.env[`DEPLOY_${this.name.toUpperCase()}_USERNAME`]
  }

  /**
   * Password for Basic HTTP Authorization.
   *
   * @readonly
   */
  public get password(): string | undefined {
    return this._password || process.env[`DEPLOY_${this.name.toUpperCase()}_PASSWORD`]
  }

  /**
   * Token for HTTP Authorization.
   *
   * @readonly
   */
  public get token(): string | undefined {
    return this._token ||
      process.env[`DEPLOY_${this.name.toUpperCase()}_TOKEN`] ||
      process.env[`DEPLOY_${this.name.toUpperCase()}_KEY`]
  }

  /**
   * Secret for HTTP Authorization.
   *
   * @readonly
   */
  public get secret(): string | undefined {
    return this._secret || process.env[`DEPLOY_${this.name.toUpperCase()}_SECRET`]
  }

  /**
   * Creates an instance of Base.
   *
   * @param release
   */
  public constructor(release: Release) {
    this.release = release
  }

  /**
   * @param value
   */
  public setAddress(value: string): this {
    this._address = value
    return this
  }

  /**
   *
   *
   * @param value
   */
  public setUsername(value: string): this {
    this._username = value
    return this
  }

  /**
   *
   *
   * @param value
   */
  public setPassword(value: string): this {
    this._password = value
    return this
  }

  /**
   *
   *
   * @param [value]
   */
  public setToken(value?: string): this {
    this._token = value
    return this
  }

  /**
   *
   *
   * @param [value]
   */
  public setSecret(value?: string): this {
    this._secret = value
    return this
  }

  /**
   *
   *
   * @param key
   * @param [value]
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
   */
  public async run(): Promise<UploadResult> {
    if (this.address) {
      this.multi = getMultiaddr(this.address)
    }

    if (this.validate) {
      this.validate()
    }

    if (this.setup) {
      await this.setup()
    }

    let response: unknown
    let result: UploadResult

    if (this.pin && this.release.cid) {
      try {
        this.release.emit('pin:begin', this)

        response = await this.pin()
        result = await this.parse(response)

        this.release.emit('pin:success', result, this)
      } catch (error) {
        this.release.emit('pin:fail', error, this)
        throw error
      }
    } else {
      try {
        this.release.emit('upload:begin', this)

        if (this.release.isDirectory && !this.hasDirectorySupport) {
          throw new Error(`Unable to upload a directory to ${this.name}!`)
        }

        response = await this.upload()
        result = await this.parse(response)

        this.release.emit('upload:success', result, this)
      } catch (error) {
        this.release.emit('upload:fail', error, this)
        throw error
      }
    }

    this.url = result.url
    this.cid = result.cid

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
