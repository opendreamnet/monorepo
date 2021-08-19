import CID from 'cids'
import * as ipfsHttpClient from 'ipfs-http-client'
import { map } from 'lodash'
import { DeployResult } from '../../types'
import { releaseFileToObject } from '../../modules/utils'
import { Provider } from './base'

export class IPFS extends Provider {
  /**
   * IPFS Client.
   *
   * @type {*}
   */
  public ipfs?: ReturnType<typeof ipfsHttpClient.create>

  /**
   *
   *
   * @type {string}
   */
  public _gateway?: string

  /**
   * Friendly name.
   *
   * @readonly
   */
  public get label(): string {
    return `IPFS (${this.address})`
  }

  /**
   *
   *
   * @readonly
   */
  public get defaultGatewayURL(): string {
    return 'https://dweb.link'
  }

  /**
   *
   *
   * @readonly
   */
  public get gatewayURL(): string {
    return this._gateway || process.env[`DEPLOY_${this.name.toUpperCase()}_GATEWAY`] || this.defaultGatewayURL
  }

  /**
   *
   *
   * @readonly
   */
  public get defaultAddress(): string | undefined {
    return '/ip4/127.0.0.1/tcp/5001'
  }

  /**
   * IPFS Options.
   *
   * @readonly
   */
  public get options(): Record<string, unknown> {
    return {
      host: this.multi.address,
      port: this.multi.port,
      protocol: this.multi.ssl ? 'https' : 'http',
      headers: this.headers
    }
  }

  /**
   *
   *
   * @param {string} value
   */
  public setGateway(value: string): this {
    this._gateway = value
    return this
  }

  /**
   * Input validation.
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
   * Initialization.
   */
  public async setup(): Promise<void> {
    this.ipfs = ipfsHttpClient.create(this.options)
  }

  /**
   * Upload the file.
   */
  public async upload(): Promise<unknown> {
    if (!this.ipfs) {
      throw new Error('No IPFS!')
    }

    const files =  map(this.release.files, releaseFileToObject)

    // @ts-ignore
    const response = await this.ipfs.add(files, {
      name: this.release.name,
      recursive: true
    })

    return response
  }

  /**
   * Pin the file that has already been uploaded
   * to another IPFS provider.
   *
   * @remarks
   * This prevents the file from being uploaded multiple times.
   */
  public async pin(cid: string): Promise<any> {
    if (!this.ipfs) {
      throw new Error('No IPFS!')
    }

    return this.ipfs.pin.add(new CID(cid), {
      timeout: 5 * 60 * 1000
    })
  }

  /**
   * Handles the provider's response when uploading a file.
   */
  public async parse(files: any): Promise<DeployResult> {
    const cid = new CID(files.cid).toString()

    return {
      cid,
      url: `${this.gatewayURL}/ipfs/${cid}`
    }
  }

  /**
   * Unpin the file.
   */
  public async unpin(cid: string): Promise<void> {
    if (!this.ipfs) {
      throw new Error('No IPFS!')
    }

    await this.ipfs.pin.rm(cid)
  }
}
