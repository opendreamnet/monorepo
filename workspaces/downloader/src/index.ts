import { Http } from './downloaders/http'
import { IPFS } from './downloaders/ipfs'
export const Downloader = {
  http: Http.create,
  ipfs: IPFS.create,
}

export * from './downloaders'
export * from './providers'