import { isString } from 'lodash'
import crypto from 'libp2p-crypto'
import PeerId from 'peer-id'
import { composePrivateKey, decomposePrivateKey } from 'crypto-key-composer'
import { is } from '@opendreamnet/app'
import { PublicKey } from './public-key'

/**
 * Type of key to use when composing PEM/DER.
 *
 * - `protobuf`/`marshal`: IPFS context
 * - `raw`: General context
 */
export type ComposeType = 'protobuf' | 'marshal' | 'raw'

export interface ComposeOptions {
  type: ComposeType
  format: 'pkcs8-der' | 'pkcs8-pem'

  encryptionAlgorithm?: any
  password?: string
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
   * PEM password
   */
  password?: string
  /**
   * @see
   * https://github.com/ipfs-shipyard/js-crypto-key-composer#encryption-algorithms
   */
  encryptionAlgorithm?: any
  /**
   * @default
   * false
   */
  inline: boolean
}

/**
 * Represents an ED25519 private key.
 *
 * @export
 */
export class PrivateKey {
  /**
   * Peer ID of the key.
   */
  public peerId: string

  /**
   * Public key intance.
   */
  public publicKey: PublicKey

  /**
   * Key in go-ipfs protobuf format.
   * - `key type + private key + public key`
   * - (68 bytes)
   *
   * @see
   * https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/ed25519-class.ts#L66
   *
   * @readonly
   */
  public get protobuf(): Uint8Array {
    return new Uint8Array(this.pid.privKey.bytes)
  }

  /**
   * - `private key + public key`
   * - (64 bytes)
   *
   * @see
   * https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/ed25519-class.ts#L62
   *
   * @readonly
   */
  public get marshal(): Uint8Array {
    return this.pid.privKey.marshal()
  }

  /**
   * - `private key`
   * - (32 bytes)
   *
   * @remarks
   * This is what you need to work with this key in other contexts. (Outside IPFS)
   *
   * @readonly
   */
  public get raw(): Uint8Array {
    return this.pid.privKey.marshal().subarray(0, 32)
  }

  /**
   * Creates an instance of PrivateKey.
   *
   * @param pid
   */
  public constructor(public pid: PeerId) {
    this.publicKey = new PublicKey(this.pid)
    this.peerId = this.pid.toB58String()
  }

  /**
   * Creates a random key.
   *
   * @static
   */
  public static fromRandom(): Promise<PrivateKey> {
    const seed = crypto.randomBytes(32)
    return this.fromSeed(seed)
  }

  /**
   * Import key from 32 byte seed.
   *
   * @param seed
   */

  public static async fromSeed(seed: Uint8Array): Promise<PrivateKey> {
    const cryptoPrivateKey = await crypto.keys.generateKeyPairFromSeed('Ed25519', seed, 4096)
    const key = await this.fromProtobuf(cryptoPrivateKey.bytes)
    return key
  }

  /**
   * Import a key using go-ipfs protobuf.
   * - `key type + private key + public key`
   *
   * @static
   * @param key
   */
  public static async fromProtobuf(key: Uint8Array | string): Promise<PrivateKey> {
    const peerId = await PeerId.createFromPrivKey(key)
    return new PrivateKey(peerId)
  }

  /**
   * Import a key using PEM go-ipfs protobuf data.
   *
   * @example
   * ```
   * const payload = fs.readFileSync('./private.pem')
   * const key = PrivateKey.fromProtobufPem(payload)
   * ```
   *
   * @static
   * @param pem
   */
  public static async fromProtobufPem(pem: string, password?: string): Promise<PrivateKey> {
    const data = decomposePrivateKey(pem, { password })
    const key = await this.fromProtobuf(data.keyData.seed)
    return key
  }

  /**
   * Returns the signature of data.
   *
   * @param data
   */
  public sign(data: string | Uint8Array): Promise<Uint8Array> {
    const payload: Uint8Array = isString(data) ? Buffer.from(data) : data
    return this.pid.privKey.sign(payload)
  }

  /**
   * Verify that the data and signature are valid.
   *
   * @param data
   * @param sign
   */
  public verify(data: string | Uint8Array, sign: string | Uint8Array): Promise<boolean> {
    return this.publicKey.verify(data, sign)
  }

  /**
   * @see
   * https://github.com/ipfs-shipyard/js-crypto-key-composer
   *
   * @param options
   */
   public compose(options: ComposeOptions): Uint8Array | string {
    let seed = this.protobuf

    if (options.type === 'marshal') {
      seed = this.marshal
    }

    if (options.type === 'raw') {
      seed = this.raw
    }

    return composePrivateKey({
      format: options.format,
      keyAlgorithm: 'ed25519',
      keyData: {
        seed
      },
      encryptionAlgorithm: options.encryptionAlgorithm
    }, { password: options.password })
  }

  /**
   * Returns the key formatted in PEM.
   */
  public toPem(opts: Partial<PemOptions> = {}): string {
    const options: PemOptions = {
      type: 'protobuf',
      inline: false,
      ...opts
    }

    const buffer = this.compose({
      type: options.type,
      format: options.inline ? 'pkcs8-der' : 'pkcs8-pem',
      encryptionAlgorithm: options.encryptionAlgorithm,
      password: options.password
    })

    if (options.inline) {
      return Buffer.from(buffer).toString('base64')
    }

    return buffer as string
  }

  /**
   * Returns the key as a Blob.
   */
  public toPemBlob(opts: Partial<PemOptions> = {}): Blob {
    if (!is.browser) {
      throw new Error('Only available in web browser.')
    }

    return new Blob([this.toPem(opts)], { type: 'text/plain' })
  }

  /**
   * Requests the web browser to download the key.
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
   * `key type + private key + public key`
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
    // TODO: Why do we use Marshal? It seems to be the one who works
    // with this tool: https://ed25519.herokuapp.com
    // {clueless}
    return Buffer.from(this.marshal).toString('base64')
  }
}