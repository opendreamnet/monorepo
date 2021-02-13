/* eslint-disable camelcase */

import { UploadResult } from '../../types'
import { Http } from '../base/http'

/**
 *
 *
 * @export
 * @class Pinata
 * @extends {Http}
 */
export class Pinata extends Http {
  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get label(): string {
    return 'Pinata'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get uploadURL(): string {
    return 'https://api.pinata.cloud/pinning/pinFileToIPFS'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get unpinURL(): string {
    return 'https://api.pinata.cloud/pinning/unpin'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get gateway(): string {
    return process.env.DEPLOY_PINATA_GATEWAY || 'https://gateway.pinata.cloud'
  }

  /**
   *
   *
   * @param {*} response
   * @returns {Promise<UploadResult>}
   */
  public async parse(response: unknown): Promise<UploadResult> {
    return {
      // @ts-ignore
      cid: response.IpfsHash,
      // @ts-ignore
      url: `${this.gateway}/ipfs/${response.IpfsHash}`,
    }
  }

  /**
   *
   *
   */
  public createFormData(): void {
    super.createFormData()

    if (this.release.name && this.isDirectory) {
      // Root directory name.
      this.formData.append('pinataMetadata', JSON.stringify({
        name: this.release.name,
      }))
    }
  }
}
