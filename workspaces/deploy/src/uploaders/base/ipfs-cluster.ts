import CID from 'cids'
import ipfsCluster from 'ipfs-cluster-api'
import { isArray } from 'lodash'
import { DeployResult } from '../../types'
import { IPFS } from './ipfs'

export class IPFSCluster extends IPFS {
  /**
   * Friendly name.
   *
   * @readonly
   */
  public get label(): string {
    return `IPFS Cluster (${this.address})`
  }

  /**
   *
   * @readonly
   */
  public get defaultAddress(): string {
    return '/ip4/127.0.0.1/tcp/9094'
  }

  /**
   * Initialization.
   */
  public async setup(): Promise<void> {
    this.ipfs = ipfsCluster(this.options)
  }

  /**
   * Handles the provider's response when uploading a file.
   *
   * @param {*} response
   */
  public async parse(response: any): Promise<DeployResult> {
    let cid: string

    if (isArray(response)) {
      cid = new CID(response[response.length - 1].hash).toString()
    } else if (response.replication_factor_min && this.release.cid) {
      cid = this.release.cid
    } else {
      throw new Error(`IPFS Cluster invalid response: ${response}`)
    }

    return {
      cid,
      url: `${this.gatewayURL}/ipfs/${cid}`
    }
  }

  /**
   * Unpin the file.
   */
  public async unpin(): Promise<void> {
    // @ts-ignore
    await this.ipfs.pin.rm(this.release.previousCID)
  }
}
