import fs from 'fs'
import { cloneDeep, isArray } from 'lodash'
import { CID  } from 'ipfs-http-client'
import ipfsCluster from 'ipfs-cluster-api'
import { UrlHash } from '../../modules/types'
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
   */
  get label(): string {
    return this.host ? `IPFS Cluster (${this.host})` : super.name
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get customHost(): string {
    return '/ip4/127.0.0.1/tcp/9094'
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  async setup(): Promise<void> {
    this.ipfs = ipfsCluster(this.options)
  }

  /**
   *
   *
   * @returns {Promise<any>}
   */
  async upload(): Promise<any> {
    const files = cloneDeep(this.release.files).map(file => {
      if (!file.isDirectory) {
        file.content = fs.createReadStream(file.path)
        file.path = file.relpath
      }

      return file
    })

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
   * @returns {Promise<UrlHash>}
   */
  async parse(response): Promise<UrlHash> {
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
  async pin(): Promise<void> {
    await this.ipfs.pin.add(this.cid, { timeout: 5 * 60 * 1000 })
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  async unpin(): Promise<void> {
    await this.ipfs.pin.rm(this.release.previousCID)
  }
}
