/* eslint-disable no-await-in-loop */
import EventEmitter from 'events'
import path from 'path'
import all from 'it-all'
import { toNumber, merge, head, isEmpty, isString, startsWith } from 'lodash'
import fs from 'fs-extra'
import { AbortController } from 'node-abort-controller'
import speedometer, { SpeedometerFunc } from './speedometer'
import { getPath, is } from '@opendreamnet/app'
import CID from 'cids'
import { Link, File as IpfsFile, Peer } from '../types/ipfs'
import { IPFS } from './ipfs'
import { File } from'./file'
import { getGatewayURI, getGatewayURIS, GatewayOptions } from './utils'

export type DownloadOptions = {
  /**
   * IPFS object name. (Name of the file or directory)
   */
  name?: string
  /**
   * Download location.
   */
  directory?: string
}

export type RecordOptions = {
  /**
   * Automatically downloads the file/directory to disk. (NodeJS only)
   *
   * @default false
   */
  autoDownload?: boolean
  /**
   * Automatically requests the download of the IPFS object into the repository.
   *
   * @remarks
   * Set to false to only get the metadata.
   *
   * @default false
   */
  autoDownloadToRepo?: boolean
  /**
   * Maximum time in milliseconds to obtain the metadata.
   *
   * @default 30000
   */
  timeout?: number
} & DownloadOptions

export interface DownloadProgress {
  /**
   * Unix time when the download started.
   */
  timeStart?: number
  /**
   * Time remaining for download to complete (in milliseconds).
   */
  timeRemaining?: number
  /**
   * Time elapsed downloading files (in milliseconds).
   *
   * @readonly
   */
  timeElapsed?: number
  /**
   * Total bytes received from peers.
   */
  downloaded: number
  _speedometer?: SpeedometerFunc
  /**
   * Download speed, in bytes/sec.
   */
  speed?: number
  /**
   * Download progress, from 0 to 1.
   */
  percentage: number
}

export function isDownloadOptions(value: { [key: string]: unknown }): value is DownloadOptions {
  return value.name !== undefined || value.path !== undefined
}

/**
 * Represents an object (file/folder)
 *
 * @export
 * @class Record
 */
export class Record extends EventEmitter {
  public options: RecordOptions = {
    autoDownload: false,
    autoDownloadToRepo: false,
    timeout: 30 * 1000
  }

  /**
   * IPFS object name. (Name of the file or directory)
   */
  public get name(): string {
    return this.options.name || this.cid
  }

  /**
   * Download location.
   */
  public get dirpath(): string | undefined {
    if (!this.options.directory && is.nodeIntegration) {
      return getPath('temp', 'dreamnet', 'ipfs')
    }

    return this.options.directory
  }

  /**
   * IPFS object absolute path.
   *
   * @readonly
   */
  public get abspath(): string | undefined {
    return this.dirpath ? path.resolve(this.dirpath, this.name) : undefined
  }

  /**
   * Array of links in the IPFS object.
   */
  public links: Link[] = []

  /**
   * Array of files in the IPFS object.
   */
  public files: File[] = []

  /**
   * List of peers sharing the IPFS object.
   */
  public peers?: Peer[]

  /**
   * `File` instance if the IPFS object is not a directory.
   *
   * @readonly
   */
  public get file(): File | undefined {
    return !this.isDirectory ? head(this.files) : undefined
  }

  /**
   * Number of peers.
   */
  public numPeers(): number | undefined {
    return this.peers?.length
  }

  /**
   * Error occurred during setup.
   */
  public error?: Error

  /**
   *
   * @protected
   */
  protected abort?: AbortController

  /**
   * True when the record is ready to be used (i.e. metadata is available).
   */
  public ready = false

  /**
   * True when all the files have been downloaded.
   */
  public done = false

  /**
   * True when downloading files.
   */
  public downloading = false

  /**
   * Download progress information
   */
  public progress: DownloadProgress = {
    downloaded: 0,
    percentage: 0
  }

  /**
   * Sum of the files size (in bytes).
   */
  public size?: number

  /**
   * Sum of the files size (in bytes).
   *
   * @readonly
   */
  public get length(): number | undefined {
    return this.size
  }

  /**
   * True when the IPFS object is a directory.
   */
  public isDirectory = false

  /**
   * True when the IPFS object is stored in the node.
   */
  public isStored?: boolean

