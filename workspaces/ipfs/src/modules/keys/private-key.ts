import crypto from 'libp2p-crypto'
import forge from 'node-forge'
import PeerId from 'peer-id'
import * as bip39 from 'bip39'
import * as cryptoKeys from 'human-crypto-keys'
import Rasha from 'rasha'
import { is } from '@opendreamnet/app'
import { encode64 } from '../utils'
import { PublicKey } from './public-key'

/**
 * Represents an RSA private key.
 *
 * @export
 */
export class PrivateKey {
  /**
   * Key instance.
   */
  public key: forge.pki.PrivateKey

  /**
   * Public key.
   */
  public publicKey: PublicKey

  /**
   * Peer ID of the key.
   */
  public id: string

  /**
   * Mnemonic to backup the key.
   *
   * @remarks
   * Only available when creating a new key or importing it with the mnemonic.
   */
  public mnemonic?: string

  public constructor(public peerId: PeerId) {
    const buffer = new forge.util.ByteStringBuffer(this.peerId.privKey.marshal())
    const asn1 = forge.asn1.fromDer(buffer)

    this.key = forge.pki.privateKeyFromAsn1(asn1)
    this.publicKey = new PublicKey(this.peerId)
    this.id = this.peerId.toB58String()
  }

  /**
   * Creates a random key.
   *
   * @static
   */
  public static async create(): Promise<PrivateKey> {
    // Generate keys and mnemonic.
    const keyPair = await cryptoKeys.generateKeyPair('rsa')
    const pem = keyPair.privateKey

    // Import using PEM.
    const privateKey = await this.fromPem(pem)
    privateKey.mnemonic = keyPair.mnemonic

    return privateKey
  }

  /**
   * Import a key using its go-ipfs protobuf version.
   *
   * @static
   * @param key
   */
  public static async fromProtobuf(key: Uint8Array | string): Promise<PrivateKey> {
    const peerId = await PeerId.createFromPrivKey(key)
    return new PrivateKey(peerId)
  }

  /**
   * Import a key using a JWK.
   *
   * @static
   * @param jwk
   */
  public static async fromJwk(jwk: Uint8Array | Rasha.Jwk): Promise<PrivateKey> {
    // Convert JWK to libp2p-crypto RsaPrivateKey.
    // @ts-ignore
    const key = await crypto.keys.supportedKeys.rsa.fromJwk(jwk)

    // Convert RsaPrivateKey to Protobuf.
    return this.fromProtobuf(crypto.keys.marshalPrivateKey(key))
  }

  /**
   * Import a RSA key using a PEM.
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
   public static async fromPem(pem: string): Promise<PrivateKey> {
    // Convert PEM to JWK.
    const jwk = await Rasha.import({ pem, public: false })

    return this.fromJwk(jwk)
  }

  /**
   * Import a key using an instance of `forge.pki.PrivateKey`.
   *
   * @static
   * @param key
   */
  public static fromKey(key: forge.pki.PrivateKey): Promise<PrivateKey> {
    // Use PEM.
    return this.fromPem(forge.pki.privateKeyToPem(key))
  }

  /**
   * Import a key using a mnemonic.
   *
   * @static
   * @param mnemonic
   */
  public static async fromMnemonic(mnemonic: string): Promise<PrivateKey> {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic')
    }

    const keyPair = await cryptoKeys.getKeyPairFromMnemonic(mnemonic, 'rsa')

    // Import using PEM.
    const privateKey = await this.fromPem(keyPair.privateKey)
    privateKey.mnemonic = mnemonic

    return privateKey
  }

  /**
   * Returns the key formatted in PEM.
   *
   * @param {string} [password] - Password to encrypt the PEM.
   */
  public toPem(password?: string): string {
    if (password) {
      return forge.pki.encryptRsaPrivateKey(this.key, password, {
        algorithm: 'aes256',
        count: 10000,
        saltSize: 128 / 8,
        prfAlgorithm: 'sha512'
      })
    }

    return forge.pki.privateKeyToPem(this.key)
  }

  /**
   * Returns the key in single-line PEM.
   */
   public toPemInline(): string {
    return encode64(this.peerId.privKey.marshal())
  }

  /**
   * Returns the key as a Blob
   */
  public toPemBlob(): Blob {
    if (!is.browser) {
      throw new Error('This function is only available in web browser.')
    }

    return new Blob([this.toPem()], { type: 'text/plain' })
  }

  /**
   * Requests the browser to download the key.
   *
   * @param filename
   */
   public downloadPem(filename = 'ipfs.key'): void {
    if (!is.browser) {
      throw new Error('This function is only available in web browser.')
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
   * @remarks
   * This is the same version as the one found in the IPFS node configuration:
   * `Identity.PrivKey`
   *
   * @return {*}
   */
  public toProtobuf(): string {
    return encode64(this.peerId.marshalPrivKey())
  }
}