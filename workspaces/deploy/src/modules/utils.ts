import fs from 'fs'
import { multiaddr } from 'multiaddr'
import { toNumber } from 'lodash'
import { Provider } from '../uploaders'
import { Multiaddress as MultiaddressPlus, ReleaseFile } from '../types'
import { FileObject } from '../types/ipfs'

/**
 *
 *
 * @export
 * @param {*} value
 * @return {*}  {value is Provider}
 */
export function isProvider(value: unknown): value is Provider {
  return value instanceof Provider
}

/**
 *
 *
 * @export
 * @param {*} derivedCtor
 * @param {any[]} baseCtors
 * @return {*}  {*}
 */
export function applyMixins(derivedCtor: unknown, baseCtors: unknown[]): void {
  baseCtors.forEach(baseCtor => {
    // @ts-ignore
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      // @ts-ignore
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name))
    })
  })
}

/**
 * Convert a multiaddress to an improved multiaddress.
 *
 * @export
 * @param {string} address
 * @return {*}  {MultiaddressPlus}
 */
export function getMultiaddr(address: string): MultiaddressPlus {
  const nodeAddress = multiaddr(address).nodeAddress()
  const protoNames = multiaddr(address).protoNames()

  let protocol = protoNames[protoNames.length - 1]

  // Dammit ipfs...
  const port = toNumber(nodeAddress.port)

  if (port === 80) {
    protocol = 'http'
  }

  if (port === 443) {
    protocol = 'https'
  }

  return {
    // @ts-ignore
    family: nodeAddress.family,
    address: nodeAddress.address,
    port,
    protocol,
    ssl: protocol === 'https',
    url: port === 80 || port === 443 ? `${protocol}://${nodeAddress.address}` : `${protocol}://${nodeAddress.address}:${port}`
  }
}

/**
 * Converts a [ReleaseFile] to an file object for IPFS.
 *
 * @export
 * @param {ReleaseFile} file
 * @return {*}  {FileObject}
 */
export function releaseFileToObject(file: ReleaseFile): FileObject {
  const payload: FileObject = {
    path: file.relpath,
    mode: file.stats.mode,
    mtime: file.stats.mtime
  }

  if (!file.isDirectory) {
    payload.content = fs.createReadStream(file.path)
  }

  return payload
}
