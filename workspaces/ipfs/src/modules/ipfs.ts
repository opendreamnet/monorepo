import EventEmitter from 'events'
import { getPath, is } from '@opendreamnet/app'
import { merge, attempt, set, isString, isArray, isFunction, find, some, reject, isNil, noop } from 'lodash'
import all from 'it-all'
import Ctl from 'ipfsd-ctl'
import type { Controller, ControllerOptions } from 'ipfsd-ctl'
import fs from 'fs-extra'
import PeerId from 'peer-id'
import * as ipfsHttpClient from 'ipfs-http-client'
import type * as ipfs from 'ipfs'
import { CID } from 'multiformats'
import { Multiaddr } from 'multiaddr'
import type { AddAllOptions, IDResult } from 'ipfs-core-types/types/src/root'
import type { AbortOptions, ImportCandidate, ImportCandidateStream } from 'ipfs-core-types/types/src/utils'
import type { AddOptions, RmOptions } from 'ipfs-core-types/types/src/pin'
import * as Consts from './consts'
import { Entry, IEntryOptions } from './entry'
import * as utils from './utils'
import { PrivateKey, PublicKey } from './keys'

export interface IOptions {
  /**
   * True for the node to start as soon as possible.
   *
   * @default true
   */
  start?: boolean
  /**
   * True to automatically connect to recommended Cloudflare, Pinata.cloud and OpenDreamNet nodes.
   *
   * @default true
   */
  connectPeers?: boolean
  /**
   * True to get the list of stored objects.
   *
   * @remarks
   * To correctly set the value of `Record.isStored`
   *
   * @default false
   */
  loadRefs?: boolean
  /**
   * True to get the list of pinned files.
   *
   * @remarks
   * To set the value of `Record.isPinned`
   *
   * @default true
   */
  loadPins?: boolean
  /**
   * Identity private key.
   *
   * @remarks
   * It can be a [PrivateKey] instance or a go-ipfs protobuf format.
   * NOTE: This only works on a web browser node!
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
   * @default 15000
   */
  timeout?: number
  /**
   * IPFS controller options.
   */
  controller?: ControllerOptions
  /**
   * Multiaddr API to connect to an external IPFS node.
   */
  apiAddr?: Multiaddr | string
}

export type CIDInput = CID | string

export type AddInput = ImportCandidate | ImportCandidate[] | ImportCandidateStream | FileList

export class IPFS extends EventEmitter {
  /**
   * IPFS Node.
   */
  public node?: Controller

  /**
   * IPFS options.
   */
  public options: IOptions = {
    opendreamnet: true,
    start: true,
    connectPeers: true,
    loadRefs: false,
    loadPins: true,
    timeout: 15000,
    controller: {}
  }

  /**
   * IPFS Node identity.
   */
  public identity?: IDResult

  /**
   * List of entries hashes in repo storage.
   */
  public refs: CID[] = []

  /**
   * List of pinned entries.
   */
  public pins: CID[] = []

  /**
   * True when the node has been started.
   */
  public started = false

  /**
   * True when the node is completely ready.
   */
  public ready = false

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
   *
   *
   * @protected
   */
  protected customPrivateKey?: PrivateKey

  /**
   * Entries on cache.
   */
  public cache: Record<string, Entry[]> = {}

  /**
   * IPFS API
   *
   * @readonly
   */
  public get api(): ipfs.IPFS | undefined {
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
    return isNil(this.node?.apiAddr)
  }

  /**
   * Creates an instance of IPFS.
   *
   * @param [options={}]
   */
  public constructor(options: IOptions = {}) {
    super()

    this.setOptions(options)

    if (this.options.start) {
      this.start()
    }
  }

  /**
   *
   *
   * @param options
   */
  public setOptions(options: IOptions): void {
    this.options = merge(this.options, options)
  }

