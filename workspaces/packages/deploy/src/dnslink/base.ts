import { isEmpty } from 'lodash'
import { Release } from '../modules/release'
import { DNSRecord } from '../modules/interfaces'

export interface DnsProvider {
  setup?(): Promise<void>;
  validate?(): void;
  link(): Promise<DNSRecord>;
}

/**
 *
 *
 * @export
 * @abstract
 * @class DNSProvider
 */
export abstract class DnsProvider {
  /**
   *
   *
   * @type {Release}
   * @memberof DNSProvider
   */
  release: Release

  /**
   *
   *
   * @type {(string | null)}
   * @memberof DNSProvider
   */
  _zone: string | null = null

  /**
   *
   *
   * @type {(string | null)}
   * @memberof DNSProvider
   */
  _record: string | null = null

  /**
   *
   *
   * @readonly
   * @type {string}
   * @memberof Provider
   */
  get name(): string {
    return this.constructor.name
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get label(): string {
    return this.constructor.name
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   * @memberof DNSProvider
   */
  get zone(): string | null {
    return this._zone || null
  }

  /**
   *
   *
   * @readonly
   * @type {(string | null)}
   * @memberof DNSProvider
   */
  get record(): string | null {
    return this._record || null
  }

  /**
   * Creates an instance of DNSProvider.

   * @param {Release} release
   * @memberof DNSProvider
   */
  constructor(release: Release) {
    this.release = release
  }

  /**
   *
   *
   * @returns {Promise<DNSRecord>}
   * @memberof DNSProvider
   */
  async run(): Promise<DNSRecord> {
    let record: DNSRecord

    try {
      this.release.emit('dns_begin', this)

      if (isEmpty(this.release.cid)) {
        throw new Error('Missing CID: No provider has been able to upload the release.')
      }

      if (this.validate) {
        this.validate()
      }

      if (this.setup) {
        await this.setup()
      }

      record = await this.link()

      this.release.emit('dns_success', record, this)
    } catch (error) {
      this.release.emit('dns_fail', error, this)
      throw error
    }

    return record
  }
}
