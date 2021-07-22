import axios, { AxiosInstance } from 'axios'
import { isEmpty } from 'lodash'
import { DnsRecord } from '../types'
import { DnsProvider } from './base'

export class Cloudflare extends DnsProvider {
  /**
   * Cloudflare email
   *
   * @protected
   */
  protected _email?: string

  /**
   * Cloudflare key
   *
   * @protected
   */
  protected _key?: string

  /**
   * Cloudflare token
   *
   * @protected
   */
  protected _token?: string

  /**
   * HTTP client
   *
   * @protected
   */
  protected api?: AxiosInstance

  /**
   * Cloudflare zone id
   *
   * @protected
   */
  protected zoneId?: number

  public get email(): string | undefined {
    return this._email || process.env.DEPLOY_CLOUDFLARE_EMAIL
  }

  public get key(): string | undefined {
    return this._key || process.env.DEPLOY_CLOUDFLARE_KEY
  }

  public get token(): string | undefined {
    return this._token || process.env.DEPLOY_CLOUDFLARE_TOKEN
  }

  public get zone(): string | undefined {
    return this._zone || process.env.DEPLOY_CLOUDFLARE_ZONE
  }

  public get record(): string | undefined {
    return this._record || process.env.DEPLOY_CLOUDFLARE_RECORD
  }

  /**
   * Headers for the HTTP API.
   *
   * @readonly
   */
  public get headers(): Record<string, string> | undefined {
    // Token
    if (this.token) {
      return {
        Authorization: `Bearer ${this.token}`
      }
    }

    // Key
    if (this.email && this.key) {
      return {
        'X-Auth-Email': this.email,
        'X-Auth-Key': this.key
      }
    }

    return undefined
  }

  /**
   * Validates the service information.
   */
  public validate(): void {
    if ((isEmpty(this.key) && isEmpty(this.email)) && isEmpty(this.token)) {
      throw new Error(`Missing credentials:

DEPLOY_CLOUDFLARE_EMAIL
DEPLOY_CLOUDFLARE_KEY
or
DEPLOY_CLOUDFLARE_TOKEN`)
    }

    if (isEmpty(this.zone)) {
      throw new Error('Missing zone. (DEPLOY_CLOUDFLARE_ZONE)')
    }

    if (isEmpty(this.record)) {
      throw new Error('Missing record. (DEPLOY_CLOUDFLARE_RECORD)')
    }
  }

  /**
   * Initializes the service.
   */
  public async setup(): Promise<void> {
    this.api = axios.create({
      baseURL: 'https://api.cloudflare.com/client/v4/',
      headers: this.headers
    })

    this.zoneId = await this.getZoneId()
  }

  /**
   * Execute DNSLink creation
   */
  public async exec(): Promise<DnsRecord> {
    if (!this.api) {
      throw new Error('Not setup')
    }

    const content = `dnslink=/ipfs/${this.release.cid}`
    const recordId = await this.getRecordId()

    if (recordId) {
      await this.api.patch(`zones/${this.zoneId}/dns_records/${recordId}`, {
        content
      })
    } else {
      await this.api.post(`zones/${this.zoneId}/dns_records`, {
        name: this.record,
        type: 'TXT',
        content
      })
    }

    return {
      record: this.record as string,
      content
    }
  }

  /**
   * Get the zone id.
   */
  protected async getZoneId(): Promise<number> {
    if (!this.api) {
      throw new Error('Not setup')
    }

    const { data } = await this.api.get(`zones?name=${this.zone}`)

    if (data.result.length === 0) {
      throw new Error(`Zone ${this.zone} not found`)
    }

    return data.result[0].id
  }

  /**
   * Get the DNS record id.
   *
   * @protected
   */
  protected async getRecordId(): Promise<number | undefined> {
    if (!this.api) {
      throw new Error('Not setup')
    }

    const { data } = await this.api.get(`zones/${this.zoneId}/dns_records?type=TXT`)

    if (data.result.length === 0) {
      return undefined
    }

    const record = data.result.find(record => record.name === `${this.record}.${this.zone}`)

    return record ? record.id : undefined
  }
}
