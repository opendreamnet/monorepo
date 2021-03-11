import CID from 'cids'
import ipfsCluster from 'ipfs-cluster-api'
import { map, isArray } from 'lodash'
import { UploadResult } from '../../types'
import { IPFS } from './ipfs'
import { releaseFileToObject } from '../../modules/utils'

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
   */
  public get label(): string {
    return `IPFS Cluster (${this.address})`
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get defaultAddress(): string {
    return '/ip4/127.0.0.1/tcp/9094'
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  public async setup(): Promise<void> {
    this.ipfs = ipfsCluster(this.options)
  }

  /**
   *
   *
   * @param {*} response
   * @returns {Promise<UploadResult>}
   */
  public async parse(response: unknown): Promise<UploadResult> {
    let cid: string

    if (isArray(response)) {
      cid = new CID(response[response.length - 1].hash).toString()
    // @ts-ignore
    } else if (response.replication_factor_min && this.release.cid) {
      cid = this.release.cid
    } else {
      throw new Error(`IPFS Cluster invalid response: ${response}`)
    }

    return {
      cid,
      url: `${this.gatewayURL}/ipfs/${cid}`,
    }
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  public async unpin(): Promise<void> {
    // @ts-ignore
    await this.ipfs.pin.rm(this.release.previousCID)
  }
}
