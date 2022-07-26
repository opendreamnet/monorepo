import fs from 'fs'
import path from 'path'
import { is } from '@opendreamnet/app'
import normalize from 'normalize-path'
import rfs from 'recursive-fs'
import URI from 'urijs'
import { isString, isArray, merge, isNil, clone, random } from './lodash'
import sanitize from 'sanitize-filename'
import { DateTime } from 'luxon'
import type { IPFSEntry } from 'ipfs-core-types/src/root'
import type { StatResult } from 'ipfs-core-types/src/files/index'
import type { ImportCandidate, ImportCandidateStream, ToFile } from 'ipfs-core-types/src/utils'
import gatewayURLS from '../data/gateways.json'
import type { IPFS } from './ipfs'

export async function *inputToCandidateStream(input: ImportCandidate | ImportCandidate[] | FileList | File): ImportCandidateStream {
  const files: ImportCandidate[] = []

  const fromDomFile = (file: File): ToFile => {
    return {
      path: file.webkitRelativePath || file.name,
      content: file,
      mtime: { secs: DateTime.fromMillis(file.lastModified).toSeconds() }
    }
  }

  if (typeof File !== 'undefined' && input instanceof File) {
    files.push(fromDomFile(input))
  } else if (typeof FileList !== 'undefined' && input instanceof FileList) {
    // HTML FileList
    for (let i = 0; i < input.length; i++) {
      const file = input.item(i)

      if (!file) {
        continue
      }

      files.push(fromDomFile(file))
    }
  } else if (isArray(input)) {
    files.push(...input)
  } else if (is.nodeIntegration && isString(input) && fs.existsSync(input)) {
    const stat = fs.statSync(input)

    if (stat.isDirectory()) {
      const { files: subfiles } = await rfs.read(input)

      subfiles.forEach((filepath: string) => {
        const relpath = normalize(filepath.replace(path.dirname(input), ''))
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
        path: path.basename(input),
        content: fs.createReadStream(input),
        mode: stat.mode,
        mtime: stat.mtime
      })
    }
  } else {
    files.push(input as ImportCandidate)
  }

  for(const file of files) {
    yield file
  }
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

export function changeName(abspath: string, value: string): string {
  const name = path.basename(abspath)
  abspath = abspath.substring(0, abspath.length - name.length)
  abspath = `${abspath}${value}`
  return abspath
}

export function sanitizeName(linkpath: string): string {
  const name = path.basename(linkpath)
  return changeName(linkpath, sanitize(name))
}

export async function wrapWithDirectory(ipfs: IPFS, entries: Partial<IPFSEntry>[]): Promise<StatResult> {
  if (!ipfs.api) {
    throw new Error('IPFS api undefined!')
  }

  const dirpath = `/.wrapper_${Date.now()}_${random(100, false)}`
  await ipfs.api.files.mkdir(dirpath, {})

  // eslint-disable-next-line prefer-const
  for (let { cid, name } of entries) {
    if (!cid) {
      continue
    }

    if (!name) {
      name = cid.toString()
    }

    await ipfs.api.files.cp(`/ipfs/${cid}`, `${dirpath}/${name}`)
  }

  const stat = await ipfs.api.files.stat(dirpath)

  ipfs.api.files.rm(dirpath, { recursive: true })

  return stat
}

export function filesStatToIpfsEntry(stat: StatResult, name = ''): IPFSEntry {
  return {
    type: stat.type === 'directory' ? 'dir' : 'file',
    cid: stat.cid,
    name,
    path: `/${stat.cid.toString()}`,
    mode: stat.mode,
    mtime: stat.mtime,
    size: stat.size || stat.cumulativeSize
  }
}