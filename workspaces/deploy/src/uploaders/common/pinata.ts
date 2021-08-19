/* eslint-disable camelcase */
import FormData from 'form-data'
import { ReleaseFile, DeployResult } from '../../types'
import { Http } from '../base/http'

export class Pinata extends Http {
  /**
   * Friendly name.
   *
   * @readonly
   */
  public get label(): string {
    return 'pinata.cloud'
  }

  public get defaultBaseUrl(): string | undefined {
    return 'https://api.pinata.cloud'
  }

  /**
   * Url to upload the file.
   *
   * @readonly
   */
  public get uploadUrl(): string {
    return '/pinning/pinFileToIPFS'
  }

  /**
   * Url to remove the pin.
   *
   * @readonly
   */
  public get unpinUrl(): string {
    return '/pinning/unpin'
  }

  /**
   * Url of the http gateway.
   *
   * @readonly
   */
  public get gateway(): string {
    return process.env.DEPLOY_PINATA_GATEWAY || 'https://gateway.pinata.cloud'
  }

  /**
   * Handles the provider's response when uploading a file.
   *
   * @param {*} response
   */
  public async parse(response: any): Promise<DeployResult> {
    const cid = response.IpfsHash || response.ipfsHash

    return {
      cid,
      url: `${this.gateway}/ipfs/${cid}`
    }
  }

  /**
   * Pin the file that has already been uploaded
   * to another IPFS provider.
   *
   * @remarks
   * This prevents the file from being uploaded multiple times.
   */
  public async pin(cid: string): Promise<any> {
    if (!this.axios) {
      throw new Error('No axios!')
    }

    const data: Record<string, any> = {
      hashToPin: cid
    }

    if (this.release.name) {
      data.pinataMetadata = {
        name: this.release.name
      }
    }

    const response = await this.axios.post('/pinning/pinByHash', data, {
      timeout: (5 * 60 * 1000)
    })

    return response.data
  }

  /**
   * Returns the CID of the previous release, searching by release name.
   */
  public async getPreviousCID(query: string): Promise<string | undefined> {
    if (!this.axios) {
      throw new Error('No axios!')
    }

    const response = await this.axios.get('/data/pinList', {
      params: {
        status: 'pinned',
        'metadata[name]': query
      }
    })

    if (response.data.count === 0) {
      return undefined
    }

    const upload = response.data.rows[0]

    return upload.ipfs_pin_hash
  }

  /**
   *
   */
  public getFormData(files: ReleaseFile[]): FormData {
    const formData = super.getFormData(files)

    if (this.release.name) {
      // Root directory name.
      formData.append('pinataMetadata', JSON.stringify({
        name: this.release.name
      }))
    }

    return formData
  }
}
