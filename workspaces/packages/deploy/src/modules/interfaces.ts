import fs from 'fs'
import { Provider } from '../uploaders'
import { DnsProvider } from '../dnslink'

export interface UrlHash {
  /**
   *
   *
   * @type {string}
   */
  provider?: string;

  /**
   *
   *
   * @type {string}
   */
  url: string;

  /**
   *
   *
   * @type {string}
   */
  cid?: string;
}

export interface ReleaseFile {
  path: string;
  relpath: string;
  content?: fs.ReadStream;

  name?: string;
  mimetype?: string;
  stats: fs.Stats;
  isDirectory: boolean;
}

export interface DNSLink {
  zone: string;
  record: string;
  link: string;
}

export interface DNSRecord {
  record: string;
  content: string;
}

export type ProviderEntity = Provider | string

export type DNSProviderEntity = DnsProvider | string

export interface GitRelease {
  id: number;
}

export interface GitReleaseAsset {
  browser_download_url: string;
}
