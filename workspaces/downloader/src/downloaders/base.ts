import EventEmitter from 'events'
import { isNil, toNumber, merge, startsWith } from 'lodash'
import path from 'path'
import prettyBytes from 'pretty-bytes'
import fs from 'fs-extra'
import makeEta from 'simple-eta'
import { DateTime } from 'luxon'
import mime from 'mime'
import { getPath } from '@dreamnet/app'

export type DownloadProgressEvent = {
  /**
   * File instance.
   */
  file: Base,
  /**
   * Indicate if the total size of the file is present.
   */
  lengthComputable: boolean
  /**
   * Current downloaded size in bits.
   */
  loaded: number
  /**
   * Total size of the file in bits.
   */
  total?: number
  /**
   * Download progress in percentage.
   */
  percentage?: number
  /**
   * Amount of peers from where the file is downloaded.
   * Only applicable in p2p methods like IPFS or Torrent.
   */
  peers?: number
  /**
   * Estimated number of seconds to finish the download.
   */
  eta?: number
  /**
   * Information easy to read for humans.
   */
  pretty: {
    loaded: string,
    total?: string,
    eta?: string
  }
}

export type DownloaderOptions = {
  /**
   * Directory path for the file download.
   */
  directory?: string
  /**
   * Target file name.
   * Automatic detection if not defined.
   */
  filename?: string
  /**
   * Indicates whether the file should be deleted
   * in case an error occurs during the download.
   */
  deleteOnError?: boolean
  /**
   * Indicates whether the file information should be fetched
   * even if the file name is already defined.
   */
  fetch?: boolean
  /**
   * Maximum time in milliseconds to try to obtain
   * the information of the file.
   */
  fetchTimeout?: number
  /**
   * Called during the download progress.
   * Recommended to make a throttle.
   */
  onProgress?: (event: DownloadProgressEvent) => void
}

export type FileInfo = {
  /**
   * Directory path for the file download.
   */
  directory?: string
  /**
   * File name.
   */
  name?: string
  /**
   * File size.
   */
  size?: number
  /**
   * File mimetype.
   */
  type?: string
}

export class Base extends EventEmitter {
  /**
   * File source.
   */
  public source: string

  /**
   * Download options.
   */
  public options: DownloaderOptions = {}

  /**
   * File information.
   */
  public info: FileInfo = {}

  /**
   * Indicate if the file is downloading right now.
   */
  public downloading = false

  /**
   * Indicates whether the file has been downloaded correctly.
   */
  public success = false

  /**
   * Amount of peers from where the file is downloaded.
   * Only applicable in p2p methods like IPFS or Torrent.
   */
  public peers?: number

  /**
   * Download progress data.
   */
  public progress: DownloadProgressEvent

  /**
   * Class that calculates the estimated download time.
   *
   * @protected
   */
  protected eta?: ReturnType<typeof makeEta>

  /**
   *
   *
   * @protected
   */
  protected writeStream?: fs.WriteStream

  /**
   *
   *
   * @protected
   */
  protected readStream?: fs.ReadStream

  /**
   * Path where the file will be downloaded.
   * Returns `undefined` if the directory or file name has not been established.
   *
   * @readonly
   */
  public get filepath(): string | undefined {
    if (!this.info.directory || !this.info.name) {
      return undefined
    }

    return path.resolve(this.info.directory, this.info.name)
  }

  public get isSourceURL(): boolean {
    return startsWith(this.source, 'http://') || startsWith(this.source, 'https://')
  }

  public get isVideo(): boolean {
    return startsWith(this.info.type, 'video/')
  }

  public get isImage(): boolean {
    return startsWith(this.info.type, 'image/')
  }

  public constructor(source: string, options: DownloaderOptions = {}) {
    super()
    this.source = source

    this.progress = {
      file: this,
      lengthComputable: false,
      loaded: -1,
      pretty: {
        loaded: '',
      },
    }

    this.set(merge({
      deleteOnError: false,
      fetchTimeout: 10000,
      directory: getPath('temp') || process.cwd(),
    }, options))
  }

