// import cf from 'cloudflare'
import updateDnsLink from 'dnslink-cloudflare'
import { isEmpty } from 'lodash'
import { DnsRecord, DnsLink } from '../types'
import { DnsProvider } from './base'

export class Cloudflare extends DnsProvider {
  protected _email?: string

  protected _key?: string

  protected _token?: string

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

  public get api(): Record<string, string> {
    const options: Record<string, string> = {}

    if (this.token) {
      options.token = this.token
    } else if (this.email && this.key) {
      options.email = this.email
      options.key = this.key
    }

    return options
  }

  public get options(): DnsLink {
    return {
      zone: this.zone as string,
      record: this.record as string,
      link: `/ipfs/${this.release.cid}`,
    }
  }

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

  public async link(): Promise<DnsRecord> {
    const content = await updateDnsLink(this.api, this.options)

    return {
      record: this.options.record,
      content,
    }
  }
}
