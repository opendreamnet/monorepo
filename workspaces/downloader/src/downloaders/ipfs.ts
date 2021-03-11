import URI from 'urijs'
import { toNumber, toString, isError, isEmpty } from 'lodash'
import fs from 'fs-extra'
import isIPFS from 'is-ipfs'
import IpfsCtl from 'ipfsd-ctl'
import { path as getIpfsPath } from 'go-ipfs'
import { getPath } from '@dreamnet/app'
import toStream from 'it-to-stream'
import all from 'it-all'
import { Base, DownloaderOptions, FileInfo } from './base'

export class IPFS extends Base {
  protected node?: any

  public cid: string

  public static create(input: string, options: DownloaderOptions = {}): IPFS {
    return new IPFS(input, options)
  }

  public constructor(input: string, options: DownloaderOptions = {}) {
    super(input, options)

    if (isIPFS.cid(input)) {
      this.cid = input
    } else if (isIPFS.url(input)) {
      const matches = input.match(/^https?:\/\/[^/]+\/(ip[fn]s)\/([^/?#]+)/)

      if (!matches || !matches[2]) {
        throw new Error('IPFS CID not found.')
      }

      this.cid = matches[2]
    } else {
      throw new Error('Invalid input: Please enter a valid IPFS CID or IPFS URL.')
    }
  }

  protected async setup(): Promise<void> {
    await this.createNode()

    await this.connect()
  }

  protected async createNode(): Promise<void> {
    const ipfsBinPath = getIpfsPath().replace('app.asar', 'app.asar.unpacked')
    const ipfsRepoPath = getPath('temp', 'downloader-ipfs-repo')

    if (isEmpty(ipfsBinPath)) {
      throw new Error('IPFS bin not found.')
    }

    if (!ipfsRepoPath) {
      throw new Error('IPFS repo path cannot be created.')
    }

    fs.ensureDirSync(ipfsRepoPath)

    this.node = await IpfsCtl.createController({
      ipfsHttpModule: require('ipfs-http-client'),
      ipfsBin: ipfsBinPath,
      ipfsOptions: {
        repo: ipfsRepoPath,
      },
      remote: false,
      disposable: false,
    })

    await this.node.init()

    await this.node.start()

    if (!this.node.api) {
      throw new Error('IPFS node cannot be created.')
    }
  }

  protected async connect(): Promise<void> {
    try {
      await Promise.allSettled([
        this.node.api.swarm.connect('/dns4/amanari.dreamnet.tech/tcp/4001/p2p/QmcWoy1FzBicbYuopNT2rT6EDQSBDfco1TxibEyYgWbiMq'),
        this.node.api.swarm.connect('/dns4/valeria.dreamnet.tech/tcp/4001/p2p/12D3KooWLSBENgc42uWwhsppUaRFknmSjcYvEyN5qLFtgr1PbEQS'),
      ])
    } catch (err) {
      console.warn(err.message)
    }
  }

  protected onEnd(): void {
    // Stop IPFS
    if (this.node) {
      this.node.stop()
      this.node = undefined
    }

    // Always make sure to delete this file
    fs.removeSync(getPath('temp', 'downloader-ipfs-repo', 'api')!)

    super.onEnd()
  }

  public async _fetch(): Promise<FileInfo> {
    if (!this.node) {
      await this.setup()
    }

    const stats = await this.node.api.object.stat(this.cid, { timeout: this.options.fetchTimeout }).catch(() => null)

    if (!stats) {
      return {}
    }

    const info: FileInfo = {}

    all(
      this.node.api.dht.findProvs(this.cid, { timeout: (this.options.fetchTimeout || 10000) * 2 }),
    ).then((peers) => {
      this.peers = peers.length
      this.emit('peers', peers.length)
      return peers
    }).catch(() => {
      // Silent
    })

    // File name
    if (isIPFS.url(this.source)) {
      const uri = new URI(this.source)

      if (uri.hasQuery('filename')) {
        info.name = toString(uri.query(true).filename)
      }
    }

    // File size
    if (stats.CumulativeSize) {
      info.size = toNumber(stats.CumulativeSize)
    }

    return info
  }

  protected async _download(): Promise<string> {
    this.writeStream = fs.createWriteStream(this.filepath!)
    this.readStream = toStream.readable(this.node.api.cat(this.cid))

    return new Promise((resolve, reject) => {
      if (!this.readStream || !this.writeStream) {
        reject(new Error('Error creating readStream or writeStream.'))
        return
      }

      this.writeStream.on('error', (error) => {
        reject(error)
      })

      this.writeStream.on('finish', () => {
        resolve(this.filepath!)
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