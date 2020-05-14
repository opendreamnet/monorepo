import ipfsHttpClient, { multiaddr, globSource, CID  } from 'ipfs-http-client'
import { isEmpty } from 'lodash'
import { UrlHash } from '../../modules/interfaces'
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
   * @readonly
   * @type {string}
   * @memberof IPFSCluster
   */
  get name(): string {
    return this.host ? `IPFS (${this.host})` : super.name
  }

  /**
   *
   *
   * @type {*}
   * @memberof IPFS
   */
  ipfs?: any

  /**
   *
   *
   * @type {(string | undefined)}
   * @memberof IPFS
   */
  _gateway: string | undefined

  /**
   *
   *
   * @type {(string | undefined)}
   * @memberof IPFS
   */
  _host: string | undefined

  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof IPFS
   */
  get gateway(): string {
    return this._gateway || process.env.DEPLOY_IPFS_GATEWAY || 'https://gateway.ipfs.io'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof IPFS
   */
  get host(): string {
    return this._host || process.env.DEPLOY_IPFS_HOST || '/ip4/127.0.0.1/tcp/5001'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof IPFS
   */
  get protocol(): string {
    return this.host.includes('https') ? 'https' : 'http'
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   * @memberof IPFS
   */
  get username(): string | null {
    return this._username || process.env.DEPLOY_IPFS_USERNAME || null
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   * @memberof IPFS
   */
  get password(): string | null {
    return this._password || process.env.DEPLOY_IPFS_PASSWORD || null
  }

  /**
   *
   *
   * @readonly
   * @type {object}
   * @memberof IPFS
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
   * @readonly
   * @type {boolean}
   * @memberof IPFS
   */
  get enabled(): boolean {
    if (isEmpty(this.host)) {
      return false
    }

    if (!isEmpty(this.username) && isEmpty(this.password)) {
      return false
    }

    if (!isEmpty(this.password) && isEmpty(this.username)) {
      return false
    }

    return true
  }

  /**
   *
   *
   * @param {string} value
   * @returns
   * @memberof IPFS
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
   * @memberof IPFS
   */
  setHost(value: string): this {
    this._host = value
    return this
  }

  /**
   *
   *
   * @returns {Promise<void>}
   * @memberof IPFS
   */
  async setup(): Promise<void> {
    if (this.ipfs) {
      return
    }

    this.ipfs = ipfsHttpClient(this.options)
  }

  /**
   *
   *
   * @returns {Promise<any>}
   * @memberof IPFS
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
   * @memberof IPFS
   */
  async parse(files: any): Promise<UrlHash> {
    const hash = new CID(files[files.length - 1].cid).toString()

    return {
      cid: hash,
      url: `${this.gateway}/ipfs/${hash}`,
    }
  }

  /**
   *
   *
   * @returns {Promise<void>}
   * @memberof IPFS
   */
  async pin(): Promise<void> {
    await this.ipfs.pin.add(this.cid, { timeout: 5 * 60 * 1000 })
  }

  /**
   *
   *
   * @returns {Promise<void>}
   * @memberof IPFS
   */
  async unpin(): Promise<void> {
    await this.ipfs.pin.rm(this.release.previousCID)
  }
}
