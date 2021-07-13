import forge from 'node-forge'
import PeerId from 'peer-id'
import { is } from '@opendreamnet/app'
import { encode64 } from '../utils'

export class PublicKey {
  public key: forge.pki.PublicKey

  public id: string

  public constructor(public peerId: PeerId) {
    const buffer = new forge.util.ByteStringBuffer(this.peerId.pubKey.marshal())
    const asn1 = forge.asn1.fromDer(buffer)

    this.key = forge.pki.publicKeyFromAsn1(asn1)
    this.id = this.peerId.toB58String()
  }

  /**
   * Import a key using its go-ipfs protobuf version.
   *
   * @static
   * @param key
   */
   public static async fromProtobuf(key: Uint8Array | string): Promise<PublicKey> {
    const peerId = await PeerId.createFromPubKey(key)
    return new PublicKey(peerId)
  }

  /**
   * Returns the key formatted in PEM.
   */
  public toPem(): string {
    return forge.pki.publicKeyToRSAPublicKeyPem(this.key)
  }

  /**
   * Returns the key in single-line PEM.
   */
   public toPemInline(): string {
    return encode64(this.peerId.pubKey.marshal())
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
   public downloadPem(filename = 'ipfs.pem'): void {
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
   * @return {*}
   */
  public toProtobuf(): string {
    return encode64(this.peerId.marshalPubKey())
  }
}