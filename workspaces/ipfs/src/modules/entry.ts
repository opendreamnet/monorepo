
import EventEmitter from 'events'
import * as stream from 'stream'
import path from 'path'
import fs from 'fs-extra'
import { CID } from 'multiformats/cid'
import type { Mtime } from 'ipfs-unixfs'
import type { IPFSEntry } from 'ipfs-core-types/src/root'
import type { StatResult } from 'ipfs-core-types/src/object/index'
import type { QueryEvent } from 'ipfs-core-types/src/dht/index'
import DynamicBuffer from '@fidian/dynamic-buffer'
import toStream from 'it-to-stream'
import { merge, isEmpty, isString, toNumber, isArray } from 'lodash'
import mime from 'mime'
import type { IPFS as IpfsApi } from 'ipfs'
import streamToBlob from 'stream-to-blob'
import streamToBlobURL from 'stream-to-blob-url'
import { is } from '@opendreamnet/app'
import all from 'it-all'
import speedometer, { SpeedometerFunc } from './speedometer'
import { IPFS } from './ipfs'
import { changeName, sanitizeName, wrapWithDirectory, filesStatToIpfsEntry } from './utils'

export interface IFileOptions {
  /**
   * File/Directory name.
   */
  name?: string
  /**
   * Download location.
   */
  directory?: string
}

export interface IEntryOptions {
  /**
   * File/Directory name.
   */
  name?: string
  /**
   * [metadata] Load stats?
   *
   * @default false
   */
  stats?: boolean
  /**
   * [metadata] Load peers distributing the entry?
   *
   * @default false
   */
  peers?: boolean
  /**
   * [metadata] Load subentries?
   * (Only directories)
   *
   * @default false
   */
  subentries?: boolean | 'recursive'
  /**
   * Throw errors that occur during [metadata] operations?
   * (The `.on('error')` event will always be fired)
   *
   * @default false
   */
  throwOnOptionalError?: boolean
  /**
   * Store in the IPFS repository for future use?
   *
   * @default false
   */
  store?: boolean
  /**
   * Cache entry?
   *
   * @default false
   */
  cache?: boolean | string
  /**
   * Maximum time in milliseconds for operations.
   *
   * @default 20,000
   */
  timeout?: number
  /**
   * Maximum time in milliseconds for subentries operations.
   *
   * @default 10,000
   */
  subTimeout?: number
  /**
   * CID of the folder that acts as wrap.
   * (Only for special cases)
   *
   */
  wrapCID?: CID
  /**
   * Relative path to the parent entry.
   * (Only for special cases)
   */
  parentRelPath?: string
}

export interface IDownloadProgress {
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

export class Entry extends EventEmitter {
  /**
   * File/Directory name or CID.
   *
   * @readonly
   */
  public get name(): string {
    return !isEmpty(this.entry.name)
      ? this.entry.name
      : this.options.name || this.cid.toString()
  }

  /**
   * IPFS CID
   *
   * @readonly
   */
  public get cid(): CID {
    return this.entry.cid
  }

  /**
   * IPFS CID as string.
   *
   * @readonly
   */
  public get identifier(): string {
    return this.entry.cid.toString()
  }

  /**
   * Relative IPFS path.
   */
  public get path(): string {
    return this.entry.path
  }

  /**
   * Relative normalized path.
   */
  public relpath: string

  /**
   * File or directory?
   *
   * @readonly
   */
  public get type(): 'file' | 'dir' {
    return this.entry.type
  }

  /**
   * Size in bytes.
   *
   * @readonly
   */
  public get size(): number {
    return this.entry.size || this.stat?.CumulativeSize || 0
  }

  /**
   *
   *
   * @readonly
   */
  public get mode(): number | undefined {
    return this.entry.mode
  }

  /**
   *
   *
   * @readonly
   */
  public get mtime(): Mtime | undefined {
    return this.entry.mtime
  }

  /**
   * Entry stats.
   */
  public stat?: StatResult

  /**
   * File mimetype.
   */
  public mimetype?: string

  /**
   * Indicates if metadata and entries are being loaded.
   */
  public loading = false

  /**
   * Indicates if the metadata and subentries have been loaded.
   */
  public loaded = false

  /**
   * Last error occurred during loading.
   */
  public error: any

  /**
   * Entry options.
   */
  public options: IEntryOptions = {
    stats: false,
    peers: false,
    subentries: false,
    throwOnOptionalError: false,
    store: false,
    timeout: 20 * 1000,
    subTimeout: 10 * 1000
  }

