import fs from 'fs'
import path from 'path'
import { is } from '@opendreamnet/app'
import normalize from 'normalize-path'
import rfs from 'recursive-fs'
import URI from 'urijs'
import { isString, isArray, merge, isNil, clone } from 'lodash'
import { FileObject, FileContent } from '../types/ipfs'
import gatewayURLS from '../data/gateways.json'
import { UploadSource } from './ipfs'

export function isFileContent(source: unknown): source is FileContent {
  return source instanceof Uint8Array ||
  (typeof Blob !== 'undefined' && source instanceof Blob) ||
  isString(source) ||
  source instanceof ReadableStream
}

export async function sourceToFileObject(source: UploadSource | UploadSource[] | FileList): Promise<FileObject[]> {
  const files: FileObject[] = []

  /* eslint-disable no-await-in-loop */
  if (typeof FileList !== 'undefined' && source instanceof FileList) {
    // @ts-ignore
    for(const file of source) {
      files.push(...await sourceToFileObject(file))
    }
  } else if (isArray(source)) {
    for(const s of source) {
      files.push(...await sourceToFileObject(s))
    }
  /* eslint-enable no-await-in-loop */
  } else if (typeof File !== 'undefined' && source instanceof File) {
    files.push({
      // @ts-ignore
      path: source.webkitRelativePath || source.name,
      content: source.stream(),
      mode: source.lastModified
    })
  } else if (is.nodeIntegration && isString(source) && fs.existsSync(source)) {
    const stats = fs.statSync(source)

    if (stats.isDirectory()) {
      const { files: subfiles } = await rfs.read(source)

      subfiles.forEach((filepath: string) => {
        const relpath = normalize(filepath.replace(path.dirname(source), ''))
        const abspath = path.resolve(filepath)
        const filestats = fs.statSync(abspath)

        files.push({
          path: relpath,
          content: fs.createReadStream(abspath),
          mode: filestats.mode,
          mtime: filestats.mtime
        })
      })
    } else {
      files.push({
        path: path.basename(source),
        content: fs.createReadStream(source),
        mode: stats.mode,
        mtime: stats.mtime
      })
    }
  } else {
    files.push({ content: source as any })
  }

  return files
}

export type GatewayOptions = {
  /**
   * Gateway base address.
   *
   * @default https://ipfs.io
   */
  url?: string
  /**
   * File name.
   *
   * @default undefined
   */
  filename?: string
  /**
   * True to force the file to download. (Disable preview in browser)
   *
   * @default undefined
   */
  download?: boolean
}

export function getGatewayURI(cid: string, options: GatewayOptions = {}): URI {
  options = merge({ url: 'https://dweb.link' } as GatewayOptions, options)

  const uri = new URI(options.url).directory('ipfs').filename(cid)

  if (options.filename) {
    uri.query({ filename: options.filename })
  }

  if (!isNil(options.download)) {
    uri.query({ download: options.download ? 'true' : 'false' })
  }

  return uri
}

export function getGatewayURIS(cid: string, options: GatewayOptions = {}): URI[] {
  return clone(gatewayURLS).map((url: string) => {
    return getGatewayURI(cid, merge(options, { url }))
  })
}

export function encode64(data: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(data)))
}