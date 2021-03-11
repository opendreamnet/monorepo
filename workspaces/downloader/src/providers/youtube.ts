import ytdl, { videoInfo, videoFormat } from 'ytdl-core'
import formatUtils from 'ytdl-core/lib/format-utils'
import sanitize from 'sanitize-filename'
import { Base } from './base'
import { Base as BaseDownloader, Http } from '../downloaders'

export class YouTube extends Base {
  public static create(url: string): YouTube {
    return new YouTube(url)
  }

  public validate(): void {
    if (!ytdl.validateURL(this.source)) {
      throw new Error('Invalid URL: Please specify a valid YouTube URL.')
    }
  }

  public async fetch(): Promise<BaseDownloader[]> {
    try {
      const response = await ytdl.getInfo(this.source)

      this.checkPlayerError(response.player_response, ['UNPLAYABLE', 'LIVE_STREAM_OFFLINE', 'LOGIN_REQUIRED'])

      if (response.formats.length === 0) {
        throw new Error('Video unavailable.')
      }

      const format: videoFormat = formatUtils.chooseFormat(response.formats, {
        quality: 'highestvideo',
        filter: 'videoandaudio',
      })

      this.files = [
        Http.create(format.url, {
          filename: `${sanitize(response.videoDetails.title)}.${format.qualityLabel}.${format.container}`,
          fetch: true,
        }),
      ]

      return this.files
    } catch(err) {
      throw new Error(`Unable to fetch files: ${err.message}. Please make sure the URL is valid and you are not using a VPN.`)
    }
  }

  public checkPlayerError(response: videoInfo['player_response'], statuses: string[]): void {
    const playability = response.playabilityStatus

    if (playability && statuses.includes(playability.status)) {
      // @ts-ignore
      throw new Error(playability.reason || (playability.messages && playability.messages[0]))
    }
  }
}