  /**
   * Peers distributing the entry.
   */
  public peers?: QueryEvent[]

  /**
   * [IPFSEntry] subentries.
   */
  public rawSubEntries?: IPFSEntry[]

  /**
   * [Entry] subentries.
   * (Only for directories)
   */
  public subEntries?: Entry[] = []

  /**
   * Indicates if the IPFS node has this entry stored.
   */
  public stored?: boolean

  /**
   * Indicates if the IPFS node has this entry pinned.
   */
  public pinned?: boolean

  /**
   *
   * @protected
   */
  protected abort?: AbortController

  /**
   * True when all the files have been downloaded.
   */
  public downloaded = false

  /**
   * True when downloading files.
   */
  public downloading = false

  /**
   * Download progress information.
   */
  public progress: IDownloadProgress = {
    downloaded: 0,
    percentage: 0
  }

  /**
   * IPFS API.
   *
   * @readonly
   */
  public get api(): IpfsApi | undefined {
    return this.ipfs.api
  }

  /**
   * Create and [Entry] from native [IPFSEntry] data.
   *
   * @static
   * @param ipfs
   * @param ipfsEntry
   * @param [options={}]
   */
  public static fromIpfsEntry(ipfs: IPFS, ipfsEntry: IPFSEntry, options: IEntryOptions = {}) {
    if (options.cache) {
      // Use cache
      const cacheKey = options.cache === true ? undefined : options.cache
      const cacheEntry = ipfs.getFromCache(ipfsEntry.cid, cacheKey)

      if (cacheEntry) {
        return cacheEntry
      }
    }

    return new Entry(ipfs, ipfsEntry, options)
  }

  /**
   * Create an [Entry] from a CID.
   *
   * @param ipfs
   * @param input
   * @param options
   */
  public static async fromCID(ipfs: IPFS, input: CID | CID[], options: IEntryOptions = {}) {
    if (!ipfs.api) {
      throw new Error('IPFS api undefined!')
    }

    if (isArray(input)) {
      // Add all CIDs to a folder.
      const wrapper = await wrapWithDirectory(ipfs, input.map(value => ({ cid: value })))

      // We already have the basic information, just need to convert it.
      return this.fromIpfsEntry(ipfs, filesStatToIpfsEntry(wrapper), options)
    }

    // Normalize
    const name = options.name || input.toString()
    const timeout = options.timeout || 60 * 1000

    // Wrap in a directory to obtain accurate CID data
    const wrapper = await wrapWithDirectory(ipfs, [{ cid: input, name }])

    // This should return only one entry
    const entries = await all(ipfs.api.ls(wrapper.cid, { timeout }))

    return this.fromIpfsEntry(ipfs, entries[0], { ...options, wrapCID: wrapper.cid })
  }

  /**
   * Creates a [Entry] wrapping multiple [Entry] in a folder.
   *
   * @static
   * @param ipfs
   * @param entries
   * @param [options={}]
   */
  public static async fromEntries(entries: Entry[], options?: IEntryOptions) {
    if (isEmpty(entries)) {
      throw new Error('No entries.')
    }

    const ipfs = entries[0].ipfs

    if (!options) {
      options = entries[0].options
    }

    // Add all CIDs to a folder.
    const wrapper = await wrapWithDirectory(ipfs, entries)

    // We already have the basic information, just need to convert it.
    return this.fromIpfsEntry(ipfs, filesStatToIpfsEntry(wrapper), options)
  }

  /**
   * Creates a [Entry] from MFS path.
   *
   * @static
   * @param ipfs
   * @param path
   * @param [options={}]
   */
  public static async fromMFS(ipfs: IPFS, path: string, options: IEntryOptions = {}) {
    if (!ipfs.api) {
      throw new Error('IPFS api undefined!')
    }

    const stat = await ipfs.api.files.stat(path, { timeout: options.timeout })

    // We already have the basic information, just need to convert it.
    return this.fromIpfsEntry(ipfs, filesStatToIpfsEntry(stat), options)
  }