  /**
   * Returns the recommended options for the node according to the platform.
   *
   * @protected
   */
  protected async makeControllerOptions(): Promise<ControllerOptions> {
    const defaultType = is.nodeIntegration ? 'go' : 'proc'

    // Default options
    const options: ControllerOptions = {
      disposable: false,
      type: this.options.controller?.type || defaultType,
      ipfsHttpModule: ipfsHttpClient,
      ipfsBin: this.options.controller?.ipfsBin,
      ipfsModule: this.options.controller?.ipfsModule,
      ipfsOptions: {
        start: false,
        init: false,
        repoAutoMigrate: true
      }
    }

    if (this.options.opendreamnet) {
      // Recommended settings
      set(options, 'ipfsOptions.EXPERIMENTAL.ipnsPubsub', true)

      // Pubsub
      set(options, 'ipfsOptions.config.Pubsub.Enabled', true)
    }

    // go-ipfs
    // Fast, safe and reliable.
    // Only NodeJS.
    if (options.type === 'go') {
      if (!options.ipfsBin) {
        options.ipfsBin = process.env.IPFS_GO_EXEC
      }

      if (!options.ipfsBin) {
        try {
          options.ipfsBin = (await import('go-ipfs')).path().replace('app.asar', 'app.asar.unpacked')
        } catch (err: any) { }
      }

      if (this.options.controller?.disposable !== true) {
        // If we do not want to make a temporary node, then we use this default location for repo
        set(options, 'ipfsOptions.repo', process.env.IPFS_PATH || await getPath('home', '.ipfs'))
      }
    }

    // js-ipfs
    // Like go-ipfs but in JavaScript.
    // Only NodeJS.
    if (options.type === 'js') {
      if (!options.ipfsBin) {
        options.ipfsBin = process.env.IPFS_JS_EXEC
      }

      if (!options.ipfsBin) {
        try {
          options.ipfsBin = (await import('ipfs')).path().replace('app.asar', 'app.asar.unpacked')
        } catch (err: any) { }
      }
    }

    // js-ipfs (proc)
    // In-memory node, compatible with web browsers.
    if (options.type === 'proc') {
      if (!options.ipfsModule) {
        try {
          options.ipfsModule = await import('ipfs')
        } catch (err: any) { }
      }
    }

    if (options.type === 'js' || options.type === 'proc') {
      if (this.options.opendreamnet) {
        // Recommended
        set(options, 'ipfsOptions.relay.enabled', true)
        set(options, 'ipfsOptions.config.Discovery.MDNS.Enabled', true)

        // WebRTC
        if (options.type === 'js') {
          set(options, 'ipfsOptions.config.Addresses.Swarm', [...Consts.SWARM_JS_ADDRS, ...Consts.SWARM_WRTC_ADDRS])
        } else {
          set(options, 'ipfsOptions.config.Addresses.Swarm', Consts.SWARM_WRTC_ADDRS)
        }

        // Preload
        set(options, 'ipfsOptions.preload.enabled', true)
        set(options, 'ipfsOptions.preload.addresses', Consts.PRELOAD_NODES)

        // Delegate
        set(options, 'ipfsOptions.config.Addresses.Delegates', Consts.DELEGATES_NODES)

        // Bootstrap
        set(options, 'ipfsOptions.config.Bootstrap', Consts.BOOTSTRAP_NODES)
      }
    }

    // Restore private key
    // NOTE: This only works on a web browser node.
    if (this.options.privateKey) {
      this.customPrivateKey = this.options.privateKey instanceof PrivateKey
        ? this.options.privateKey
        : await PrivateKey.fromProtobuf(this.options.privateKey)

      set(options, 'ipfsOptions.init.privateKey', this.customPrivateKey.toProtobuf())
      set(options, 'ipfsOptions.config.Identity.PrivKey', this.customPrivateKey.toProtobuf())
    }

    return merge(options, this.options.controller)
  }

  /**
   * Starts the IPFS node.
   */
  public async start(options: IOptions = {}): Promise<void> {
    if (this.started) {
      return
    }

    this.setOptions(options)

    // Create IPFS node
    await this.create()

    // Load public and private keys
    await this.loadKeys()

    // Started!
    this.started = true
    this.emit('started')

    // Optional load
    this.load()
  }

