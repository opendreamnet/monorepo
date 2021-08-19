import { isEmpty } from 'lodash'
import { DeployResult } from '../../types'
import { Http } from '../base/http'

export class Slate extends Http {
  /**
   * Friendly name.
   *
   * @readonly
   */
  public get label(): string {
    return 'Slate'
  }

  /**
   *
   *
   * @readonly
   */
  public get formDataField(): string {
    return 'data'
  }

  /**
   * Request headers.
   *
   * @readonly
   */
  public get headers(): Record<string, unknown> {
    const headers: Record<string, unknown> = {}

    if (!isEmpty(this.token)) {
      headers.Authorization = `Basic ${this.token}`
    }

    return {
      ...headers,
      ...this._headers
    }
  }

  public get defaultBaseUrl(): string | undefined {
    return 'https://uploads.slate.host/api/v2'
  }

  /**
   * Url to upload the file.
   *
   * @readonly
   */
  public get uploadUrl(): string {
    return '/public'
  }

  /**
   * Url of the http gateway.
   *
   * @readonly
   */
  public get gateway(): string {
    return process.env.DEPLOY_SLATE_GATEWAY || 'https://slate.textile.io'
  }

  /**
   * Handles the provider's response when uploading a file.
   *
   * @param {*} response
   */
  public async parse(response: any): Promise<DeployResult> {
    return {
      cid: response.data.cid,
      url: `${this.gateway}/ipfs/${response.data.cid}`
    }
  }

  /**
   * Pin the file that has already been uploaded
   * to another IPFS provider.
   *
   * @remarks
   * This prevents the file from being uploaded multiple times.
   */
   public async pin(cid: string): Promise<any> {
    if (!this.axios) {
      throw new Error('No axios!')
    }

    const data: Record<string, any> = {
      cid
    }

    if (this.release.name) {
      data.filename = this.release.name
    }

    const response = await this.axios.post('/public/upload-by-cid', { data }, {
      timeout: (5 * 60 * 1000)
    })

    return response.data
  }
}