  public constructor(public ipfs: IPFS, public entry: IPFSEntry, options: IEntryOptions = {}) {
    super()

    // Merge options
    this.setOptions(options)

    if (options.cache) {
      // Store in cache
      const cacheKey = options.cache === true ? undefined : options.cache
      ipfs.addToCache(this, cacheKey)
    }

    // Normalized
    this.relpath = this.getRelPath()

    if (this.type === 'file') {
      // Mimetype
      this.mimetype = mime.getType(this.name) || undefined
    }

    // Is Stored?
    if (this.ipfs.options.loadRefs) {
      this.stored = this.ipfs.isStored(this.cid)
    }

    // Is Pinned?
    if (this.ipfs.options.loadPins) {
      this.pinned = this.ipfs.isPinned(this.cid)
    }

    // Setup background
    this.setup()
  }

  public toJSON() {
    return {
      name: this.name,
      // cid: this.cid,
      identifier: this.identifier,
      path: this.path,
      relpath: this.relpath,
      type: this.type,
      size: this.size,
      // stats: this.stats,
      mimetype: this.mimetype,
      loaded: this.loaded,
      error: this.error,
      options: this.options,
      peers: this.peers?.length,
      stored: this.stored,
      pinned: this.pinned,
      entries: (this.subEntries || []).map((entry) => entry.toJSON())
    }
  }

  /**
   * Merge current options with new.
   *
   * @param options
   */
  public setOptions(options: IEntryOptions): this {
    this.options = merge(this.options, options)
    return this
  }

  /**
   * Set File/Directory name
   *
   * @param value
   */
  public setName(value: string): this {
    this.options.name = value
    return this
  }

  /**
   *
   *
   * @param [name]
   */
  public getRelPath(name?: string): string{
    // Sanitize file/directory name for use in OS filesystem
    let entryPath = sanitizeName(this.path)

    if (name) {
      // Change of name requested
      entryPath = changeName(entryPath, name)
    }

    const cid = this.cid.toString()

    if (entryPath.indexOf(cid) === 1) {
      // Remove the parent CID
      entryPath = entryPath.substring(
        entryPath.indexOf(cid) + cid.length
      )
    }

    if (this.options.wrapCID) {
      const wrapCID = this.options.wrapCID.toString()

      if (entryPath.includes(wrapCID)) {
        entryPath = entryPath.substring(
          entryPath.indexOf(wrapCID) + wrapCID.length
        )
      }
    }

    if (isEmpty(entryPath)) {
      // Just root
      entryPath = '/'
    }

    if (this.options.parentRelPath && this.options.parentRelPath.length > 1) {
      // Prepend parent entry path
      entryPath = this.options.parentRelPath + entryPath
    }

    return entryPath
  }

  /**
   * Returns a promise that is resolved when the metadata has been loaded.
   */
  public waitUntil(event: string): Promise<void> {
    if (this[event] === true) {
      return Promise.resolve()
    }

    if (this.error) {
      return Promise.reject(this.error)
    }

    return new Promise((resolve, reject) => {
      this.once('error', (err) => reject(err))
      this.once(event, () => resolve())
    })
  }

  /**
   * Run optional tasks.
   */
  protected async setup(): Promise<this> {
    // Load metadata.
    await this.load()

    if (this.options.store) {
      // Store in repo
      this.store()
    }

    return this
  }

  /**
   * Load metadata.
   */
  public async load(options: IEntryOptions = {}): Promise<void> {
    // Set new options
    this.setOptions(options)

    if (this.loading) {
      // Already loading, wait
      return this.waitUntil('loaded')
    }

    this.loading = true

    try {
      const workload: Promise<any>[] = []

      // Stat
      if (this.options.stats) {
        workload.push(this.loadStat())
      }

      // Peers
      if (this.options.peers) {
        workload.push(this.loadPeers())
      }

      // Subentries
      if (this.options.subentries) {
        workload.push(this.loadSubEntries())
      }

      if (workload.length > 0) {
        await Promise.all(workload)
      }

      this.loaded = true
      this.emit('loaded')
    } catch (err) {
      this.error = err
      this.emit('error', err)

      if (this.options.throwOnOptionalError) {
        throw err
      }
    } finally {
      this.loading = false
    }
  }

  /**
   *
   *
   */
  public async loadStat() {
    if (!this.api) {
      throw new Error('IPFS api undefined!')
    }

    this.stat = await this.api.object.stat(this.cid, { timeout: this.options.timeout })
    this.emit('stat', this.stat)
  }

  /**
   *
   *
   */
  public async loadPeers() {
    if (!this.api) {
      throw new Error('IPFS api undefined!')
    }

    this.peers = await all(this.api.dht.findProvs(this.cid, { timeout: this.options.timeout }))
    this.emit('peers', this.peers)
  }

