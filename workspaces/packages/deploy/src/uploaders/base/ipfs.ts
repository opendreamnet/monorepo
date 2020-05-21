import ipfsHttpClient, { multiaddr, globSource, CID  } from 'ipfs-http-client'
import { isEmpty } from 'lodash'
import { UrlHash } from '../../modules/types'
import { Provider } from './base'

/**
 *
 *
 * @export
 * @class IPFS
 * @extends {Provider}
 */
export class IPFS extends Provider {
  /**
   *
   *
   * @type {*}
   */
  ipfs?: any

  /**
   *
   *
   * @type {string}
   */
  _gateway?: string

  /**
   *
   *
   * @type {string}
   */
  _host?: string

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get label(): string {
    return this.host ? `IPFS (${this.host})` : super.label
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get gatewayURL(): string {
    return this._gateway || process.env[`DEPLOY_${this.name.toUpperCase()}_GATEWAY`] || this.customGatewayURL
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get customGatewayURL(): string {
    return 'https://gateway.ipfs.io'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get host(): string {
    return this._host || process.env[`DEPLOY_${this.name.toUpperCase()}_HOST`] || this.customHost
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get customHost(): string {
    return '/ip4/127.0.0.1/tcp/5001'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get protocol(): string {
    return this.host.includes('https') ? 'https' : 'http'
  }

  /**
   *
   *
   * @readonly
   * @type {object}
   */
  get options(): object {
    const addr = multiaddr(this.host).nodeAddress()

    return {
      host: addr.address,
      port: addr.port,
      protocol: this.protocol,
      headers: this.headers,
    }
  }

  /**
   *
   *
   * @param {string} value
   * @returns
   */
  setGateway(value: string): this {
    this._gateway = value
    return this
  }

  /**
   *
   *
   * @param {string} value
   * @returns
   */
  setHost(value: string): this {
    this._host = value
    return this
  }

  /**
   *
   *
   */
  validate(): void {
    if (!this.host) {
      throw new Error(`Missing host: DEPLOY_${this.name.toUpperCase()}_HOST`)
    }

    if ((!this.username && this.password) || (!this.password && this.username)) {
      throw new Error(`Missing credentials:

DEPLOY_${this.name.toUpperCase()}_USERNAME
DEPLOY_${this.name.toUpperCase()}_PASSWORD`)
    }
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  async setup(): Promise<void> {
    this.ipfs = ipfsHttpClient(this.options)
  }

  /**
   *
   *
   * @returns {Promise<any>}
   */
  async upload(): Promise<any> {
    const files: any[] = []

    for await (const file of this.ipfs.add(globSource(this.release.path, { recursive: true }))) {
      files.push(file)
    }

    return files
  }

  /**
   *
   *
   * @param {*} files
   * @returns {Promise<UrlHash>}
   */
  async parse(files: any): Promise<UrlHash> {
    const hash = new CID(files[files.length - 1].cid).toString()

    return {
      cid: hash,
      url: `${this.gatewayURL}/ipfs/${hash}`,
    }
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  async pin(): Promise<void> {
    await this.ipfs.pin.add(this.cid, { timeout: 5 * 60 * 1000 })
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  async unpin(): Promise<void> {
    await this.ipfs.pin.rm(this.release.previousCID)
  }
}
