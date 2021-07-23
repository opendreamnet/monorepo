import { IPFS } from '../base/ipfs'

/**
 *
 *
 * @export
 * @class DreamLink
 * @extends {IPFS}
 */
export class DreamLink extends IPFS {
  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get label(): string {
    return 'DreamLink'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get defaultGatewayURL(): string {
    return 'https://fs.dreamlink.cloud'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get defaultAddress(): string {
    return '/dns4/api.dreamlink.cloud/tcp/443/https'
  }
}
