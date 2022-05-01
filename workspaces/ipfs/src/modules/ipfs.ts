import EventEmitter from 'events'
import path from 'path'
import { getPath, is } from '@opendreamnet/app'
import { merge, find, reject, last, attempt, set } from 'lodash'
import all from 'it-all'
import Ctl from 'ipfsd-ctl'
import fs from 'fs-extra'
import PeerId from 'peer-id'
import { ControllerOptions, AddOptions, FileContent, FileObject } from '../types/ipfs'
import * as Consts from './consts'
import { Record, RecordOptions } from './record'
import * as utils from './utils'
import { PrivateKey, PublicKey } from './keys'

export type Options = {
  /**
   * True for the node to start as soon as possible.
   *
   * @default true
   */
  autoStart?: boolean
  /**
   * True to automatically connect to recommended Cloudflare, Pinata.cloud and OpenDreamNet nodes.
   *
   * @default true
   */
  autoConnectPeers?: boolean
  /**
   * True to get the list of stored objects.
   *
   * @remarks
   * To correctly set the value of `Record.isStored`
   *
   * @default false
   */
  autoLoadRefs?: boolean
  /**
   * True to get the list of pinned files.
   *
   * @remarks
   * To set the value of `Record.isPinned`
   *
   * @default true
   */
  autoLoadPins?: boolean
  /**
   * Identity private key.
   *
   * @remarks
   * It can be a [PrivateKey] instance or a go-ipfs protobuf format.
   * This only works on a web browser node!
   */
  privateKey?: PrivateKey | Uint8Array | string
  /**
   * True to use OpenDreamNet nodes.
   *
   * @default true
   */
  opendreamnet?: boolean
  /**
   * Maximum time in milliseconds to perform optional operations
   * such as connecting to nodes, getting refs and pins.
   *
   * @default 8000
   */
  timeout?: number
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
    autoStart: true,
    autoConnectPeers: true,
    autoLoadRefs: false,
    autoLoadPins: true,
    timeout: 8000,
    controller: {}
  }

  public identity?: any

  /**
   * List of fetched IPFS objects.
   */
  public records: Record[] = []

  /**
   * List of object hashes in storage.
   */
  public refs: string[] = []

  /**
   * List of pinned files.
   */
   public pins: string[] = []

  /**
   * True when the node has been started and is ready for use.
   */
  public ready = false

  /**
   * True when the node is completely ready and the optional operations are finished.
   */
  public completed = false

  /**
   * Error occurred during setup.
   */
  public error?: Error

  /**
   * Information about the identity of the node.
   */
  public peerId?: PeerId

  /**
   * Operations for the public key.
   */
  public publicKey?: PublicKey

  /**
   * Operations for the private key.
   */
  public privateKey?: PrivateKey

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

  /**
   * Creates an instance of IPFS.
   * @param [options={}]
   */
  public constructor(options: Options = {}) {
    super()

    // Suppress warning on many listeners.
    this.setMaxListeners(50)

    this.options = merge(this.options, options)

    if (this.options.autoStart) {
      this.start()
    }
  }

  /**
   *
   *
   * @param options
   */
  public setOptions(options: Options): void {
    this.options = merge(this.options, options)
  }

  /**
   * Returns the recommended options for the node according to the platform.
   *
   * @protected
   */
  protected async makeControllerOptions(): Promise<ControllerOptions> {
    // True if we can interact with the OS files
    const useFilesystem = is.nodeIntegration && this.options.controller?.type !== 'js'

    // Default options
    const options: ControllerOptions = {
      ipfsHttpModule: require('ipfs-http-client'),
      disposable: false,
      ipfsOptions: {
        repoAutoMigrate: true
      }
    }

    if (this.options.opendreamnet) {
      // Our recommended settings
      set(options, 'ipfsOptions.EXPERIMENTAL.ipnsPubsub', true)
    }

    if (useFilesystem) {
      // go-ipfs FTW!
      options.ipfsBin = require('go-ipfs').path().replace('app.asar', 'app.asar.unpacked')

      if (this.options.controller?.disposable !== true) {
        // If we do not want to make a temporary node, then we use this default location for repo
        set(options, 'ipfsOptions.repo', process.env.IPFS_PATH || getPath('temp', 'opendreamnet', 'ipfs-repo'))
      }
    } else if (is.browser) {
      options.type = 'proc'
      options.ipfsModule = require('ipfs')

      if (this.options.opendreamnet) {
        // This node wants to use our servers
        set(options, 'ipfsOptions.config.Addresses.Swarm', Consts.WRTC_NODES)
      }
    }

    // Restore private key
    // Remember: This only works on a web browser node.
    if (this.options.privateKey) {
      const privateKey: PrivateKey = this.options.privateKey instanceof PrivateKey
        ? this.options.privateKey
        : await PrivateKey.fromProtobuf(this.options.privateKey)

      set(options, 'ipfsOptions.init.privateKey', privateKey.toProtobuf())
      set(options, 'ipfsOptions.config.Identity.PrivKey', privateKey.toProtobuf())
    }

    return merge(options, this.options.controller)
  }

  /**
   * Starts the IPFS node.
   */
  public async start(): Promise<void> {
    if (this.ready) {
      return
    }

    try {
      // Create IPFS node
      await this.createNode()

      // Load public and private keys
      await this.loadKeys()

      // Everything below is optional
      //
      this.ready = true
      this.emit('ready')

      const workload: Promise<any>[] = []

      if (this.options.autoLoadRefs) {
        // Fetch refs in storage
        workload.push(this.loadRefs())
      }

      if (this.options.autoLoadPins) {
        // Fetch pinned files
        workload.push(this.loadPins())
      }

      if (this.options.autoConnectPeers) {
        // Connect to popular peers for faster file discovery
        workload.push(this.loadPeers())
      }

      if (workload.length > 0) {
        await Promise.allSettled(workload)
      }

      // Startup completed
      this.completed = true
      this.emit('started')
    } catch (err) {
      this.error = err
      this.emit('error', err)
    }

    // A file has finished downloading
    this.on('downloaded', () => {
      attempt(() => {
        if (this.options.autoLoadRefs) {
          this.loadRefs()
        }
      })
    })

    // A file has been uploaded
    this.on('uploaded', () => {
      attempt(() => {
        if (this.options.autoLoadRefs) {
          this.loadRefs()
        }

        if (this.options.autoLoadPins) {
          this.loadPins()
        }
      })
    })
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

    // Best controller options
    const options = await this.makeControllerOptions()

    if (options.ipfsOptions?.repo && is.nodeIntegration) {
      // Make sure that the repo directory exists
      fs.ensureDirSync(options.ipfsOptions.repo)
    }

    this.options.controller = options
    this.node = await Ctl.createController(options)

    if (!this.node.initialized) {
      await this.node.init()
    }

    if (!this.node.started) {
      await this.node.start()
    }

    this.identity = await this.node.api.id()
  }

  /**
   *
   *
   * @protected
   */
  protected async loadKeys(): Promise<void> {
    const { PrivKey } = (await this.node.api.config.getAll()).Identity

    if (PrivKey) {
      this.peerId = await PeerId.createFromPrivKey(PrivKey)
      this.privateKey = new PrivateKey(this.peerId)
    } else {
      this.peerId = await PeerId.createFromPubKey(this.identity.publicKey)
    }

    this.publicKey = new PublicKey(this.peerId)
  }

  /**
   *
   *
   * @param [timeout=8000]
   */
  public async loadRefs(timeout?: number): Promise<void> {
    if (!timeout) {
      timeout = this.options.timeout
    }

    await this.waitUntilReady()

    const refs = await all(this.api.refs.local({ timeout }))

    this.refs = refs.map((item: any) => item.ref)

    this.emit('refs', this.refs)
  }

  /**
   *
   *
   * @param [timeout=8000]
   */
  public async loadPins(timeout?: number): Promise<void> {
    if (!timeout) {
      timeout = this.options.timeout
    }

    await this.waitUntilReady()

    const pins = await all(this.api.pin.ls({ type: 'recursive', timeout }))

    this.pins = pins.map((item: any) => item.cid.toString())

    this.emit('pins', this.pins)
  }

  /**
   * Connects to a list of recommended nodes:
   * - DreamNet
   * - Cloudflare
   * - Pinata.cloud
   *
   * @param [timeout=8000]
   */
  public async loadPeers(timeout?: number): Promise<PromiseSettledResult<any>[]> {
    if (!timeout) {
      timeout = this.options.timeout
    }

    await this.waitUntilReady()

    let nodes: string[] = []

    if (this.isBrowserNode) {
      if (this.options.opendreamnet) {
        nodes = Consts.WSS_NODES
      }
    } else {
      nodes = Consts.RECOMMENDED_NODES
    }

    const workload = nodes.map((link) => this.api.swarm.connect(link, { timeout })) as Promise<any>[]
    const response = Promise.allSettled(workload)

    this.emit('peers', response)

    return response
  }

  /**
   * Stops the IPFS node.
   *
   * @remarks
   * If a remote node is being used, calling this function will stop it.
   */
  public async destroy(): Promise<void> {
    if (this.node) {
      try {
        await this.node.stop()
      } catch (err) {
        // Nothing
      }
      
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
   * Returns a promise that will not be fulfilled
   * until the node has completed the startup.
   */
   public waitUntilStarted(): Promise<void> {
    if (this.completed) {
      return Promise.resolve()
    }

    if (this.error) {
      return Promise.reject(this.error)
    }

    return new Promise((resolve, reject) => {
      this.once('error', (err) => reject(err))
      this.once('started', () => resolve())
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
    await this.waitUntilStarted()

    // Check if it is in cache (Seen in this session)
    let record = this.get(cid)

    if (record) {
      await record.waitUntilReady()
      return record.setOptions(options)
    }

    // Request object and store it on cache
    record = new Record(this, cid, options)
    this.records.push(record)

    try {
      await record.setup()
    } catch (err) {
      this.remove(cid)
      throw err
    }

    this.emit('added', record)
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

    this.emit('uploaded', source)

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

    this.emit('removed', cid)
  }

  /**
   * Returns the IPFS object if it has been added with `add()`
   *
   * @param cid
   */
  public get(cid: string): Record | undefined {
    return find(this.records, { cid })
  }

  /**
   * True if the CID is already stored in the node.
   *
   * @param cid
   */
  public isStored(cid: string): boolean {
    return this.refs.includes(cid)
  }

  /**
   * True if the CID is pinned.
   *
   * @param cid
   */
   public isPinned(cid: string): boolean {
    return this.pins.includes(cid)
  }
}