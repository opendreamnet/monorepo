import { UrlHash, GitRelease, GitReleaseAsset } from '../../modules/interfaces'
import { Provider } from '../base/base'

/*
interface Git {
  _owner?: string;

  _repo?: string;

  _tagName?: string;

  _releaseName?: string;

  gitRelease?: GitRelease;
}
*/

type Constructor<T> = new(...args: any[]) => T

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Git<T extends Constructor<Provider>>(Base: T) {
  return class extends Base {
    _owner?: string

    _repo?: string

    _tagName?: string

    _releaseName?: string

    gitRelease?: GitRelease

    /**
     *
     *
     * @readonly
     * @type {boolean}
     */
    get hasDirectorySupport(): boolean {
      return false
    }

    get owner(): string | undefined {
      return this._owner || process.env[`DEPLOY_${this.name.toUpperCase()}_OWNER`] || process.env.DEPLOY_GIT_OWNER
    }

    get repo(): string | undefined {
      return this._repo || process.env[`DEPLOY_${this.name.toUpperCase()}_REPO`] || process.env.DEPLOY_GIT_REPO
    }

    get tagName(): string | undefined {
      return this._tagName || process.env[`DEPLOY_${this.name.toUpperCase()}_TAG`] || process.env.DEPLOY_GIT_TAG
    }

    get releaseName(): string | undefined {
      return this._releaseName || process.env[`DEPLOY_${this.name.toUpperCase()}_RELEASE`] || process.env.DEPLOY_GIT_RELEASE || this.tagName
    }

    validate?(): void {
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

    async upload(): Promise<any> {
      this.gitRelease = await this.getRelease()

      // eslint-disable-next-line no-return-await
      return await this.uploadReleaseAsset()
    }

    async parse(response: any): Promise<UrlHash> {
      return {
        cid: null,
        url: response.browser_download_url,
      }
    }

    async getRelease(): Promise<GitRelease> {
      const gitRelease = await this.fetchRelease()

      if (gitRelease) {
        return gitRelease
      }

      // eslint-disable-next-line no-return-await
      return await this.createRelease()
    }

    async fetchRelease(): Promise<GitRelease|null> {
      throw new Error('TODO: IMPLEMENT')
    }

    async createRelease(): Promise<GitRelease> {
      throw new Error('TODO: IMPLEMENT')
    }

    async uploadReleaseAsset(): Promise<GitReleaseAsset> {
      throw new Error('TODO: IMPLEMENT')
    }
  }
}

/*
abstract class Git {
  get owner(): string | undefined {
    return this._owner || process.env[`DEPLOY_${this.name.toUpperCase()}_OWNER`]
  }

  get repo(): string | undefined {
    return this._repo || process.env[`DEPLOY_${this.constructor.name.toUpperCase()}_REPO`]
  }

  get tagName(): string | undefined {
    return this._tagName || process.env[`DEPLOY_${this.constructor.name.toUpperCase()}_TAG`]
  }

  get releaseName(): string | undefined {
    return this._releaseName || process.env[`DEPLOY_${this.constructor.name.toUpperCase()}_RELEASE`] || this.tagName
  }

  validate?(): void {
    if (!this.owner) {
      console.log(this, this.constructor, this.constructor.name)
      throw new Error(`Missing repository owner: DEPLOY_${this.constructor.name.toUpperCase()}_OWNER`)
    }

    if (!this.repo) {
      throw new Error(`Missing repository: DEPLOY_${this.constructor.name.toUpperCase()}_REPO`)
    }

    if (!this.tagName) {
      throw new Error(`Missing release tag: DEPLOY_${this.constructor.name.toUpperCase()}_TAG`)
    }
  }

  async upload(): Promise<any> {
    console.log('Git Upload')

    this.gitRelease = await this.getRelease()

    // eslint-disable-next-line no-return-await
    return await this.uploadReleaseAsset()
  }

  async parse(response: any): Promise<UrlHash> {
    return {
      cid: null,
      url: response.browser_download_url,
    }
  }

  async getRelease(): Promise<GitRelease> {
    const gitRelease = await this.fetchRelease()

    if (gitRelease) {
      return gitRelease
    }

    // eslint-disable-next-line no-return-await
    return await this.createRelease()
  }

  abstract async fetchRelease(): Promise<GitRelease|null>

  abstract async createRelease(): Promise<GitRelease>

  abstract async uploadReleaseAsset(): Promise<GitReleaseAsset>
}
*/
