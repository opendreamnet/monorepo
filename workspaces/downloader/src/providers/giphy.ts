import { GiphyFetch } from '@giphy/js-fetch-api'
import { isEmpty } from 'lodash'
import URI from 'urijs'
import { Base } from './base'
import { Base as BaseDownloader, Http } from '../downloaders'
import 'isomorphic-fetch'

export class Giphy extends Base {
  public client: GiphyFetch

  public giphyID: string

  public static create(url: string): Giphy {
    return new Giphy(url)
  }

  public constructor(source: string, apiKey = 'dc6zaTOxFJmzC') {
    super(source)

    this.client = new GiphyFetch(apiKey)
    this.giphyID = source.split('/').reverse()[0].split('-').reverse()[0]
  }

  public validate(): void {
    if (isEmpty(this.source)) {
      throw new Error('Please specify a Giphy URL or ID.')
    }

    const uri = URI(this.source)

    if (uri.hostname() !== 'giphy.com') {
      throw new Error('Invalid URL: Please specify a valid Giphy URL.')
    }
  }

  public async fetch(): Promise<BaseDownloader[]> {
    try {
      const { data } = await this.client.gif(this.giphyID)

      return [
        Http.create(data.images.original.mp4, { filename: `${this.giphyID}.mp4` }),
      ]
    } catch (err) {
      throw new Error(`Unable to fetch files: ${err.message}. Please make sure the URL is valid.`)
    }
  }
}