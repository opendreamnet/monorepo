import * as stream from 'stream'
import EventEmitter from 'events'
import path from 'path'
import fs from 'fs-extra'
import sanitize from 'sanitize-filename'
import mime from 'mime'
import DynamicBuffer from '@fidian/dynamic-buffer'
import toStream from 'it-to-stream'
import AbortController from 'node-abort-controller'
import streamToBlob from 'stream-to-blob'
import streamToBlobURL from 'stream-to-blob-url'
import { merge, toNumber } from 'lodash'
import { is } from '@opendreamnet/app'
import { Link, Time } from '../types/ipfs'
import { DownloadOptions, Record } from './record'
import { getGatewayURI, getGatewayURIS, GatewayOptions } from './utils'

function changeName(linkpath: string, value: string): string {
  const name = path.basename(linkpath)
  linkpath = linkpath.substring(0, linkpath.length - name.length)
  linkpath = `${linkpath}${value}`
  return linkpath
}

/*
function changeRoot(linkpath: string, value: string): string {
  const fchunk = linkpath.split('/')[0]
  linkpath = linkpath.substring(fchunk.length)
  linkpath = `${value}${linkpath}`
  return linkpath
}
*/

export function sanitizeName(linkpath: string): string {
  const name = path.basename(linkpath)
  return changeName(linkpath, sanitize(name))
}

export class File extends EventEmitter {
  /**
   * File name.
   */
  public name: string

  /**
   * File path (relative).
   */
  public path: string

  /**
   * File mimetype.
   */
  public mimetype?: string

  /**
   * File size (in bytes).
   *
   * @readonly
   */
  public get length(): number {
    return this.size
  }

  /**
   * File size (in bytes).
   *
   * @readonly
   */
   public get size(): number {
    return this.link.size
  }

  /**
   * File CID.
   *
   * @readonly
   */
  public get cid(): string {
    return this.link.cid.toString()
  }

  /**
   * File CID.
   *
   * @readonly
   */
  public get mode(): number | undefined {
    return this.link.mode
  }

  /**
   * File CID.
   *
   * @readonly
   */
  public get mtime(): Time | undefined {
    return this.link.mtime
  }

  /**
   * IPFS API.
   *
   * @readonly
   * @protected
   */
  protected get api(): any {
    return this.record.ipfs.node.api
  }

  protected abort?: AbortController

  /**
   * Total bytes received from peers.
   */
  public downloaded = 0

  /**
   * File download progress, from 0 to 1.
   */
  public progress = 0

  /**
   * True when the file have been downloaded.
   */
   public done = false

  /**
   * Creates an instance of File.
   *
   * @param record
   * @param link
   */
  public constructor(public record: Record, public link: Link) {
    super()

    this.name = this.link.name ? sanitize(this.link.name) : this.cid
    this.path = this.getPath()
    this.mimetype = mime.getType(this.name) || undefined
  }

  /**
   * Returns the relative path of the file with the name sanitized.
   * Optionally allows you to change the file name.
   *
   * @remarks
   * It is recommended to use `file.path` instead.
   *
   * @example
   * ```ts
   * console.log(file.getPath()) // docs/README.md
   *
   * console.log(file.getPath('CHANGELOG.md')) // docs/CHANGELOG.md
   * ```
   *
   * @param [name]
   */
  public getPath(name?: string): string {
    let linkpath = sanitizeName(this.link.path)

    if (name) {
      linkpath = changeName(linkpath, name)
    }

    return linkpath
  }

  /**
   * Builds the absolute path to the file.
   *
   * @param [options]
   */
   public getAbsPath(options?: DownloadOptions): string | undefined {
    options = merge({
      dirpath: this.record.dirpath,
      name: this.record.name
    }, options)

    if (!options.directory) {
      throw new Error('Please specify dirpath.')
    }

    if (!options.name) {
      throw new Error('Please specify name.')
    }

    const segments = [options.directory, options.name]

    if (this.record.isDirectory) {
      segments.push(this.path)
    }

    return path.resolve(...segments)
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
    this.abort = new AbortController()
    return this.api.cat(this.link.cid, { signal: this.abort.signal })
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
    const buffer = await this.getBuffer()
    return buffer.toString(encoding)
  }

  /**
   * Creates and returns a `stream.Readable`
   * with the contents of the file.
   */
  public getReadStream(): stream.Readable {
    this.downloaded = 0
    this.progress = 0
    this.done = false

    const readable = toStream.readable(this.getContent()) as stream.Readable

    // Download progress
    readable.on('data', (chunk: Uint8Array) => {
      this.downloaded += chunk.length

      if (this.length > 0) {
        this.progress = toNumber(this.downloaded / this.length)
      }

      this.emit('progress', chunk.length)
    })

    // Done
    readable.on('end', () => {
      if (!this.link.size) {
        // So this is the size.
        this.link.size = this.downloaded
      }

      if (this.abort) {
        this.abort = undefined
      }

      this.done = true
      this.emit('done')
    })

    return readable
  }

  /**
   * Creates and returns a `Buffer`
   * with the contents of the file.
   */
  public getBuffer(): Promise<Buffer> {
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
   * Saves the contents to a local file.
   *
   * @param filepath Absolute file path.
   */
  public writeFile(filepath?: string): Promise<string> {
    if (!is.nodeIntegration) {
      throw new Error('This function is only available in NodeJS.')
    }

    if (!filepath) {
      throw new Error('Please specify the file path.')
    }

    fs.ensureDirSync(path.dirname(filepath))

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    return new Promise((resolve, reject) => {
      this.getReadStream()
        .on('error', (err) => reject(err))
        .pipe(fs.createWriteStream(filepath!))
        .on('close', () => resolve(filepath!))
    })
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  }

  /**
   * Get a W3C Blob object which contains the file data.
   */
  public async getBlob(): Promise<Blob> {
    if (!is.browser) {
      throw new Error('This function is only available in web browser.')
    }

    return await streamToBlob(this.getReadStream(), this.mimetype)
  }

  /**
   * Get a url which can be used in the browser to refer to the file.
   */
  public async getBlobURL(): Promise<string> {
    if (!is.browser) {
      throw new Error('This function is only available in web browser.')
    }

    return await streamToBlobURL(this.getReadStream(), this.mimetype)
  }

  /**
   * Returns the URL of the file to an IPFS gateway.
   *
   * @param [options={}]
   */
  public getURL(options: GatewayOptions = {}): string {
    options = merge({ filename: this.name } as GatewayOptions, options)
    return getGatewayURI(this.cid, options).href()
  }

  /**
   * Returns a list of URLs of the file to public IPFS gateways.
   *
   * @param [options={}]
   */
  public getURLS(options: GatewayOptions = {}): string[] {
    options = merge({ filename: this.name } as GatewayOptions, options)
    return getGatewayURIS(this.cid, options).map((uri) => uri.href())
  }

  /*
  public renderTo(elem: HTMLElement, opts = {}): void {
    const { renderer } = require('@dreamnet/render-html-media')

    if (!is.browser) {
      throw new Error('This function is not available in Node.')
    }

    renderer.render({
      name: this.name,
      length: this.length,
      content: this.getReadStream.bind(this)
    }, elem)
  }
  */

  /**
   * Stops any active download.
   */
  public stop(): void {
    if (this.abort) {
      this.abort.abort()
      this.abort = undefined
    }
  }
}