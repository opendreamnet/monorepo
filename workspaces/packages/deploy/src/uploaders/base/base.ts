/* eslint-disable @typescript-eslint/no-empty-function */

import { isEmpty, isPlainObject, isNil } from 'lodash'
import { Release } from '../../modules/release'
import { UrlHash } from '../../modules/interfaces'

export interface Provider {
  /**
   *
   *
   * @type {Release}
   */
  release: Release;

  /**
   *
   *
   * @type {(string | null)}
   */
  url?: string;

  /**
   *
   *
   * @type {(string | null)}
   */
  cid?: string;

  /**
   *
   *
   * @type {*}
   */
  _headers: any;

  /**
   *
   *
   * @type {(string | null)}
   */
  _username?: string;

  /**
   *
   *
   * @type {(string | null)}
   */
  _password?: string;

  /**
   *
   *
   * @type {(string | null)}
   */
  _token?: string;

  /**
   *
   *
   * @type {(string | null)}
   */
  _secret?: string;

  /**
   *
   *
   * @memberof Provider
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
   * @returns {Promise<any>}
   */
  upload(): Promise<any>;

  /**
   *
   *
   * @param {*} response
   * @returns {Promise<UrlHash>}
   */
  parse(response): Promise<UrlHash>;

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
   *
   *
   * @readonly
   * @type {string}
   */
  get name(): string {
    return this.constructor.name
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get label(): string {
    return this.constructor.name
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get path(): string {
    return this.release.path
  }

  /**
   *
   *
   * @readonly
   * @type {boolean}
   */
  get isDirectory(): boolean {
    return this.release.stats.isDirectory()
  }

  /**
   *
   *
   * @readonly
   * @type {boolean}
   */
  get hasDirectorySupport(): boolean {
    return true
  }

  /**
   *
   *
   * @readonly
   * @type {boolean}
   */
  get enabled(): boolean {
    return true
  }

  /**
   *
   *
   * @readonly
   * @type {*}
   */
  get headers(): any {
    const headers: any = {}

    if (!isEmpty(this.username) && !isEmpty(this.password)) {
      const token = Buffer.from(`${this.username}:${this.password}`).toString('base64')
      headers.Authorization = `Basic ${token}`
    }

    return {
      ...headers,
      ...this._headers,
    }
  }

  /**
   *
   *
   * @readonly
   * @type {(string | undefined)}
   */
  get username(): string | undefined {
    return this._username || process.env[`DEPLOY_${this.name.toUpperCase()}_USERNAME`]
  }

  /**
   *
   *
   * @readonly
   * @type {(string | undefined)}
   */
  get password(): string | undefined {
    return this._password || process.env[`DEPLOY_${this.name.toUpperCase()}_PASSWORD`]
  }

  /**
   *
   *
   * @readonly
   * @type {(string | undefined)}
   */
  get token(): string | undefined {
    return this._token || process.env[`DEPLOY_${this.name.toUpperCase()}_TOKEN`] || process.env[`DEPLOY_${this.name.toUpperCase()}_KEY`]
  }

  /**
   *
   *
   * @readonly
   * @type {(string | undefined)}
   */
  get secret(): string | undefined {
    return this._secret || process.env[`DEPLOY_${this.name.toUpperCase()}_SECRET`]
  }

  /**
   * Creates an instance of Base.
   *
   * @param {Release} release
   */
  constructor(release: Release) {
    this.release = release
  }

  /**
   *
   *
   * @param {string} value
   * @returns {this}
   */
  setUsername(value: string): this {
    this._username = value
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
   * @param {(string)} [value]
   * @returns {this}
   */
  setToken(value?: string): this {
    this._token = value
    return this
  }

  /**
   *
   *
   * @param {(string)} value
   * @returns {this}
   */
  setSecret(value?: string): this {
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
  setHeader(key: string|object, value?: string|null): this {
    if (isPlainObject(key)) {
      this._headers = key
    } else if (isNil(value)) {
      delete this._headers[key as string]
    } else {
      this._headers[key as string] = value
    }

    return this
  }

  /**
   *
   *
   * @returns {Promise<UrlHash>}
   */
  async run(): Promise<UrlHash> {
    let parsed: UrlHash

    try {
      this.release.emit('upload_begin', this)

      if (!this.hasDirectorySupport && this.release.isDirectory) {
        throw new Error(`You can't upload a directory to ${this.name}!`)
      }

      if (this.validate) {
        this.validate()
      }

      if (this.setup) {
        await this.setup()
      }

      const response = await this.upload()

      parsed = await this.parse(response)

      this.release.emit('upload_success', parsed, this)
    } catch (error) {
      this.release.emit('upload_fail', error, this)
      throw error
    }

    this.url = parsed.url
    this.cid = parsed.cid

    try {
      if (this.pin) {
        this.release.emit('pin_begin', this)

        await this.pin()

        this.release.emit('pin_success', this.cid, this)
      }
    } catch (error) {
      this.release.emit('pin_fail', error, this)
      throw error
    }

    try {
      if (this.unpin && this.release.previousCID && this.release.previousCID !== this.cid) {
        this.release.emit('unpin_begin', this)

        await this.unpin()

        this.release.emit('unpin_success', this)
      }
    } catch (error) {
      this.release.emit('unpin_fail', error, this)
      throw error
    }

    return {
      provider: this.constructor.name,
      url: this.url,
      cid: this.cid,
    }
  }
}
