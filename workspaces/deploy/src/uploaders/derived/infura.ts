import { IPFS } from '../base/ipfs'

/**
 *
 *
 * @export
 * @class Infura
 * @extends {IPFS}
 */
export class Infura extends IPFS {
  public get gatewayURL(): string {
    return process.env.DEPLOY_INFURA_GATEWAY || 'https://gateway.ipfs.io'
  }

  /**
   *
   *
   * @readonly
   * @type {(string | undefined)}
   */
  public get defaultAddress(): string | undefined {
    return '/dns4/ipfs.infura.io/tcp/5001/https'
  }
}
