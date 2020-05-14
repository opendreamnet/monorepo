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
   * @memberof DreamLink
   */
  get gateway(): string {
    return 'https://link.dreamnet.tech'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof DreamLink
   */
  get host(): string {
    return '/dns4/api.valeria.dreamnet.tech/tcp/443/https'
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   * @memberof DreamLink
   */
  get username(): string | null {
    return this._username || process.env.DEPLOY_DREAMLINK_USERNAME || null
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   * @memberof DreamLink
   */
  get password(): string | null {
    return this._password || process.env.DEPLOY_DREAMLINK_PASSWORD || null
  }
}
