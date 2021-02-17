import mime from 'mime-types'
import { Client, ClientOptions, ItemBucketMetadata } from 'minio'
import path from 'path'
import { UploadResult } from '../../types'
import { Provider } from './base'

export interface FileData {
  objectName?: string
  metaData?: ItemBucketMetadata
}

export class Minio extends Provider {
  /**
   * Minio client.
   *
   * @type {Client}
   */
  public client!: Client

  /**
   * S3 bucket
   *
   * @type {string}
   */
  public _bucket?: string

  /**
   *
   *
   * @type {string}
   */
  public _folder?: string

  /**
   *
   *
   * @type {string}
   */
  public _gateway?: string

  /**
   *
   *
   * @type {boolean}
   */
  public _ssl: boolean

  public get label(): string {
    return this.address ? `Minio (${this.address})` : super.label
  }

  public get defaultAddress(): string {
    return '/ip4/127.0.0.1/tcp/9000/http'
  }

  public get bucket(): string | undefined {
    return this._bucket || process.env[`DEPLOY_${this.name.toUpperCase()}_BUCKET`]
  }

  public get folder(): string {
    return this._folder || process.env[`DEPLOY_${this.name.toUpperCase()}_FOLDER`] || ''
  }

  public get gatewayURL(): string | undefined {
    return this._gateway || process.env[`DEPLOY_${this.name.toUpperCase()}_GATEWAY`]
  }

  public get ssl(): boolean {
    return this._ssl || String(process.env[`DEPLOY_${this.name.toUpperCase()}_SSL`]) === 'true' || this.multi.ssl
  }

  public get options(): ClientOptions {
    return {
      endPoint: this.multi.address,
      port: this.multi.port,
      useSSL: this.ssl,
      accessKey: this.token as string,
      secretKey: this.secret as string,
    }
  }

  public setAddress(value: string): this {
    this._address = value
    return this
  }

  public setBucket(value: string): this {
    this._bucket = value
    return this
  }

  public setFolder(value: string): this {
    this._folder = value
    return this
  }

  public setGatewayURL(value?: string): this {
    this._gateway = value
    return this
  }

  public setSSL(value: boolean): this {
    this._ssl = value
    return this
  }

  public validate(): void {
    if (!this.address) {
      throw new Error(`Missing multiaddress: DEPLOY_${this.name.toUpperCase()}_ADDRESS`)
    }

    if (!this.bucket) {
      throw new Error(`Missing bucket: DEPLOY_${this.name.toUpperCase()}_BUCKET`)
    }

    if (!this.token || !this.secret) {
      throw new Error(`Missing credentials:

DEPLOY_${this.name.toUpperCase()}_KEY
DEPLOY_${this.name.toUpperCase()}_SECRET`)
    }
  }

  public async setup(): Promise<void> {
    this.client = new Client(this.options)

    const exists = await this.client.bucketExists(this.bucket!)

    if (!exists) {
      await this.client.makeBucket(this.bucket!, 'us-east-1')
    }
  }

  public async upload(): Promise<unknown> {
    for (const file of this.release.files) {
      if (file.isDirectory) {
        continue
      }

      // eslint-disable-next-line no-await-in-loop
      await this.putFile(file.path, { objectName: path.posix.join(this.folder, file.relpath) })
    }

    if (this.gatewayURL) {
      return this.gatewayURL + '/' + path.posix.join(this.bucket!, this.folder, this.release.rootPath)
    }

    return this.getFileURL(path.posix.join(this.folder, this.release.rootPath))
  }

  public async parse(response: unknown): Promise<UploadResult> {
    return {
      cid: undefined,
      url: response as string,
    }
  }

  protected putFile(filepath: string, { objectName, metaData = {} }: FileData = {}): Promise<string> {
    const mimetype = mime.lookup(filepath)

    if (!objectName) {
      objectName = path.basename(filepath)
    }

    metaData = {
      'Content-Type': mimetype,
      ...metaData,
    }

    return this.client.fPutObject(this.bucket!, objectName, filepath, metaData)
  }

  protected getFileURL(objectName: string, expiry = 7): Promise<string> {
    return this.client.presignedGetObject(this.bucket!, objectName, expiry)
  }
}
