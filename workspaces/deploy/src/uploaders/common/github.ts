/* eslint-disable camelcase */
import fs from 'fs'
import { Octokit } from '@octokit/rest'
import { GitRelease, GitReleaseAsset } from '../../types/git'
import { Git } from '../base/git'

export class Github extends Git {
  public octokit: Octokit

  /**
   *
   *
   * @returns {Promise<void>}
   */
  public async setup(): Promise<void> {
    this.octokit = new Octokit({ auth: this.token })
  }

  /**
   *
   *
   * @returns {(Promise<GitRelease|null>)}
   */
  public async fetchRelease(): Promise<GitRelease|null> {
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
  public async createRelease(): Promise<GitRelease> {
    if (!this.octokit) {
      throw new Error('Octokit has not been created!')
    }

    const response = await this.octokit.repos.createRelease({
      owner: this.owner as string,
      repo: this.repo as string,
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
    if (!this.octokit) {
      throw new Error('Octokit has not been created!')
    }

    const responses: GitReleaseAsset[] = []

    for (const file of this.release.files) {
      if (file.isDirectory) {
        continue
      }

      // eslint-disable-next-line no-await-in-loop
      const response = await this.octokit.repos.uploadReleaseAsset({
        owner: this.owner!,
        repo: this.repo!,
        release_id: this.gitRelease!.id,
        name: file.name,
        headers: {
          'content-length': file.stats.size,
          'content-type': file.mimetype,
        },
        // @ts-ignore
        data: fs.createReadStream(file.path),
      })

      responses.push(response.data)
    }

    return responses[0]
  }
}
