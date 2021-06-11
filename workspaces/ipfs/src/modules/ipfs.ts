import EventEmitter from 'events'
import path from 'path'
import { getPath, is } from '@opendreamnet/app'
import { merge, find, reject, last } from 'lodash'
import all from 'it-all'
import Ctl from 'ipfsd-ctl'
import fs from 'fs-extra'
import { ControllerOptions, AddOptions, FileContent, FileObject } from '../types/ipfs'
// import gateways from '../data/ipfs-gateways.json'
import { Record, RecordOptions } from './record'
import * as utils from './utils'

export type Options = {
  /**
   * True to use OpenDreamNet nodes.
   *
   * @default true
   */
  opendreamnet?: boolean
  /**
   * True to automatically connect to recommended Cloudflare, Pinata.cloud and DreamNet nodes.
   *
   * @default true
   */
  autoConnectPeers?: boolean
  /**
   * IPFS controller options.
   */
  controller?: ControllerOptions
}

export type UploadSource = File | Buffer | FileContent

export class IPFS extends EventEmitter {
  /**
   * IPFS Node.
   */
  public node: any

  /**
   * IPFS options.
   */
  public options: Options = {
    opendreamnet: true,
    autoConnectPeers: true,
    controller: {}
  }

  public identity?: any

  /**
   * List of initialized IPFS objects.
   */
  public records: Record[] = []

  /**
   * True when the node has been started and is ready for use.
   */
  public ready = false

  /**
   * Error occurred during setup.
   */
  public error?: Error

  /**
   * IPFS API
   *
   * @readonly
   */
  public get api(): any {
    return this.node?.api
  }

  /**
   * True if it is a limited IPFS node in the web browser.
   *
   * @remarks
   * https://github.com/ipfs/js-ipfs/blob/6870873f0696bb5d8d91fce4a4ef1f7420443993/docs/FAQ.md
   *
   * @readonly
   */
  public get isBrowserNode(): boolean {
    return is.browser && this.node?.opts?.type === 'proc'
  }

  public constructor(options: Options = {}) {
    super()
    this.setMaxListeners(50)

    this.options = merge(this.options, options)
    this.setup()
  }

  /**
   * Returns the recommended options for the node according to the platform.
   *
   * @protected
   */
  protected getControllerOptions(): ControllerOptions {
    const useFilesystem = is.nodeIntegration && this.options.controller?.type !== 'js'

    const options: ControllerOptions = {
      ipfsHttpModule: require('ipfs-http-client'),
      disposable: false
    }

    if (useFilesystem) {
      options.ipfsBin = require('go-ipfs').path().replace('app.asar', 'app.asar.unpacked')

      if (this.options.controller?.disposable !== true) {
        options.ipfsOptions = {
          repo: process.env.IPFS_PATH || getPath('temp', 'dreamnet', 'ipfs-repo')
        }
      }
    } else if (is.browser) {
      options.type = 'proc'
      options.ipfsModule = require('ipfs')

      if (this.options.opendreamnet) {
        options.ipfsOptions = {
          config: {
            Addresses: {
              Swarm: [
                // OpenDreamNet
                '/dns4/node1-wrtc.dreamlink.cloud/tcp/443/wss/p2p-webrtc-star'
              ],
              Delegates: [
                // OpenDreamNet (Web Gateway)
                '/dns4/node1.dreamlink.cloud/tcp/443/https',

                // IPFS
                '/dns4/node0.delegate.ipfs.io/tcp/443/https',
                '/dns4/node1.delegate.ipfs.io/tcp/443/https',
                '/dns4/node2.delegate.ipfs.io/tcp/443/https',
                '/dns4/node3.delegate.ipfs.io/tcp/443/https'
              ]
            }
          },
          /*
          preload: {
            addresses: [
              // OpenDreamNet (Web Gateway)
              '/dns4/node1.dreamlink.cloud/tcp/443/https',

              // IPFS
              '/dns4/node0.preload.ipfs.io/https',
              '/dns4/node1.preload.ipfs.io/https',
              '/dns4/node2.preload.ipfs.io/https',
              '/dns4/node3.preload.ipfs.io/https'
            ]
          },
          */
          EXPERIMENTAL: {
            ipnsPubsub: true
          }
        }
      }
    }

    return merge(options, this.options.controller)
  }

  /**
   * Starts the IPFS node.
   */
  public async setup(): Promise<void> {
    if (this.ready) {
      return
    }

    try {
      await this.createNode()

      this.ready = true
      this.emit('ready')

      if (this.options.autoConnectPeers) {
        await this.connectPeers()
      }
    } catch (err) {
      this.error = err
      this.emit('error', err)
    }
  }

  /**
   * Create and start the IPFS node.
   *
   * @protected
   */
  protected async createNode(): Promise<void> {
    if (this.node) {
      return
    }

    const options = this.getControllerOptions()

    if (options.ipfsOptions?.repo && is.nodeIntegration) {
      // Make sure that the repo directory exists.
      fs.ensureDirSync(options.ipfsOptions?.repo)
    }

    this.options.controller = options

    this.node = await Ctl.createController(options)

    if (!this.node.initialized) {
      await this.node.init()
    }

    if (!this.node.started) {
      await this.node.start()
    }

    if (!this.node.api) {
      throw new Error('IPFS node cannot be created.')
    }

    this.identity = await this.node.api.id()
  }

