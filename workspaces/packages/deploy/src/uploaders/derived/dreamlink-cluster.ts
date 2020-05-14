import { IPFSCluster } from '../base/ipfs-cluster'

export class DreamLinkCluster extends IPFSCluster {
  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof DreamLinkCluster
   */
  get name(): string {
    return 'DreamLink Cluster'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof DreamLinkCluster
   */
  get gateway(): string {
    return 'https://link.dreamnet.tech'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof DreamLinkCluster
   */
  get host(): string {
    return '/dns4/cluster.valeria.dreamnet.tech/tcp/443/https'
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   * @memberof DreamLinkCluster
   */
  get username(): string | null {
    return this._username || process.env.DEPLOY_DREAMLINK_CLUSTER_USERNAME || null
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   * @memberof DreamLinkCluster
   */
  get password(): string | null {
    return this._password || process.env.DEPLOY_DREAMLINK_CLUSTER_PASSWORD || null
  }
}
