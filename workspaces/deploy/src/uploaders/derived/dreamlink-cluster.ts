import { IPFSCluster } from '../base/ipfs-cluster'

export class DreamLinkCluster extends IPFSCluster {
  /**
   * Friendly name.
   *
   * @readonly
   */
  public get label(): string {
    return 'DreamLink Cluster'
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
    return '/dns4/cluster.dreamlink.cloud/tcp/443/https'
  }
}
