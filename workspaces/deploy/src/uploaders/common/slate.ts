import { isEmpty } from 'lodash'
import { DeployResult } from '../../types'
import { Http } from '../base/http'

export class Slate extends Http {
  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get label(): string {
    return 'Slate'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
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

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get uploadUrl(): string {
    return 'https://uploads.slate.host/api/public'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get gateway(): string {
    return process.env.DEPLOY_SLATE_GATEWAY || 'https://slate.textile.io'
  }

  /**
   *
   *
   * @param {*} response
   */
  public async parse(response: any): Promise<DeployResult> {
    return {
      cid: response.data.cid,
      url: `${this.gateway}/ipfs/${response.data.cid}`
    }
  }
}
