/* eslint-disable @typescript-eslint/no-empty-function */

import { isEmpty, isNil, isPlainObject } from 'lodash'
import { Multiaddress, DeployResult } from '../../types'
import { Release } from '../../modules/release'
import { getMultiaddr } from '../../modules/utils'

export interface Provider {
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
   * Initialization.
   */
  setup?(): Promise<void>;

  /**
   * Upload the file.
   */
  upload(): Promise<unknown>;

  /**
   * Handles the provider's response when uploading a file.
   */
  parse(response: unknown): Promise<DeployResult>;

  /**
   * Pin the file that has already been uploaded
   * to another IPFS provider.
   *
   * @remarks
   * This prevents the file from being uploaded multiple times.
   */
  pin?(): Promise<unknown>;

  /**
   * Returns the CID of the previous release, searching by name.
   */
  // getPreviousCID?(): Promise<string>

  /**
   * Unpin the file.
   */
  unpin?(): Promise<void>;
}

export class Provider {
  /**
   * Provider name.
   *
   * @readonly
   */
  public get name(): string {
    return this.constructor.name
  }

  /**
   * Friendly name.
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
   * True if the release is a directory.
   *
   * @readonly
   */
  public get isDirectory(): boolean {
    return this.release.filestat.isDirectory()
  }

  /**
   * True if this provider supports directory upload.
   *
   * @readonly
   */
  public get hasDirectorySupport(): boolean {
    return true
  }

  /**
   * True if the provider is ready to use.
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
      ...this._headers
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
   * @param release The file/folder to be uploaded.
   */
  public constructor(public release: Release) {
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
   * Upload the release.
   */
  public async deploy(): Promise<DeployResult> {
    if (this.address) {
      this.multi = getMultiaddr(this.address)
    }

    if (this.validate) {
      // Input validation
      this.validate()
    }

    if (this.setup) {
      await this.setup()
    }

    let response: any
    let result: DeployResult

    // Upload/Pin
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

    // Unpin
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
      name: this.name,
      url: this.url,
      cid: this.cid,
      response
    }
  }
}

export type ProviderEntity = Provider | string
