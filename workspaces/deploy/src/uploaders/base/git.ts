import { UploadResult } from '../../types'
import { GitRelease, GitReleaseAsset } from '../../types/git'
import { Http } from './http'

export class Git extends Http {
  protected _owner?: string

  protected _repo?: string

  protected _tagName?: string

  protected _target?: string

  protected _releaseName?: string

  public gitRelease?: GitRelease

  public get owner(): string | undefined {
    return this._owner || process.env[`DEPLOY_${this.name.toUpperCase()}_OWNER`] || process.env.DEPLOY_GIT_OWNER
  }

  public get repo(): string | undefined {
    return this._repo || process.env[`DEPLOY_${this.name.toUpperCase()}_REPO`] || process.env.DEPLOY_GIT_REPO
  }

  public get tagName(): string | undefined {
    return this._tagName || process.env[`DEPLOY_${this.name.toUpperCase()}_TAG`] || process.env.DEPLOY_GIT_TAG
  }

  public get target(): string | undefined {
    return this._target || process.env[`DEPLOY_${this.name.toUpperCase()}_TARGET`] || process.env.DEPLOY_GIT_TARGET
  }

  public get releaseName(): string | undefined {
    return this._releaseName ||
      process.env[`DEPLOY_${this.name.toUpperCase()}_RELEASE_NAME`] ||
      process.env.DEPLOY_GIT_RELEASE_NAME ||
      this.tagName
  }

  public setOwner(value: string): this {
    this._owner = value
    return this
  }

  public setRepo(value: string): this {
    this._repo = value
    return this
  }

  public setTagName(value: string): this {
    this._tagName = value
    return this
  }

  public setTarget(value: string): this {
    this._target = value
    return this
  }

  public setReleaseName(value: string): this {
    this._releaseName = value
    return this
  }

  public validate?(): void {
    if (!this.owner) {
      throw new Error(`Missing repository owner: DEPLOY_${this.name.toUpperCase()}_OWNER`)
    }

    if (!this.repo) {
      throw new Error(`Missing repository: DEPLOY_${this.name.toUpperCase()}_REPO`)
    }

    if (!this.tagName) {
      throw new Error(`Missing release tag: DEPLOY_${this.name.toUpperCase()}_TAG`)
    }
  }

  public async upload(): Promise<unknown> {
    this.gitRelease = await this.getRelease()

    return this.uploadReleaseAsset()
  }

  public async parse(response: unknown): Promise<UploadResult> {
    return {
      cid: undefined,
      // @ts-ignore
      url: response.browser_download_url,
    }
  }

  public async getRelease(): Promise<GitRelease> {
    const gitRelease = await this.fetchRelease()

    if (gitRelease) {
      return gitRelease
    }

    return this.createRelease()
  }

  public async fetchRelease(): Promise<GitRelease|null> {
    throw new Error('Not implemented')
  }

  public async createRelease(): Promise<GitRelease> {
    throw new Error('Not implemented')
  }

  public async uploadReleaseAsset(): Promise<GitReleaseAsset> {
    throw new Error('Not implemented')
  }
}
