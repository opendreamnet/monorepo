import { IPFS } from './base/ipfs'

/**
 *
 *
 * @export
 * @class Infura
 * @extends {IPFS}
 */
export class Infura extends IPFS {
  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof Infura
   */
  get gatewayURL(): string {
    return process.env.DEPLOY_INFURA_GATEWAY || 'https://gateway.ipfs.io'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof Infura
   */
  get host(): string {
    return this._host || process.env.DEPLOY_INFURA_HOST || '/dns4/ipfs.infura.io/tcp/5001/https'
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   * @memberof Infura
   */
  get username(): string | null {
    return this._username || process.env.DEPLOY_INFURA_USERNAME || null
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   * @memberof Infura
   */
  get password(): string | null {
    return this._password || process.env.DEPLOY_INFURA_PASSWORD || null
  }
}
