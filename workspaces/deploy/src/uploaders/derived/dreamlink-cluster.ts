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
    return 'https://fs.dreamlink.cloud'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get defaultAddress(): string {
    return '/dns4/cluster.dreamlink.cloud/tcp/443/https'
  }
}
