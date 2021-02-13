
import fs from 'fs'

export interface UploadResult {
  /**
   * Provider name.
   *
   * @type {string}
   */
  provider?: string;

  /**
   * Url of the uploaded file.
   *
   * @type {string}
   */
  url: string;

  /**
   * IPFS CID of the uploaded file.
   *
   * @type {string}
   */
  cid?: string;
}

export interface ReleaseFile {
  /**
   * Absolute path of the file
   * Example: C:\folder\photo.png
   *
   * @type {string}
   */
  path: string;
  /**
   * Relative path (posix) of the file
   * Example: /folder/photo.png
   *
   * @type {string}
   */
  relpath: string;
  /**
   * File content
   *
   * @type {ReadableStream<Uint8Array>}
   */
  content?: ReadableStream<Uint8Array>;
  /**
   * File name
   * Example: photo.png
   *
   * @type {string}
   */
  name: string;
  /**
   * File mimetype
   * Example: image/png
   *
   * @type {string}
   */
  mimetype?: string;
  /**
   * File stat
   *
   * @type {fs.Stats}
   */
  stats: fs.Stats;
  /**
   * Indicates if it is a directory
   *
   * @type {boolean}
   */
  isDirectory: boolean;
}

export interface DnsLink {
  zone: string;
  record: string;
  link: string;
}

export interface DnsRecord {
  record: string;
  content: string;
}

export interface Multiaddress {
  family: 4 | 6
  address: string
  port: number
  protocol: string
  /**
   * Indicates whether the connection should be secure.
   *
   * @type {boolean}
   */
  ssl: boolean,
  url: string
}

