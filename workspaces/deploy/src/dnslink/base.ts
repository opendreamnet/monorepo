import { isEmpty } from 'lodash'
import { Release } from '../modules/release'
import { DnsRecord } from '../types'

export interface DnsProvider {
  setup?(): Promise<void>;
  validate?(): void;
  link(): Promise<DnsRecord>;
}

export abstract class DnsProvider {
  public release: Release

  protected _zone?: string

  /**
   *
   *
   * @type {(string | null)}
   * @memberof DNSProvider
   */
  protected _record?: string

  public get name(): string {
    return this.constructor.name
  }

  public get label(): string {
    return this.constructor.name
  }

  public get zone(): string | undefined {
    return this._zone
  }

  public get record(): string | undefined {
    return this._record
  }

  public constructor(release: Release) {
    this.release = release
  }

  public async run(): Promise<DnsRecord> {
    let record: DnsRecord

    try {
      this.release.emit('dns:begin', this)

      if (isEmpty(this.release.cid)) {
        throw new Error('Missing CID: No provider has been able to upload the release?')
      }

      if (this.validate) {
        this.validate()
      }

      if (this.setup) {
        await this.setup()
      }

      record = await this.link()

      this.release.emit('dns:success', record, this)
    } catch (error) {
      this.release.emit('dns:fail', error, this)
      throw error
    }

    return record
  }
}

export type DnsProviderEntity = DnsProvider | string
