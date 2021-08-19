import { Web3Storage as Web3StorageClient, getFilesFromPath } from 'web3.storage'
import { DeployResult } from '../../types'
import { Provider } from '../base/base'

export class Web3Storage extends Provider {
  public client?: Web3StorageClient

  /**
   * Friendly name.
   *
   * @readonly
   */
  public get label(): string {
    return 'web3.storage'
  }

  /**
   * Url of the http gateway.
   *
   * @readonly
   */
  public get gateway(): string {
    return process.env.DEPLOY_WEB3STORAGE_GATEWAY || 'https://dweb.link'
  }

  /**
   * Validate input.
   */
  public validate(): void {
    if (!this.token) {
      throw new Error(`Missing token: DEPLOY_${this.name.toUpperCase()}_TOKEN`)
    }
  }

  /**
   * Provider initialization.
   */
  public async setup(): Promise<void> {
    if (!this.token) {
      throw new Error('No token!')
    }

    this.client = new Web3StorageClient({
      token: this.token
    })
  }

  public async upload(): Promise<unknown> {
    if (!this.client) {
      throw new Error('No client!')
    }

    const files = await getFilesFromPath(this.filepath)
    // @ts-ignore
    const cid = await this.client.put(files)

    return cid
  }

  public async unpin(): Promise<void> {
    if (!this.client) {
      throw new Error('No client!')
    }

    if (!this.release.previousCID) {
      throw new Error('No previous CID!')
    }

    await this.client.delete(this.release.previousCID)
  }

  /**
   * Handles the provider's response when uploading a file.
   *
   * @param {*} response
   */
  public async parse(cid: any): Promise<DeployResult> {
    return {
      cid,
      url: `${this.gateway}/ipfs/${cid}`
    }
  }
}
