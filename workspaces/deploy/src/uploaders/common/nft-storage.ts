import fs from 'fs'
import { AxiosRequestConfig } from 'axios'
import { DeployResult, ReleaseFile } from '../../types'
import { Http } from '../base/http'

export class NFTStorage extends Http {
  /**
   * Friendly name.
   *
   * @readonly
   */
  public get label(): string {
    return 'nft.storage'
  }

  public get defaultBaseUrl(): string | undefined {
    return 'https://api.nft.storage'
  }

  /**
   * Url to upload the file.
   *
   * @readonly
   */
  public get uploadUrl(): string {
    return '/upload'
  }

  /**
   * Url to remove the pin.
   *
   * @readonly
   */
  public get unpinUrl(): string {
    return '/'
  }

  /**
   * Url of the http gateway.
   *
   * @readonly
   */
  public get gateway(): string {
    return process.env.DEPLOY_NFTSTORAGE_GATEWAY || 'https://dweb.link'
  }

  /**
   * Upload request options.
   *
   * @readonly
   */
  public getUploadOptions(files?: ReleaseFile[]): AxiosRequestConfig {
    if (!files) {
      files = this.release.files
    }

    if (files.length > 1) {
      return super.getUploadOptions(files)
    }

    return {
      method: 'POST',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: (60 * 60 * 1000),
      url: this.uploadUrl,
      headers: this.headers,
      data: fs.createReadStream(files[0].path)
    }
  }

  /**
   * Handles the provider's response when uploading a file.
   *
   * @param {*} response
   */
  public async parse(response: any): Promise<DeployResult> {
    if (!response.ok) {
      throw new Error(response.error?.message || 'Unknown error')
    }

    return {
      cid: response.value.cid,
      url: `${this.gateway}/ipfs/${response.value.cid}`
    }
  }

  /**
   * Returns the CID of the previous release, searching by release name.
   */
  public async getPreviousCID(query: string): Promise<string | undefined> {
    if (!this.axios) {
      throw new Error('No axios!')
    }

    const response = await this.axios.get('/')

    if (!response.data.ok) {
      throw new Error(response.data.error?.message || 'Unknown error')
    }

    for (const upload of response.data.value) {
      if (upload.pin.name === query) {
        return upload.cid
      }
    }
  }
}
