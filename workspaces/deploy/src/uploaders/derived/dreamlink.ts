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
    return 'https://link.dreamnet.tech'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get defaultAddress(): string {
    return '/dns4/api.link.dreamnet.tech/tcp/443/https'
  }
}
