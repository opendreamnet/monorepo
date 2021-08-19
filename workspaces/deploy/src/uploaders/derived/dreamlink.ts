import { IPFS } from '../base/ipfs'

export class DreamLink extends IPFS {
  /**
   * Friendly name.
   *
   * @readonly
   */
  public get label(): string {
    return 'DreamLink'
  }

  /**
   *
   *
   * @readonly
   */
  public get defaultGatewayURL(): string {
    return 'https://fs.dreamlink.cloud'
  }

  /**
   *
   *
   * @readonly
   */
  public get defaultAddress(): string {
    return '/dns4/api.dreamlink.cloud/tcp/443/https'
  }
}