  /**
   * Set download options.
   *
   * @remarks
   * The options are merged.
   *
   *
   * @param options
   */
  public set(options: DownloaderOptions): this {
    if (!options) {
      return this
    }

    this.options = merge(this.options, options)

    this.info.name = options.filename || this.info.name
    this.info.directory = options.directory || this.info.directory

    return this
  }

  /**
   * Set the source of the download.
   *
   * @param value
   */
  public setSource(value: string): this {
    this.source = value
    return this
  }

  /**
   * Set the file information.
   *
   * @example
   * ```ts
   * downloader.setFileInfo({ name: 'download.zip', directory: '/tmp/' })
   * ```
   *
   * @param value
   */
  public setFileInfo(value: FileInfo): this {
    this.info = merge(this.info, value)
    return this
  }

  /**
   * Set the download progress information.
   *
   * @protected
   * @param loaded Downloaded bits.
   */
  protected setProgress(loaded: number): void {
    const total = this.info.size
    let eta: number | undefined

    if (total) {
      if (!this.eta) {
        this.eta = makeEta({ min: 0, max: total, autostart: true })
      } else {
        this.eta.report(loaded)
      }

      eta = this.eta.estimate()
    }

    this.progress = {
      file: this,
      lengthComputable: !isNil(total),
      loaded,
      total,
      percentage: total ? toNumber((loaded / total) * 100) : undefined,
      peers: this.peers,
      eta,
      pretty: {
        loaded: prettyBytes(loaded),
        total: total ? prettyBytes(total) : undefined,
        eta: eta ? DateTime.now().plus({ seconds: eta }).toRelative()! : undefined,
      },
    }

    this.emit('progress', this.progress)

    if (this.options.onProgress) {
      this.options.onProgress(this.progress)
    }
  }

  /**
   * Clear the download progress information.
   *
   * @protected
   */
  protected clearProgress(): void {
    this.progress = {
      file: this,
      lengthComputable: false,
      loaded: -1,
      pretty: {
        loaded: '',
      },
    }
  }

  protected onError(err: Error): void {
    try {
      if (this.writeStream) {
        this.writeStream.destroy()
        this.writeStream = undefined
      }

      if (this.readStream) {
        this.readStream.destroy()
        this.readStream = undefined
      }

      if (this.options.deleteOnError && this.filepath) {
        fs.removeSync(this.filepath)
      }
    } catch (err) {
      // empty
    }

    this.emit('error', err)
  }

  protected onEnd(): void {
    if (this.eta) {
      this.eta.reset()
      this.eta = undefined
    }

    this.clearProgress()

    this.emit('end')
  }

  public async fetch(): Promise<FileInfo> {
    const info = await this._fetch()

    console.log('info', info)

    // The file name does not have an extension, calculate from Mimetype.
    if (info.name && !mime.getType(info.name) && info.type) {
      info.name = `${info.name}.${mime.getExtension(info.type)}`
    }

    if (info.name && !this.info.name) {
      this.info.name = info.name
    }

    // No Mimetype has been detected, calculate from file name.
    if (!info.type && this.info.name) {
      info.type = mime.getType(this.info.name) || undefined
    }

    if (info.size) {
      this.info.size = info.size
    }

    if (info.type) {
      this.info.type = info.type
    }

    return info
  }

  protected async _fetch(): Promise<FileInfo> {
    throw new Error('Not implemented')
  }

  public async download(options: DownloaderOptions = {}): Promise<string> {
    this.set(options)

    if (!this.filepath || this.options.fetch) {
      await this.fetch()
    }

    if (!this.filepath) {
      throw new Error('Unable to obtain the file name, please specify manually.')
    }

    fs.ensureDirSync(this.info.directory!)

    this.downloading = true

    try {
      const filepath = await this._download()

      this.success = true
      this.emit('success', filepath)

      return filepath
    } catch (err) {
      this.onError(err)
      throw err
    } finally {
      this.onEnd()
      this.downloading = false
    }
  }

  protected async _download(): Promise<string> {
    throw new Error('Not implemented')
  }

  public async cancel(reason?: string | Error, timeout = 5000): Promise<void> {
    if (!this.downloading) {
      return
    }

    this.emit('cancel', reason)

    let timedOut = false

    const index = setTimeout(() => timedOut = true, timeout)

    while (this.downloading && !timedOut) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    clearTimeout(index)
  }
}