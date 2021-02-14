/* eslint-disable camelcase */
import { find, isEmpty } from 'lodash'
import { GitRelease, GitReleaseAsset } from '../../types/git'
import { Git } from '../base/git'

export class Gitea extends Git {
  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get label(): string {
    return `Gitea (${this.baseURL})`
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get fileField(): string {
    return 'attachment'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get uploadURL(): string {
    return `/repos/${this.owner}/${this.repo}/releases/${this.gitRelease?.id}/assets`
  }

  /**
   *
   *
   * @readonly
   * @type {*}
   */
  public get headers(): Record<string, unknown> {
    const headers: Record<string, unknown> = super.headers

    if (!isEmpty(this.token)) {
      headers.Authorization = `token ${this.token}`
    }

    return headers
  }

  /**
   *
   *
   * @returns {(Promise<GitRelease|null>)}
   */
  public async fetchRelease(): Promise<GitRelease|null> {
    if (!this.axios) {
      throw new Error('Axios has not been created!')
    }

    const response = await this.axios.get(`/repos/${this.owner}/${this.repo}/releases`)

    return find(response.data, { tag_name: this.tagName })
  }

  /**
   *
   *
   * @returns {Promise<GitRelease>}
   */
  public async createRelease(): Promise<GitRelease> {
    if (!this.axios) {
      throw new Error('Axios has not been created!')
    }

    const response = await this.axios.post(`/repos/${this.owner}/${this.repo}/releases`, {
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
  public async uploadReleaseAsset(): Promise<GitReleaseAsset> {
    if (!this.axios) {
      throw new Error('Axios has not been created!')
    }

    const responses: GitReleaseAsset[] = []

    for (const file of this.release.files) {
      if (file.isDirectory) {
        continue
      }

      this.createFormData([file])

      // eslint-disable-next-line no-await-in-loop
      const response = await this.axios.request({
        ...this.uploadOptions,
        params: {
          name: file.name,
        },
      })

      responses.push(response.data)
    }

    return responses[0]
  }
}
