import { IPFSCluster } from '../base/ipfs-cluster'

export class DreamLinkCluster extends IPFSCluster {
  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get label(): string {
    return 'DreamLink Cluster'
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
    return '/dns4/cluster.link.dreamnet.tech/tcp/443/https'
  }
}
