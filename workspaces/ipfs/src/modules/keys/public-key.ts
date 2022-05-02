import { isString } from 'lodash'
import PeerId from 'peer-id'
import { composePublicKey, decomposePublicKey } from 'crypto-key-composer'
import { is } from '@opendreamnet/app'

export interface ComposeOptions {
  format: 'spki-der' | 'spki-pem'
}

export class PublicKey {
  public peerId: string

  /**
   * Encoded: `key type + private key + public key`
   *
   * @see
   * https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/ed25519-class.ts#L66
   *
   * @readonly
   */
   public get bytes(): Uint8Array {
    return new Uint8Array(this.pid.pubKey.bytes)
  }

  /**
   * 32 bytes private key + 32 bytes public key
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
   * Import a key using its go-ipfs protobuf/seed.
   * (Encoded: `key type + public key`)
   *
   * @static
   * @param key
   */
  public static async fromProtobuf(key: Uint8Array | string): Promise<PublicKey> {
    const peerId = await PeerId.createFromPubKey(key)
    return new PublicKey(peerId)
  }

  /**
   * Import a key using PEM data.
   *
   * @example
   * ```
   * const payload = fs.readFileSync('./private.pem')
   * const privateKey = PrivateKey.fromPem(payload)
   * ```
   *
   * @static
   * @param pem
   */
   public static async fromPem(pem: string): Promise<PublicKey> {
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
   * @return {*}
   */
  public compose(options: ComposeOptions): Uint8Array | string {
    return composePublicKey({
      format: options.format,
      keyAlgorithm: 'ed25519',
      keyData: {
        bytes: this.pid.pubKey.bytes
      }
    })
  }

  /**
   * Returns the key formatted in PEM.
   *
   * @param {string} [password] - Password to encrypt the PEM
   */
  public toPem(): string {
    return this.compose({
      format: 'spki-pem'
    }) as string
  }

  /**
   * Returns the key in single-line PEM.
   *
   * @param {string} [password] - Password to encrypt the PEM
   */
  public toPemInline(): string {
    const buffer = this.compose({
      format: 'spki-der'
    }) as Uint8Array

    return Buffer.from(buffer).toString('base64')
  }

  /**
   * Returns the key as a Blob
   */
  public toPemBlob(): Blob {
    if (!is.browser) {
      throw new Error('Only available in web browser.')
    }

    return new Blob([this.toPem()], { type: 'text/plain' })
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
   * Returns the base64 encoded key formatted in protobuf.
   *
   * @return {*}
   */
  public toProtobuf(): string {
    return Buffer.from(this.pid.marshalPubKey()).toString('base64')
  }
}