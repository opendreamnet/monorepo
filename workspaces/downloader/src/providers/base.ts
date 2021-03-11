import { cloneDeep, chunk, startsWith } from 'lodash'
import { Base as BaseDownloader, DownloaderOptions } from '../downloaders/base'

export type ProviderFetchOptions = {
  /**
   * Fetch the files information automatically?
   * (This can take time)
   */
  autofetch?: boolean
  /**
   * Options that will be applied to the files.
   */
  fileOptions?: DownloaderOptions
}

export type ProviderDownloadOptions = {
  /**
   * Number of parallel downloads.
   * If `0` or `undefined` the downloads will be done one by one.
   */
  chunks?: number
  /**
   * Options that will be applied to the files.
   */
  fileOptions?: DownloaderOptions
}

/**
 * Base provider.
 * Allows to collect files from a provider to download them later.
 *
 * @export
 * @class Base
 */
export class Base {
  /**
   * Typically the URL of the source.
   */
  public source: string

  /**
   * List of files collected.
   */
  public files: BaseDownloader[] = []

  /**
   * Indicates if `source` is a URL.
   *
   * @readonly
   */
  public get isSourceURL(): boolean {
    return startsWith(this.source, 'http://') || startsWith(this.source, 'https://')
  }

  /**
   * Create a new instance of the provider,
   * collect the files and returns them.
   *
   * @param source Source URL
   * @param [options] Fetch the files information? (Can take time)
   */
  public static async fetch(source: string, options: ProviderFetchOptions = {}): Promise<BaseDownloader[]> {
    const factory = new this(source)
    const files = await factory.fetch()

    for (const file of files) {
      if (options.fileOptions) {
        file.set(options.fileOptions)
      }

      if (options.autofetch) {
        // eslint-disable-next-line no-await-in-loop
        await file.fetch()
      }
    }

    return files
  }

  /**
   * Create a new instance of the provider,
   * collect the files and returns the first.
   *
   * @static
   * @param source Source URL
   * @param [options] Fetch the file information?
   */
  public static async first(source: string, options: ProviderFetchOptions = {}): Promise<BaseDownloader | undefined> {
    const factory = new this(source)
    await factory.fetch()
    const file = factory.files[0]

    if (!file) {
      return undefined
    }

    if (options.fileOptions) {
      file.set(options.fileOptions)
    }

    if (options.autofetch) {
      await file.fetch()
    }

    return file
  }

  public constructor(source: string) {
    this.source = source
    this.validate()
  }

  /**
   * Validate the input information.
   */
  public validate(): void {
    // Implement
  }

  /**
   * Fetch the files available in the `source`.
   */
  public async fetch(): Promise<BaseDownloader[]> {
    throw new Error('Not implemented')
  }

  /**
   * Download all files.
   *
   * @param [options]
   */
  public async download(options: ProviderDownloadOptions = {}): Promise<BaseDownloader[]> {
    if (this.files.length === 0) {
      await this.fetch()
    }

    if (this.files.length === 0) {
      throw new Error('No files have been found.')
    }

    const files = cloneDeep(this.files)
    const chunksCount = !options.chunks || options.chunks === 0 ? 1 : options.chunks
    const chunks = chunk(files, chunksCount)

    for (const files of chunks) {
      const workload = files.map(file => {
        return file.download(options.fileOptions)
      })

      // eslint-disable-next-line no-await-in-loop
      await Promise.allSettled(workload)
    }

    return files
  }
}