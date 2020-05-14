import { multiaddr, CID  } from 'ipfs-http-client'
import ipfsCluster from 'ipfs-cluster-api'
import { UrlHash } from '../../modules/interfaces'
import { IPFS } from './ipfs'

/**
 *
 *
 * @export
 * @class IPFSCluster
 * @extends {IPFS}
 */
export class IPFSCluster extends IPFS {
  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof IPFSCluster
   */
  get name(): string {
    return this.host ? `IPFS Cluster (${this.host})` : super.name
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof IPFSCluster
   */
  get gateway(): string {
    return this._gateway || process.env.DEPLOY_IPFS_CLUSTER_GATEWAY || 'https://gateway.ipfs.io'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof IPFSCluster
   */
  get host(): string {
    return this._host || process.env.DEPLOY_IPFS_CLUSTER_HOST || '/ip4/127.0.0.1/tcp/9094'
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   * @memberof IPFSCluster
   */
  get username(): string | null {
    return this._username || process.env.DEPLOY_IPFS_CLUSTER_USERNAME || null
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   * @memberof IPFSCluster
   */
  get password(): string | null {
    return this._password || process.env.DEPLOY_IPFS_CLUSTER_PASSWORD || null
  }

  /**
   *
   *
   * @returns {Promise<void>}
   * @memberof IPFSCluster
   */
  async setup(): Promise<void> {
    if (this.ipfs) {
      return
    }

    this.ipfs = ipfsCluster(this.options)
  }

  /**
   *
   *
   * @returns {Promise<any>}
   * @memberof IPFSCluster
   */
  async upload(): Promise<any> {
    const response = await this.ipfs.add(this.release.files, {
      name: this.release.name,
      recursive: true,
    })

    return response
  }

  /**
   *
   *
   * @param {*} response
   * @returns {Promise<UrlHash>}
   * @memberof IPFSCluster
   */
  async parse(response): Promise<UrlHash> {
    const cid = new CID(response[response.length - 1].hash).toString()

    return {
      cid,
      url: `${this.gateway}/ipfs/${cid}`,
    }
  }

  /**
   *
   *
   * @returns {Promise<void>}
   * @memberof IPFSCluster
   */
  async pin(): Promise<void> {
    await this.ipfs.pin.add(this.cid, { timeout: 5 * 60 * 1000 })
  }

  /**
   *
   *
   * @returns {Promise<void>}
   * @memberof IPFSCluster
   */
  async unpin(): Promise<void> {
    await this.ipfs.pin.rm(this.release.previousCID)
  }
}
