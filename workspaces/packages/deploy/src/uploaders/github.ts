import fs from 'fs'
import { Octokit } from '@octokit/rest'
import { GitRelease, GitReleaseAsset } from '../modules/interfaces'
import { Git } from './mixins/git'
import { Provider } from './base/base'

export interface Github {
  octokit?: Octokit;
}

// eslint-disable-next-line new-cap
export class Github extends Git(Provider) {
  /**
   *
   *
   * @returns {Promise<void>}
   */
  async setup(): Promise<void> {
    this.octokit = new Octokit({ auth: this.token })
  }

  /**
   *
   *
   * @returns {(Promise<GitRelease|null>)}
   */
  async fetchRelease(): Promise<GitRelease|null> {
    if (!this.octokit) {
      throw new Error('Octokit has not been created!')
    }

    try {
      const response = await this.octokit.repos.getReleaseByTag({
        owner: this.owner as string,
        repo: this.repo as string,
        tag: this.tagName as string,
      })

      return response.data
    } catch (error) {
      if (error.status !== 404) {
        throw error
      }

      return null
    }
  }

  /**
   *
   *
   * @returns {Promise<GitRelease>}
   */
  async createRelease(): Promise<GitRelease> {
    if (!this.octokit) {
      throw new Error('Octokit has not been created!')
    }

    const response = await this.octokit.repos.createRelease({
      owner: this.owner as string,
      repo: this.repo as string,
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
    if (!this.octokit) {
      throw new Error('Octokit has not been created!')
    }

    const file = this.release.file

    const response = await this.octokit.repos.uploadReleaseAsset({
      owner: this.owner as string,
      repo: this.repo as string,
      release_id: this.gitRelease.id,
      name: file.name,
      headers: {
        'content-length': file.stats.size,
        'content-type': file.mimetype,
      },
      // @ts-ignore
      data: fs.createReadStream(file.path),
    })

    return response.data
  }
}