  /**
   * True when the IPFS object is pinned.
   */
  public isPinned?: boolean

  /**
   * IPFS API
   *
   * @readonly
   * @protected
   */
  protected get api(): any {
    return this.ipfs.node.api
  }

  /**
   * Creates an instance of Record.
   *
   * @param ipfs
   * @param cid
   * @param [options={}]
   */
  public constructor(public ipfs: IPFS, public cid: string, options: RecordOptions = {}) {
    super()

    // Supress warning
    this.setMaxListeners(50)

    // Make options
    this.options = merge(this.options, options)
  }

  /**
   * Returns a promise that will resolve when the record is ready.
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
   * Fetch the metadata and creates the files list.
   */
  public async setup(): Promise<void> {
    try {
      // Metadata
      await this.fetchMetadata()

      // IPFS links to [File] instances
      await this.createFiles()

      this.ready = true
      this.emit('ready')
    } catch (err) {
      this.error = err
      this.emit('error', err)
      throw err
    }

    if (is.nodeIntegration && this.options.autoDownload) {
      // Download to disk
      this.download()
    } else if (this.options.autoDownloadToRepo) {
      // Request to be stored in the repo
      this.downloadToRepo()
    }
  }

  public setName(value: string): this {
    this.options.name = value
    return this
  }

  public setOptions(options: RecordOptions): this {
    this.options = merge(this.options, options)
    return this
  }

  /**
   * Fetch the metadata of the IPFS object.
   *
   * @protected
   */
  protected async fetchMetadata(): Promise<void> {
    const workload = [
      // Links
      this.getLinks(this.cid),
      // Peers
      all(this.api.dht.findProvs(new CID(this.cid), { timeout: this.options.timeout })),
      // Stats
      this.api.object.stat(new CID(this.cid), { timeout: this.options.timeout })
    ]

    const [links, peers, stats] = await Promise.allSettled(workload)

    // Peers
    if (peers.status === 'fulfilled') {
      this.peers = peers.value
    } else {
      this.peers = undefined
    }

    // Links
    if (links.status === 'fulfilled') {
      this.links = links.value
    } else {
      // This is required!
      throw links.reason
    }

    // Size
    if (stats.status === 'fulfilled') {
      this.size = toNumber(stats.value.CumulativeSize)
    } else {
      this.size = undefined
    }

    // Is directory?
    this.isDirectory = false

    if (this.links.length > 1) {
      this.links.forEach((link) => {
        // TODO: Better way to detect directory.
        if (!isEmpty(link.name) || link.type === 'dir') {
          this.isDirectory = true
        }
      })
    }

    // Is Stored?
    if (this.ipfs.options.autoLoadRefs) {
      this.isStored = this.ipfs.isStored(this.cid)
    } else {
      this.isStored = undefined
    }

    // Is Pinned?
    if (this.ipfs.options.autoLoadPins) {
      this.isPinned = this.ipfs.isPinned(this.cid)
    } else {
      this.isPinned = undefined
    }

    this.emit('metadata')
  }

  /**
   * Returns all the links of the CID. (Subdirectories and files)
   *
   * @protected
   * @param cid
   * @param [parent]
   */
  protected async getLinks(cid: string, parent?: string): Promise<Link[]> {
    const links: Link[] = []

    for await (const link of this.api.ls(new CID(cid), { timeout: this.options.timeout }) as Link[]) {
      if (startsWith(link.path, cid)) {
        link.path = link.path.substring(cid.length + 1)
      }

      if (parent) {
        // Parent directory.
        link.path = `${parent}/${link.path}`
      }

      links.push(link)

      if (link.type === 'dir') {
        // Get the links inside the directory.
        links.push(...await this.getLinks(link.cid.toString(), link.path))
      }
    }

    return links
  }

  /**
   * Converts all file links to `File` instances.
   *
   * @protected
   */
  protected async createFiles(): Promise<void> {
    this.files = []

    if (!this.links || this.links.length === 0) {
      return
    }

    if (!this.isDirectory) {
      // The object is a file, fill with a fake link.
      this.files.push(new File(this, {
        name: this.name,
        path: this.name,
        size: this.size || -1,
        cid: this.cid,
        type: 'file',
        depth: 1
      }))

      return
    }

    for(const link of this.links) {
      if (link.type === 'dir') {
        continue
      }

      const file = new File(this, link)
      this.files.push(file)
    }
  }

