import { find, isEmpty } from 'lodash'
import { AxiosRequestConfig } from 'axios'
import { GitRelease, GitReleaseAsset } from '../modules/types'
import { Http } from './base/http'
import { Git } from './mixins/git'

export interface Gitea {
  _host?: string;
}

// eslint-disable-next-line new-cap
export class Gitea extends Git(Http) {
  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get label(): string {
    return `Gitea (${this.baseURL})`
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get fileFieldName(): string {
    return 'attachment'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get baseURL(): string {
    return this._host || process.env[`DEPLOY_${this.name.toUpperCase()}_HOST`] || super.baseURL
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get uploadURL(): string {
    if (!this.gitRelease) {
      return ''
    }

    return `/repos/${this.owner}/${this.repo}/releases/${this.gitRelease.id}/assets`
  }

  /**
   *
   *
   * @readonly
   * @type {*}
   */
  get headers(): any {
    const headers: any = super.headers

    if (!isEmpty(this.token)) {
      headers.Authorization = `token ${this.token}`
    }

    return headers
  }

  /**
   *
   *
   * @readonly
   * @type {AxiosRequestConfig}
   */
  get uploadOptions(): AxiosRequestConfig {
    return {
      ...super.uploadOptions,
      params: {
        name: this.release.file.name,
      },
    }
  }

  /**
   *
   *
   * @returns {(Promise<GitRelease|null>)}
   */
  async fetchRelease(): Promise<GitRelease|null> {
    if (!this.axios) {
      throw new Error('Axios has not been created!')
    }

    const response = await this.axios.get(`/repos/${this.owner}/${this.repo}/releases`)

    // eslint-disable-next-line @typescript-eslint/camelcase
    return find(response.data, { tag_name: this.tagName })
  }

  /**
   *
   *
   * @returns {Promise<GitRelease>}
   */
  async createRelease(): Promise<GitRelease> {
    if (!this.axios) {
      throw new Error('Axios has not been created!')
    }

    const response = await this.axios.post(`/repos/${this.owner}/${this.repo}/releases`, {
      // eslint-disable-next-line @typescript-eslint/camelcase
      tag_name: this.tagName as string,
      name: this.releaseName,
      prerelease: true,
      draft: false,
    })

    return response.data
  }

  /**
   *
   *
   * @returns {Promise<GitReleaseAsset>}
   */
  async uploadReleaseAsset(): Promise<GitReleaseAsset> {
    if (!this.axios) {
      throw new Error('Axios has not been created!')
    }

    if (!this.gitRelease) {
      throw new Error('The Git release could not be obtained or created.')
    }

    await this.createFormData()

    const response = await this.axios.request(this.uploadOptions)

    return response.data
  }
}
