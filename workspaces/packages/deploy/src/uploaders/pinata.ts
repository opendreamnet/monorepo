/* eslint-disable @typescript-eslint/camelcase */

import { UrlHash } from '../modules/types'
import { Http } from './base/http'

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
  get label(): string {
    return 'Pinata.cloud'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get uploadURL(): string {
    return 'https://api.pinata.cloud/pinning/pinFileToIPFS'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get gateway(): string {
    return process.env.DEPLOY_PINATA_GATEWAY || 'https://gateway.pinata.cloud'
  }

  /**
   *
   *
   * @readonly
   * @type {*}
   * @memberof Base
   */
  get headers(): any {
    const headers = super.headers

    headers.pinata_api_key = this.token
    headers.pinata_secret_api_key = this.secret

    return headers
  }

  /**
   *
   *
   * @param {*} response
   * @returns {Promise<UrlHash>}
   */
  async parse(response: any): Promise<UrlHash> {
    return {
      cid: response.IpfsHash,
      url: `${this.gateway}/ipfs/${response.IpfsHash}`,
    }
  }
}
