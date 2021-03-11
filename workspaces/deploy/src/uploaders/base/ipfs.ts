import CID from 'cids'
import ipfsHttpClient from 'ipfs-http-client'
import { map } from 'lodash'
import { UploadResult } from '../../types'
import { Provider } from './base'
import { releaseFileToObject } from '../../modules/utils'

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
  public ipfs?: unknown

  /**
   *
   *
   * @type {string}
   */
  public _gateway?: string

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get label(): string {
    return `IPFS (${this.address})`
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get defaultGatewayURL(): string {
    return 'https://gateway.ipfs.io'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get gatewayURL(): string {
    return this._gateway || process.env[`DEPLOY_${this.name.toUpperCase()}_GATEWAY`] || this.defaultGatewayURL
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get defaultAddress(): string | undefined {
    return '/ip4/127.0.0.1/tcp/5001'
  }

  /**
   *
   *
   * @readonly
   * @type {object}
   */
  public get options(): Record<string, unknown> {
    return {
      host: this.multi.address,
      port: this.multi.port,
      protocol: this.multi.ssl ? 'https' : 'http',
      headers: this.headers,
    }
  }

  /**
   *
   *
   * @param {string} value
   * @returns
   */
  public setGateway(value: string): this {
    this._gateway = value
    return this
  }

  /**
   *
   *
   */
  public validate(): void {
    if (!this.address) {
      throw new Error(`Missing multiaddress: DEPLOY_${this.name.toUpperCase()}_ADDRESS`)
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
  public async setup(): Promise<void> {
    this.ipfs = ipfsHttpClient(this.options)
  }

  /**
   *
   *
   * @returns {Promise<any>}
   */
  public async upload(): Promise<unknown> {
    const files =  map(this.release.files, releaseFileToObject)

    // @ts-ignore
    const response = await this.ipfs.add(files, {
      name: this.release.name,
      recursive: true,
    })

    return response
  }

  /**
   *
   *
   * @return {*}
   */
  public async pin(): Promise<unknown> {
    // @ts-ignore
    return this.ipfs.pin.add(this.release.cid, {
      name: this.release.name,
      timeout: 5 * 60 * 1000,
    })
  }

  /**
   *
   *
   * @param {*} files
   * @returns {Promise<UploadResult>}
   */
  public async parse(files: unknown): Promise<UploadResult> {
    // @ts-ignore
    const cid = new CID(files.cid).toString()

    return {
      cid,
      url: `${this.gatewayURL}/ipfs/${cid}`,
    }
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  public async unpin(): Promise<void> {
    // @ts-ignore
    await this.ipfs.pin.rm(this.release.previousCID)
  }
}
