import axios, { AxiosResponse } from 'axios'
import contentDisposition from 'content-disposition'
import URI from 'urijs'
import { toNumber, toString, isError } from 'lodash'
import fs from 'fs-extra'
import { Base, DownloaderOptions, FileInfo } from './base'

export class Http extends Base {
  public static create(url: string, options: DownloaderOptions = {}): Http {
    return new Http(url, options)
  }

  protected async _fetch(): Promise<FileInfo> {
    let response: AxiosResponse | null

    console.log('this.source', this.source)

    // HEAD
    response = await axios.head(this.source, { timeout: this.options.fetchTimeout }).catch(() => null)

    if (!response) {
      try {
        // Some URLs are not accessible from HEAD
        response = await axios.get(this.source, {
          responseType: 'stream',
          maxContentLength: -1,
          timeout: this.options.fetchTimeout,
        })
      } catch (err) {
        throw new Error(`Inaccessible URL: ${err.message}`)
      } finally {
        if (response) {
          response.data.destroy()
        }
      }
    }

    if (!response) {
      return {}
    }

    const info: FileInfo = {}

    // File name
    if (response.headers['content-disposition']) {
      const disposition = contentDisposition.parse(response.headers['content-disposition'])
      info.name = disposition.parameters.filename
    }

    if (!info.name) {
      const uri = new URI(this.source)

      if (uri.hasQuery('filename')) {
        info.name = toString(uri.query(true).filename)
      } else {
        info.name = uri.filename()
      }
    }

    // File size
    if (response.headers['content-length']) {
      info.size = toNumber(response.headers['content-length'])
    }

    // Mime type
    if (response.headers['content-type']) {
      info.type = response.headers['content-type']
    }

    return info
  }

  protected async _download(): Promise<string> {
    const request = await axios.get(this.source, {
      responseType: 'stream',
      maxContentLength: -1,
    })

    this.writeStream = fs.createWriteStream(this.filepath!)
    this.readStream = request.data

    return new Promise((resolve, reject) => {
      if (!this.readStream || !this.writeStream) {
        reject(new Error('Error creating readStream or writeStream.'))
        return
      }

      this.writeStream.on('error', (error) => {
        reject(error)
      })

      this.writeStream.on('finish', () => {
        resolve(this.filepath || '')
      })

      this.readStream.on('error', (error) => {
        reject(error)
      })

      this.readStream.on('data', () => {
        if (this.writeStream) {
          this.setProgress(this.writeStream.bytesWritten)
        }
      })

      this.on('cancel', (reason?: string | Error) => {
        if (isError(reason)) {
          reject(reason)
        } else {
          reject(new Error(reason || 'Cancelled'))
        }
      })

      this.readStream.pipe(this.writeStream)
    })
  }
}