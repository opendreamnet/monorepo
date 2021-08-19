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

  /**
   * Url to upload and pin a file.
   *
   * @readonly
   */
  public get uploadUrl(): string {
    return 'https://api.nft.storage/upload'
  }

  /**
   * Url to remove the pin.
   *
   * @readonly
   */
  public get unpinUrl(): string {
    return 'https://api.nft.storage/'
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
}
