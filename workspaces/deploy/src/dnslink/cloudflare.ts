// import cf from 'cloudflare'
import updateCloudflareDnslink from 'dnslink-cloudflare'
import { isEmpty } from 'lodash'

import { DNSRecord, DNSLink } from '../modules/types'
import { DnsProvider } from './base'

export class Cloudflare extends DnsProvider {
  // api: any

  _email: string | null = null

  _key: string | null = null

  _token: string | null = null

  get email(): string | null {
    return this._email || process.env.DEPLOY_CLOUDFLARE_EMAIL || null
  }

  get key(): string | null {
    return this._key || process.env.DEPLOY_CLOUDFLARE_KEY || null
  }

  get token(): string | null {
    return this._token || process.env.DEPLOY_CLOUDFLARE_TOKEN || null
  }

  get zone(): string | null {
    return this._zone || process.env.DEPLOY_CLOUDFLARE_ZONE || null
  }

  get record(): string | null {
    return this._record || process.env.DEPLOY_CLOUDFLARE_RECORD || null
  }

  get api(): { [key: string]: string } {
    const options: { [key: string]: string } = {}

    if (this.token) {
      options.token = this.token
    } else if (this.email && this.key) {
      options.email = this.email
      options.key = this.key
    }

    return options
  }

  get options(): DNSLink {
    return {
      zone: this.zone as string,
      record: this.record as string,
      link: `/ipfs/${this.release.cid}`,
    }
  }

  validate(): void {
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

  async link(): Promise<DNSRecord> {
    const content = await updateCloudflareDnslink(this.api, this.options)

    return {
      record: this.options.record,
      content,
    }
  }
}