  /**
   * Download the IPFS object and returns the absolute path.
   *
   * @param [options]
   */
  public async download(options?: DownloadOptions | string): Promise<string> {
    if (!is.nodeIntegration) {
      throw new Error('Only available in NodeJS.')
    }

    if (isString(options)) {
      // Convert an absolute path to valid options.
      options = {
        name: path.basename(options),
        directory: path.dirname(options)
      }
    } else {
      //
      options = merge({
        dirpath: this.dirpath,
        name: this.name
      }, options)
    }

    if (!options.directory) {
      throw new Error('Please specify dirpath.')
    }

    if (!options.name) {
      throw new Error('Please specify name.')
    }

    // Ensure that the download path exists.
    fs.ensureDirSync(options.directory)

    try {
      this.trackStart()

      if (!this.abort) {
        throw new Error('AbortController has not been initialized.')
      }

      for (const file of this.files) {
        // Absolute file path according to user parameters.
        const abspath = file.getAbsPath(options)

        file.on('progress', (bytes) => {
          this.trackProgress(bytes)
        })

        this.abort.signal.addEventListener('abort', file.stop)

        await file.writeFile(abspath)

        this.abort.signal.removeEventListener('abort', file.stop)
      }

      const abspath = path.resolve(options.directory, options.name)

      this.done = true
      this.emit('downloaded', abspath)
      this.ipfs.emit('downloaded', this)

      return abspath
    } catch (err) {
      this.emit('error', err)
      throw err
    } finally {
      this.trackFinish()
    }
  }

  /**
   * Requests the download of the IPFS object to the repository.
   */
  public async downloadToRepo(): Promise<void> {
    try {
      this.trackStart()

      if (!this.abort) {
        throw new Error('AbortController has not been initialized.')
      }

      for await(const file of this.api.get(this.cid, { signal: this.abort.signal }) as IpfsFile[]) {
        if (!file.content) {
          continue
        }

        for await (const chunk of file.content) {
          this.trackProgress(chunk.length)
        }
      }

      this.done = true
      this.emit('downloaded')
      this.ipfs.emit('downloaded', this)
    } catch (err) {
      this.emit('error', err)
    } finally {
      this.trackFinish()
    }
  }

  /**
   * Returns the URL of the record to an IPFS gateway.
   *
   * @param [options={}]
   */
  public getURL(options: GatewayOptions = {}): string {
    options = merge({ filename: this.name } as GatewayOptions, options)
    return getGatewayURI(this.cid, options).href()
  }

  /**
   * Returns a list of URLs of the record to public IPFS gateways.
   *
   * @param [options={}]
   */
  public getURLS(options: GatewayOptions = {}): string[] {
    options = merge({ filename: this.name } as GatewayOptions, options)
    return getGatewayURIS(this.cid, options).map((uri) => uri.href())
  }

  public stop(): boolean {
    if (this.abort) {
      this.abort.abort()
      this.abort = undefined

      return true
    }

    return false
  }

  public destroy(): void {
    this.stop()

    if (is.nodeIntegration && this.abspath) {
      fs.removeSync(this.abspath)
    }
  }

  protected trackStart(): void {
    if (this.downloading) {
      return
    }

    this.abort = new AbortController()
    this.downloading = true
    this.progress = {
      ...this.progress,
      downloaded: 0,
      percentage: 0,
      speed: 0,
      timeStart: Date.now(),
      _speedometer: speedometer()
    }
  }

  protected trackProgress(bytes: number): void {
    if (!this.downloading) {
      return
    }

    this.progress.downloaded += bytes

    if (this.size) {
      this.progress.percentage = toNumber(this.progress.downloaded / this.size)
    }

    if (this.progress._speedometer) {
      this.progress.speed = this.progress._speedometer(bytes)
    }


    if (this.progress.timeStart) {
      this.progress.timeElapsed = Date.now() - this.progress.timeStart
    }

    if (this.size && this.progress.timeElapsed) {
      this.progress.timeRemaining = (this.size / (this.progress.downloaded / this.progress.timeElapsed)) - this.progress.timeElapsed
    }

    this.emit('progress', bytes)
  }

  protected trackFinish(): void {
    this.downloading = false
    this.abort = undefined
    this.progress = {
      ...this.progress,
      timeRemaining: undefined,
      speed: undefined,
      _speedometer: undefined
    }
  }
}