  /**
   * Loads the subentries, in case of directory, loads the files/dirs as [Entry].
   */
  public async loadSubEntries() {
    if (!this.api) {
      throw new Error('IPFS api undefined!')
    }

    if (this.type === 'file') {
      // Only interested in directories
      // Also, `this.api.ls` can get stuck infinitely in files.
      return
    }

    this.rawSubEntries = await all(this.api.ls(this.cid, { timeout: this.options.timeout }))
    this.subEntries = []

    for(const entry of this.rawSubEntries) {
      this.subEntries.push(
        await Entry.fromIpfsEntry(this.ipfs, entry, {
          timeout: this.options.subTimeout,
          parentRelPath: this.getRelPath(),
          subentries: this.options.subentries === 'recursive' ? 'recursive' : false,
          wrapCID: this.cid
        })
      )
    }
  }

  /**
   * Returns a list of all subentries that are files.
   */
  public async getFileEntries(recursive = true): Promise<Entry[]> {
    if (this.type === 'file') {
      // Only interested in directories
      return []
    }

    if (!this.subEntries) {
      throw new Error('This entry has no subentries, is it a file?')
    }

    const files: Entry[] = []

    for (const entry of this.subEntries) {
      if (entry.type === 'dir' && recursive) {
        files.push(...await entry.getFileEntries())
      } else {
        files.push(entry)
      }
    }

    return files
  }

  /**
   *
   *
   */
  public async pin() {
    await this.ipfs.pin(this)

    this.pinned = true
    this.emit('pinned')
  }

  /**
   *
   *
   */
  public async unpin() {
    await this.ipfs.unpin(this)

    this.pinned = false
    this.emit('unpinned')
  }

