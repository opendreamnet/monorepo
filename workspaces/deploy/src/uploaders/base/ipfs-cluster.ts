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
   * @returns {Promise<unknown>}
   */
  public async upload(): Promise<unknown> {
    const files =  map(this.release.files, releaseFileToObject)

    // @ts-ignore
    const response = await this.ipfs.add(files, {
      name: this.release.name,
      recursive: true,
    })

    if (!isArray(response) || response.length === 0) {
      throw new Error(`IPFS Cluster invalid response: ${response}`)
    }

    return response
  }

  /**
   *
   *
   * @param {*} response
   * @returns {Promise<UploadResult>}
   */
  public async parse(response: unknown): Promise<UploadResult> {
    // @ts-ignore
    const cid = new CID(response[response.length - 1].hash).toString()

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
  public async pin(): Promise<void> {
    // @ts-ignore
    await this.ipfs.pin.add(this.cid, { timeout: 5 * 60 * 1000 })
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