  /**
   * Load optional preparations.
   *
   * @protected
   */
  protected async load(): Promise<void> {
    try {
      const workload: Promise<any>[] = []

      if (this.options.loadRefs) {
        // Fetch refs in storage
        workload.push(this.loadRefs())
      }

      if (this.options.loadPins) {
        // Fetch pinned files
        workload.push(this.loadPins())
      }

      if (this.options.connectPeers) {
        // Connect to popular peers for faster file discovery
        workload.push(this.loadPeers())
      }

      if (workload.length > 0) {
        await Promise.allSettled(workload)
      }

      // Loaded and ready
      this.ready = true
      this.emit('ready')
    } catch (err) {
      this.error = err
      this.emit('error', err)
    }

    // A file has finished downloading
    this.on('downloaded', () => {
      attempt(() => {
        if (this.options.loadRefs) {
          this.loadRefs()
        }
      })
    })

    // A file has been uploaded
    this.on('uploaded', () => {
      attempt(() => {
        if (this.options.loadRefs) {
          this.loadRefs()
        }

        if (this.options.loadPins) {
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
  protected async create(): Promise<void> {
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

    if (!options.remote && this.options.apiAddr) {
      // Little hack to allow custom API address.
      if (isString(this.options.apiAddr)) {
        this.options.apiAddr = new Multiaddr(this.options.apiAddr)
      }

      // @ts-ignore
      this.node._setApi(this.options.apiAddr)
      if (options.type !== 'proc') {
        // @ts-ignore
        this.node._createApi()
      }
      this.node.started = true
      // @ts-ignore
      this.node.api.peerId = await this.node.api.id()
    } else {
      if (!this.node.initialized) {
        await this.node.init()
      }

      if (!this.node.started) {
        console.time('node-start')
        await this.node.start()
        console.timeEnd('node-start')
      }
    }

    // @ts-ignore
    this.identity = this.node.api.peerId
  }

  /**
   * Loads the public and private key of the node.
   *
   * @protected
   */
  protected async loadKeys(): Promise<void> {
    if (!this.api) {
      throw new Error('IPFS api undefined!')
    }

    const { Identity } = await this.api.config.getAll()
    let protoPrivateKey: Uint8Array | string | undefined = Identity?.PrivKey

    if (!protoPrivateKey && this.customPrivateKey && this.customPrivateKey?.peerId === this.identity?.id) {
      // Node has not provided the private key, but the one specified in options is correct, use that one
      protoPrivateKey = this.customPrivateKey.toProtobuf()
    }

    if (protoPrivateKey) {
      this.peerId = await PeerId.createFromPrivKey(protoPrivateKey)
      this.privateKey = new PrivateKey(this.peerId)
    } else {
      if (!this.identity) {
        throw new Error('IPFS identity undefined!')
      }

      this.peerId = await PeerId.createFromPubKey(this.identity.publicKey)
    }

    this.publicKey = new PublicKey(this.peerId)
  }

  /**
   * Loads the hashes of the stored entries.
   *
   * @param [timeout=8000]
   */
  public async loadRefs(timeout?: number): Promise<CID[]> {
    if (!this.api) {
      throw new Error('IPFS api undefined!')
    }

    if (!timeout) {
      timeout = this.options.timeout
    }

    await this.waitUntil('started')

    const refs = await all(this.api.refs.local({ timeout }))

    this.refs = refs.map((item) => CID.parse(item.ref))
    this.emit('refs', this.refs)

    return this.refs
  }

  /**
   * Loads the pinned entries.
   *
   * @param [timeout=8000]
   */
  public async loadPins(timeout?: number): Promise<CID[]> {
    if (!this.api) {
      throw new Error('IPFS api undefined!')
    }

    if (!timeout) {
      timeout = this.options.timeout
    }

    await this.waitUntil('started')

    const pins = await all(this.api.pin.ls({ type: 'recursive', timeout }))

    this.pins = pins.map((item) => item.cid)
    this.emit('pins', this.pins)

    return this.pins
  }

  /**
   * Connects to a list of recommended nodes:
   * - Cloudflare
   * - Pinata.cloud
   * - NFT.Storage
   * - Web3.Storage
   * - Protocol Labs
   *
   * @param [timeout=8000]
   */
  public async loadPeers(timeout?: number): Promise<PromiseSettledResult<any>[]> {
    if (!this.api) {
      throw new Error('IPFS api undefined!')
    }

    if (!timeout) {
      timeout = this.options.timeout
    }

    await this.waitUntil('started')

    let nodes: string[] = []

    if (!this.isBrowserNode) {
      // Go/JS
      // This should just work
      nodes = Consts.BOOTSTRAP_NODES
    } else {
      // Proc
      //

      nodes = Consts.BOOTSTRAP_NODES.filter((value) => value.includes('/ws'))

      /*
      const resolvers = await import('multiaddr/src/resolvers')
      Multiaddr.resolvers.set('dnsaddr', resolvers.dnsaddrResolver)

      for(const addr of Consts.BOOTSTRAP_NODES) {
        let maddr: Multiaddr | undefined = new Multiaddr(addr)

        if (addr.includes('dnsaddr')) {
          try {
            const results = await maddr.resolve()
            maddr = find<Multiaddr>(results, (value) => value.toString().includes('tcp'))

            if (!maddr) {
              continue
            }
          } catch (err: any) {
            continue
          }
        }
        nodes.push(maddr.toString())
      }
      */
    }

    // const workload = nodes.map((link) => this.api!.swarm.connect(link, { timeout })) as Promise<any>[]

    const workload: Promise<any>[] = []

    console.log({ nodes })

    for (const addr of nodes) {
      workload.push(this.api.swarm.connect(addr, { timeout }))
    }

    const response = Promise.allSettled(workload)

    response.then((value) => this.emit('peers', value)).catch(noop)
    return response
  }

  /**
   * Stops the IPFS node.
   *
   * @remarks
   * If a remote node is being used, calling this function will stop it.
   */
  public async stop(): Promise<void> {
    if (this.node) {
      try {
        await this.node.stop()
      } catch (err) {
        // Nothing
      }

      this.node = undefined
    }
  }

  /**
   * Returns a promise that will not be fulfilled
   * until the event is fired.
   */
  public waitUntil(event: string): Promise<any> {
    if (this[event] === true) {
      return Promise.resolve()
    }

    if (this.error) {
      return Promise.reject(this.error)
    }

    return new Promise((resolve, reject) => {
      this.once('error', (err) => reject(err))
      this.once(event, (value) => resolve(value))
    })
  }

  /**
   * Creates an [Entry] from the CID.
   * If an array is specified, it will be wrapped in a folder and returns the [Entry] of the folder.
   *
   * @param cid
   * @param [options={}]
   */
  public async fromCID(cid: CIDInput | CIDInput[], options: IEntryOptions = {}): Promise<Entry> {
    await this.waitUntil('started')

    let input: CID | CID[]

    if (isArray(cid)) {
      // Convert string array to [CID] array
      input = cid.map(value => {
        if (isString(value)) {
          return CID.parse(value)
        }

        return value
      })
    } else {
      if (isString(cid)) {
        // Convert string to [CID]
        input = CID.parse(cid)
      } else {
        input = cid
      }
    }

    return Entry.fromCID(this, input, options)
  }

  /**
   * Creates an [Entry] from the path in MFS.
   *
   * @param path
   * @param [options={}]
   */
  public async fromMFS(path: string, options: IEntryOptions = {}): Promise<Entry> {
    await this.waitUntil('started')
    return Entry.fromMFS(this, path, options)
  }

  /**
   * Add data or a file to the IPFS node.
   *
   * @param input
   * @param [options={}]
   */

  public async add(input: AddInput, options: AddAllOptions & AbortOptions = {}, entryOptions: IEntryOptions = {}): Promise<Entry> {
    await this.waitUntil('started')

    if (!this.api) {
      throw new Error('IPFS api undefined!')
    }

    let source: ImportCandidateStream

    if (isFunction(input)) {
      // @ts-ignore
      source = input
    } else {
      // Convert the source to [ImportCandidateStream]
      // @ts-ignore
      source = utils.inputToCandidateStream(input)
    }

    // Add and get the entries.
    const entries = await all(this.api.addAll(source, options))

    if (entries.length === 0) {
      throw new Error('The add did not return any results.')
    }

    this.emit('added', input)

    // The last result is always the root (if it is a directory).
    return this.fromCID(entries[entries.length - 1].cid, entryOptions)
  }

  /**
   * True if the CID is already stored in the node.
   *
   * @param cid
   */
  public isStored(cid: string | CID): boolean {
    if (isString(cid)) {
      cid = CID.parse(cid)
    }

    return some(this.refs, (value) => value.equals(cid))
  }

  /**
   *
   *
   * @param input
   * @param [options]
   */
  public async pin(input: string | CID | Entry, options?: AddOptions): Promise<void> {
    if (!this.api) {
      throw new Error('IPFS api undefined!')
    }

    // Convert to [CID]
    if (isString(input)) {
      input = CID.parse(input)
    } else if (input instanceof Entry) {
      input = input.cid
    }

    if (this.isPinned(input)) {
      // Already pinned
      return
    }

    await this.api.pin.add(input, options)

    // Add to list
    this.pins.push(input)
  }

  /**
   *
   *
   * @param input
   * @param [options]
   */
  public async unpin(input: string | CID | Entry, options?: RmOptions): Promise<void> {
    if (!this.api) {
      throw new Error('IPFS api undefined!')
    }

    // Convert to [CID]
    if (isString(input)) {
      input = CID.parse(input)
    } else if (input instanceof Entry) {
      input = input.cid
    }

    if (!this.isPinned(input)) {
      // Not pinned
      return
    }

    await this.api.pin.rm(input, options)

    this.pins = reject<CID>(this.pins, (value) => value.equals(input))
  }

  /**
   * True if the CID is pinned.
   *
   * @param cid
   */
  public isPinned(cid: string | CID): boolean {
    if (isString(cid)) {
      cid = CID.parse(cid)
    }

    return some(this.pins, (value) => value.equals(cid))
  }

  public addToCache(entry: Entry, name = 'default'): void {
    if (this.getFromCache(entry.cid.toString(), name)) {
      // Already on cache
      return
    }

    this.cache[name].push(entry)
  }

  public getFromCache(cid: string | CID, name = 'default'): Entry | undefined {
    if (!isString(cid)) {
      cid = cid.toString()
    }

    if (!this.cache[name]) {
      // Initialize
      this.cache[name] = []
      return undefined
    }

    return find(this.cache[name], { identifier: cid })
  }
}