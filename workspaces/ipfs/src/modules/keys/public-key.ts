import { isString } from 'lodash'
import PeerId from 'peer-id'
import { composePublicKey, decomposePublicKey } from 'crypto-key-composer'
import { is } from '@opendreamnet/app'

/**
 * Type of key to use when composing PEM/DER.
 *
 * - `protobuf`: IPFS context
 * - `marshal`: General context
 */
 export type ComposeType = 'protobuf' | 'marshal'

export interface ComposeOptions {
  type: ComposeType
  format: 'spki-der' | 'spki-pem'
}

export interface PemOptions {
  /**
   * Type of key to use when composing PEM/DER.
   *
   * - `protobuf`/`marshal`: IPFS context
   * - `raw`: General context
   *
   * @default
   * protobuf
   */
  type: ComposeType
  /**
   * @default
   * false
   */
  inline: boolean
}

export class PublicKey {
  public peerId: string

  /**
   * Key in go-ipfs protobuf format.
   * - `key type + public key`
   * - (36 bytes)
   *
   * @see
   * https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/ed25519-class.ts#L25
   *
   * @readonly
   */
  public get protobuf(): Uint8Array {
    return new Uint8Array(this.pid.pubKey.bytes)
  }

  /**
   * - `public key`
   * - (32 bytes)
   *
   * @see
   * https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/ed25519-class.ts#L62
   *
   * @readonly
   */
  public get marshal(): Uint8Array {
    return this.pid.pubKey.marshal()
  }

  /**
   * Creates an instance of PublicKey.
   * @param pid
   */
  public constructor(public pid: PeerId) {
    this.peerId = this.pid.toB58String()
  }

  /**
   * Import a key using go-ipfs protobuf.
   * - `key type + public key`
   *
   * @static
   * @param key
   */
  public static async fromProtobuf(key: Uint8Array | string): Promise<PublicKey> {
    const peerId = await PeerId.createFromPubKey(key)
    return new PublicKey(peerId)
  }

  /**
   * Import a key using PEM go-ipfs protobuf data.
   *
   * @example
   * ```
   * const payload = fs.readFileSync('./public.pem')
   * const key = PublicKey.fromProtobufPem(payload)
   * ```
   *
   * @static
   * @param pem
   */
  public static async fromProtobufPem(pem: string): Promise<PublicKey> {
    const data = decomposePublicKey(pem)
    const key = await this.fromProtobuf(data.keyData.seed)
    return key
  }

  /**
   * Verify that the data and signature are valid.
   *
   * @param data
   * @param sign
   */
  public verify(data: string | Uint8Array, sign: string | Uint8Array): Promise<boolean> {
    return this.pid.pubKey.verify(
      isString(data) ? Buffer.from(data) : data,
      isString(sign) ? Buffer.from(sign) : sign
    )
  }

  /**
   * @see
   * https://github.com/ipfs-shipyard/js-crypto-key-composer
   *
   * @param options
   */
  public compose(options: ComposeOptions): Uint8Array | string {
    const bytes = options.type === 'marshal' ? this.marshal : this.protobuf

    return composePublicKey({
      format: options.format,
      keyAlgorithm: 'ed25519',
      keyData: {
        bytes
      }
    })
  }

  /**
   * Returns the key formatted in PEM.
   *
   * @param {string} [password] - Password to encrypt the PEM
   */
  public toPem(opts: Partial<PemOptions> = {}): string {
    const options: PemOptions = {
      type: 'protobuf',
      inline: false,
      ...opts
    }

    const buffer = this.compose({
      type: options.type,
      format: options.inline ? 'spki-der' : 'spki-pem'
    })

    if (options.inline) {
      return Buffer.from(buffer).toString('base64')
    }

    return buffer as string
  }

  /**
   * Returns the key as a Blob
   */
  public toPemBlob(opts: Partial<PemOptions> = {}): Blob {
    if (!is.browser) {
      throw new Error('Only available in web browser.')
    }

    return new Blob([this.toPem(opts)], { type: 'text/plain' })
  }

  /**
   * Requests the browser to download the key.
   *
   * @param filename
   */
  public download(filename = 'ipfs.pem'): void {
    if (!is.browser) {
      throw new Error('Only available in web browser.')
    }

    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(this.toPemBlob())

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

  /**
   * Returns the key formatted in go-ipfs protobuf.
   * `key type + public key`
   *
   * @remarks
   * This is the same version as the one found in the IPFS config:
   * `Identity.PrivKey`
   */
  public toProtobuf(): string {
    return Buffer.from(this.protobuf).toString('base64')
  }

  /**
   * Returns the base64-encoded key.
   */
  public toBase64(): string {
    return Buffer.from(this.marshal).toString('base64')
  }
}