/* eslint-disable camelcase */
import FormData from 'form-data'
import { ReleaseFile, DeployResult } from '../../types'
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
  public get uploadUrl(): string {
    return 'https://api.pinata.cloud/pinning/pinFileToIPFS'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get unpinUrl(): string {
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
   * @returns {Promise<DeployResult>}
   */
  public async parse(response: unknown): Promise<DeployResult> {
    return {
      // @ts-ignore
      cid: response.IpfsHash,
      // @ts-ignore
      url: `${this.gateway}/ipfs/${response.IpfsHash}`
    }
  }

  /**
   *
   *
   */
  public getFormData(files: ReleaseFile[]): FormData {
    const formData = super.getFormData(files)

    if (this.release.name && this.isDirectory) {
      // Root directory name.
      formData.append('pinataMetadata', JSON.stringify({
        name: this.release.name
      }))
    }

    return formData
  }
}