  /**
   * Connects to a list of recommended nodes:
   * - DreamNet
   * - Cloudflare
   * - Pinata.cloud
   *
   * @param [timeout=8000]
   */
  public async connectPeers(timeout = 8000): Promise<PromiseSettledResult<any>[]> {
    await this.waitUntilReady()

    let nodes: string[] = []

    if (this.isBrowserNode) {
      if (this.options.opendreamnet) {
        nodes = [
          // OpenDreamNet (Swarm Websocket)
          '/dns4/node1-ws.dreamlink.cloud/tcp/443/wss/p2p/12D3KooWAuvHjmNSAxekkpqp9c5Hgcht7JJcZjQDjGUuLvYUDLPe'
        ]
      }
    } else {
      nodes = [
        // Cloudflare
        '/ip4/172.65.0.13/tcp/4009/p2p/QmcfgsJsMtx6qJb74akCw1M24X1zFwgGo11h1cuhwQjtJP',

        // Pinata.cloud
        '/dnsaddr/nyc1-1.hostnodes.pinata.cloud',
        '/dnsaddr/nyc1-2.hostnodes.pinata.cloud',
        '/dnsaddr/nyc1-3.hostnodes.pinata.cloud'
      ]

      if (this.options.opendreamnet) {
        // OpenDreamNet
        nodes.push('/dnsaddr/node1.dreamlink.cloud', '/dnsaddr/node2.dreamlink.cloud')
      }
    }

    const workload = nodes.map((link) => this.api.swarm.connect(link, { timeout })) as Promise<any>[]

    return Promise.allSettled(workload)
  }

  /**
   * Stops the IPFS node.
   *
   * @remarks
   * If a remote node is being used, calling this function will stop it.
   */
  public async destroy(): Promise<void> {
    if (this.node) {
      await this.node.stop()
      this.node = undefined
    }

    if (is.nodeIntegration && this.options.controller?.ipfsOptions?.repo) {
      // Always make sure to delete this file
      fs.removeSync(path.resolve(this.options.controller.ipfsOptions.repo, 'api'))
    }
  }

  /**
   * Returns a promise that will not be fulfilled
   * until the node is ready for use.
   */
  public waitUntilReady(): Promise<void> {
    if (this.ready) {
      return Promise.resolve()
    }

    if (this.error) {
      return Promise.reject(this.error)
    }

    return new Promise((resolve, reject) => {
      this.once('error', (err) => reject(err))
      this.once('ready', () => resolve())
    })
  }

  /**
   * Start downloading an IPFS object.
   *
   * @param cid
   * @param [options={}]
   * @returns Promise to be fulfilled when the object's metadata has been obtained.
   */
  public async add(cid: string, options: RecordOptions = {}): Promise<Record> {
    await this.waitUntilReady()

    let record = this.get(cid)

    if (record) {
      await record.waitUntilReady()
      return record.setOptions(options)
    }

    record = new Record(this, cid, options)

    this.records.push(record)

    try {
      await record.setup()
    } catch (err) {
      this.remove(cid)
      throw err
    }

    return record
  }

  /**
   * Upload data or a file to the IPFS node.
   *
   * @param source
   * @param [options={}]
   * @return CID of the uploaded object.
   */
  public async upload(source: UploadSource | UploadSource[] | FileList, options: AddOptions = {}): Promise<string> {
    await this.waitUntilReady()

    // Convert the source to a list of files that we can upload.
    const files: FileObject[] = await utils.sourceToFileObject(source)

    // Upload and get the results.
    const items = await all(this.node.api.addAll(files, options)) as any[]

    if (items.length === 0) {
      throw new Error('The upload did not return any results.')
    }

    // The last result is always the root (if it is a directory).
    return last(items).cid.toString()
  }

  /**
   * Upload data or a file to the IPFS node.
   *
   * @remarks
   * `upload()` and `seed()` are the same, the only difference is that `seed()` returns a `Record` object.
   *
   * @param source
   * @param [options={}]
   * @param [recordOptions={}]
   */
  public async seed(source: UploadSource | UploadSource[] | FileList, options: AddOptions = {}, recordOptions: RecordOptions = {}): Promise<Record> {
    const cid = await this.upload(source, options)
    return await this.add(cid, recordOptions)
  }

  /**
   * Removes an IPFS object and stops any active download.
   *
   * @param cid
   * @param destroy Delete the file/directory?
   */
  public remove(cid: string, destroy = true): void {
    const record = find(this.records, { cid })

    if (!record) {
      return
    }

    if (destroy) {
      record.destroy()
    } else {
      record.stop()
    }

    this.records = reject(this.records, { cid })
  }

  /**
   * Returns the IPFS object if it has been added with `add()`
   *
   * @param cid
   */
  public get(cid: string): Record | undefined {
    return find(this.records, { cid })
  }
}