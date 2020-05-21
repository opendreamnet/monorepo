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
  get label(): string {
    return 'DreamLink'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get customGatewayURL(): string {
    return 'https://link.dreamnet.tech'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get customHost(): string {
    return '/dns4/api.link.dreamnet.tech/tcp/443/https'
  }
}