  /**
   * Download the file/directory to disk.
   *
   * @param [options]
   */
  public async download(options?: IFileOptions | string) {
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
        name: this.name,
        cwd: process.cwd()
      }, options)
    }

    if (!options.directory) {
      throw new Error('Please specify directory.')
    }

    if (!options.name) {
      throw new Error('Please specify name.')
    }

    try {
      if (this.type === 'dir') {
        this.trackStart()
      }

      const writeFile = async(entry: Entry, abspath: string) => {
        if (!this.abort) {
          throw new Error('AbortController has not been initialized.')
        }

        if (this.type === 'dir') {
          entry.on('progress', (bytes) => {
            this.trackProgress(bytes)
          })
        }

        this.abort.signal.addEventListener('abort', entry.stopDownload)

        await entry.writeFile(abspath)

        this.abort.signal.removeEventListener('abort', entry.stopDownload)
      }

      let dpath: string

      if (this.type === 'file') {
        // Ensure that the download path exists.
        fs.ensureDirSync(options.directory)

        dpath = path.join(options.directory, this.getRelPath(options.name))
        await writeFile(this, dpath)
      } else {
        if (!this.subEntries) {
          throw new Error('Nothing to download.')
        }

        dpath = path.resolve(options.directory, options.name)

        // Ensure that the download path exists.
        fs.ensureDirSync(dpath)

        const files = await this.getFileEntries()

        for (const entry of files) {
          const abspath = path.join(dpath, entry.getRelPath())
          await writeFile(entry, abspath)
        }
      }

      this.downloaded = true
      this.stored = true

      this.emit('downloaded', dpath)
      this.ipfs.emit('downloaded', { entry: this, dpath })

      this.emit('stored')
      this.ipfs.emit('stored', this)

      return dpath
    } catch (err) {
      this.emit('error', err)
      throw err
    } finally {
      if (this.type === 'dir') {
        this.trackFinish()
      }
    }
  }

  /**
   * Stores the file/directory in the IPFS repo.
   */
  public async store() {
    if (!this.api) {
      throw new Error('IPFS api undefined!')
    }

    if (this.downloading) {
      return
    }

    try {
      this.trackStart()

      if (!this.abort) {
        throw new Error('AbortController has not been initialized.')
      }

      for await(const chunk of this.api.get(this.cid, { signal: this.abort.signal })) {
        this.trackProgress(chunk.length)
      }

      this.stored = true

      this.emit('stored')
      this.ipfs.emit('stored', this)
    } catch (err) {
      this.emit('error', err)
    } finally {
      this.trackFinish()
    }
  }

  /**
   * Returns the contents of the file.
   *
   * @remarks
   * Using this function does not provide download progress.
   *
   * @example
   * ```ts
   * for await(const chunk of file.getContent()) {
   *  console.log(chunk.length)
   * }
   * ```
   *
   */
  public getContent(): AsyncIterable<Uint8Array> {
    if (!this.api) {
      throw new Error('IPFS api undefined!')
    }

    if (this.type === 'dir') {
      throw new Error('This does not work in directories.')
    }

    this.abort = new AbortController()
    return this.api.cat(this.cid, { signal: this.abort.signal })
  }

  /**
   * Creates and returns a `stream.Readable`
   * with the contents of the file.
   */
  public getReadStream(): stream.Readable {
    if (this.type === 'dir') {
      throw new Error('This does not work in directories.')
    }

    this.trackStart()

    const readable = toStream.readable(this.getContent()) as stream.Readable

    // Download progress
    readable.on('data', (chunk: Uint8Array) => {
      this.trackProgress(chunk.length)
    })

    // Done
    readable.on('end', () => {
      if (this.abort) {
        this.abort = undefined
      }

      this.downloaded = true
      this.emit('downloaded')
      this.ipfs.emit('downloaded', { entry: this })

      this.trackFinish()
    })

    return readable
  }

  /**
   * Creates and returns a `Buffer`
   * with the contents of the file.
   */
  public getBuffer(): Promise<Buffer> {
    if (this.type === 'dir') {
      throw new Error('This does not work in directories.')
    }

    return new Promise((resolve, reject) => {
      const buffer = new DynamicBuffer()

      this.getReadStream()
        .on('error', (err) => reject(err))
        .on('data', (chunk: Uint8Array) => {
          chunk.forEach(value => {
            buffer.write(value)
          })
        })
        .on('end', () => {
          buffer.resizeUnderlyingBuffer()
          resolve(buffer.getBuffer())
        })
    })
  }

  /**
   * Returns the contents of the file as a string.
   *
   * @example
   * ```ts
   * const content = await file.getContentString()
   * console.log(content) // Hello World
   * ```
   *
   * @param [encoding]
   */
  public async getContentString(encoding?: BufferEncoding): Promise<string> {
    if (this.type === 'dir') {
      throw new Error('This does not work in directories.')
    }

    const buffer = await this.getBuffer()
    return buffer.toString(encoding)
  }

  /**
   * Saves the contents to a local file.
   *
   * @param filepath Absolute file path.
   */
  public writeFile(filepath: string): Promise<string> {
    if (!is.nodeIntegration) {
      throw new Error('Only available in NodeJS.')
    }

    if (this.type === 'dir') {
      throw new Error('This does not work in directories.')
    }

    fs.ensureDirSync(path.dirname(filepath))

    return new Promise((resolve, reject) => {
      this.getReadStream()
        .on('error', (err) => reject(err))
        .pipe(fs.createWriteStream(filepath))
        .on('close', () => resolve(filepath))
    })
  }

  /**
   * Get a W3C Blob object which contains the file data.
   */
  public async getBlob(): Promise<Blob> {
    if (!is.browser) {
      throw new Error('Only available in web browser.')
    }

    if (this.type === 'dir') {
      throw new Error('This does not work in directories.')
    }

    return await streamToBlob(this.getReadStream(), this.mimetype)
  }

  /**
   * Get a url which can be used in the browser to refer to the file.
   */
  public async getBlobURL(): Promise<string> {
    if (!is.browser) {
      throw new Error('Only available in web browser.')
    }

    if (this.type === 'dir') {
      throw new Error('This does not work in directories.')
    }

    return await streamToBlobURL(this.getReadStream(), this.mimetype)
  }

  /**
   * Requests the browser to download the file.
   *
   * @param filename
   */
  public async downloadAsBlob(filename: string): Promise<void> {
    if (!is.browser) {
      throw new Error('Only available in web browser.')
    }

    if (this.type === 'dir') {
      throw new Error('This does not work in directories.')
    }

    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(await this.getBlob())

    // Create a link element
    const link = document.createElement('a')

    // Set link's href to point to the Blob URL
    link.href = blobUrl
    link.download = filename

    // Append link to the body
    document.body.appendChild(link)

    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
    )

    // Remove link from body
    document.body.removeChild(link)
  }

  public stopDownload(): boolean {
    if (this.abort) {
      this.abort.abort()
      this.abort = undefined
      return true
    }

    return false
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