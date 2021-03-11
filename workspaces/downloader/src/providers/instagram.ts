import cheerio from 'cheerio'
import axios from 'axios'
import { isEmpty, startsWith } from 'lodash'
import URI from 'urijs'
import { Base } from './base'
import { Base as BaseDownloader, Http } from '../downloaders'

export class Instagram extends Base {
  public static create(url: string): Instagram {
    return new Instagram(url)
  }

  public validate(): void {
    if (isEmpty(this.source)) {
      throw new Error('Please specify a Instagram URL or ID.')
    }

    if (!this.isSourceURL) {
      this.source = `https://www.instagram.com/p/${this.source}/`
    }

    const uri = URI(this.source)

    if (uri.hostname() !== 'www.instagram.com') {
      throw new Error('Invalid URL: Please specify a valid Instagram URL.')
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
      throw new Error(`Unable to fetch files: ${err.message}. Please make sure the URL is valid and you are not using a VPN.`)
    }
  }

  public async getUrls(): Promise<string[]> {
    const response = await axios.request({
      url: this.source,
      transformResponse(data) {
        try {
          const matches = data.match(/sharedData\s+=\s+({[^]+});<\/script>/g)

          if (matches.length === 0) {
            throw new Error('No matches for Javascript JSON.')
          }

          const payload = JSON.parse(matches[0].replace('sharedData = ', '').replace(';<\/script>', ''))

          const files = payload.entry_data.PostPage[0].graphql.shortcode_media.edge_sidecar_to_children.edges.map((record) => record.node.display_url)

          return files
        } catch (err) {
          // Yep
        }

        const $ = cheerio.load(data)
        const isVideo = $('meta[name="medium"]').attr('content') === 'video'
        const downloadUrl = isVideo ? $('meta[property="og:video"]').attr('content') : $('meta[property="og:image"]').attr('content')

        if (isEmpty(downloadUrl)) {
          throw new Error('Invalid response')
        }

        return [downloadUrl]
      },
    })

    return response.data
  }
}