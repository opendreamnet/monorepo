import cheerio from 'cheerio'
import axios from 'axios'
import { isEmpty, startsWith } from 'lodash'
import URI from 'urijs'
import { Base } from './base'
import { Base as BaseDownloader, Http } from '../downloaders'

export class FourChan extends Base {
  public static create(url: string): FourChan {
    return new FourChan(url)
  }

  public validate(): void {
    if (isEmpty(this.source)) {
      throw new Error('Please specify a 4chan thread URL.')
    }

    const uri = URI(this.source)

    if (uri.hostname() !== 'boards.4chan.org') {
      throw new Error('Invalid URL: Please specify a valid 4chan thread URL.')
    }

    if (!uri.path().includes('thread')) {
      throw new Error('Invalid URL: Please specify a valid 4chan thread URL.')
    }
  }

  public async fetch(): Promise<BaseDownloader[]> {
    try {
      const urls = await this.getUrls()

      this.files = urls.map((url: string) => {
        return Http.create(url)
      })

      return this.files
    } catch (err) {
      throw new Error(`Unable to fetch files: ${err.message}. Please make sure the URL is valid.`)
    }
  }

  public async getUrls(): Promise<string[]> {
    const response = await axios.get(this.source, {
      transformResponse(data) {
        const urls: string[] = []
        const $ = cheerio.load(data)

        $('.fileThumb').toArray().forEach((el) => {
          let src = $(el).attr('href')

          if (!src || isEmpty(src)) {
            return
          }

          if (!startsWith(src, 'https:')) {
            src = `https:${src}`
          }

          urls.push(src)
        })

        return urls
      },
    })

    return response.data
  }
}