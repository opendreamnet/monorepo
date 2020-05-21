import { IPFSCluster } from '../base/ipfs-cluster'

export class DreamLinkCluster extends IPFSCluster {
  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get label(): string {
    return 'DreamLink Cluster'
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
    return '/dns4/cluster.link.dreamnet.tech/tcp/443/https'
  }
}
