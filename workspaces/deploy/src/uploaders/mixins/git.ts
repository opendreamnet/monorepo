import { UrlHash, GitRelease, GitReleaseAsset } from '../../modules/types'
import { Provider } from '../base/base'

type Constructor<T> = new(...args: any[]) => T

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Git<T extends Constructor<Provider>>(Base: T) {
  return class extends Base {
    /**
     *
     *
     * @type {string}
     */
    _owner?: string

    /**
     *
     *
     * @type {string}
     */
    _repo?: string

    /**
     *
     *
     * @type {string}
     */
    _tagName?: string

    /**
     *
     *
     * @type {string}
     */
    _releaseName?: string

    /**
     *
     *
     * @type {GitRelease}
     */
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

    /**
     *
     *
     * @readonly
     * @type {(string | undefined)}
     */
    get owner(): string | undefined {
      return this._owner || process.env[`DEPLOY_${this.name.toUpperCase()}_OWNER`] || process.env.DEPLOY_GIT_OWNER
    }

    /**
     *
     *
     * @readonly
     * @type {(string | undefined)}
     */
    get repo(): string | undefined {
      return this._repo || process.env[`DEPLOY_${this.name.toUpperCase()}_REPO`] || process.env.DEPLOY_GIT_REPO
    }

    /**
     *
     *
     * @readonly
     * @type {(string | undefined)}
     */
    get tagName(): string | undefined {
      return this._tagName || process.env[`DEPLOY_${this.name.toUpperCase()}_TAG`] || process.env.DEPLOY_GIT_TAG
    }

    /**
     *
     *
     * @readonly
     * @type {(string | undefined)}
     */
    get releaseName(): string | undefined {
      return this._releaseName ||
        process.env[`DEPLOY_${this.name.toUpperCase()}_RELEASE`] ||
        process.env.DEPLOY_GIT_RELEASE ||
        this.tagName
    }

    /**
     *
     *
     * @param {string} value
     * @returns {this}
     */
    setOwner(value: string): this {
      this._owner = value
      return this
    }

    /**
     *
     *
     * @param {string} value
     * @returns {this}
     */
    setRepo(value: string): this {
      this._repo = value
      return this
    }

    /**
     *
     *
     * @param {string} value
     * @returns {this}
     */
    setTagName(value: string): this {
      this._tagName = value
      return this
    }

    /**
     *
     *
     * @param {string} value
     * @returns {this}
     */
    setReleaseName(value: string): this {
      this._releaseName = value
      return this
    }

    /**
     *
     *
     */
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

    /**
     *
     *
     * @returns {Promise<any>}
     */
    async upload(): Promise<any> {
      this.gitRelease = await this.getRelease()

      // eslint-disable-next-line no-return-await
      return await this.uploadReleaseAsset()
    }

    /**
     *
     *
     * @param {*} response
     * @returns {Promise<UrlHash>}
     */
    async parse(response: any): Promise<UrlHash> {
      return {
        cid: null,
        url: response.browser_download_url,
      }
    }

    /**
     *
     *
     * @returns {Promise<GitRelease>}
     */
    async getRelease(): Promise<GitRelease> {
      const gitRelease = await this.fetchRelease()

      if (gitRelease) {
        return gitRelease
      }

      // eslint-disable-next-line no-return-await
      return await this.createRelease()
    }

    /**
     *
     *
     * @returns {(Promise<GitRelease|null>)}
     */
    async fetchRelease(): Promise<GitRelease|null> {
      throw new Error('TODO: IMPLEMENT')
    }

    /**
     *
     *
     * @returns {Promise<GitRelease>}
     */
    async createRelease(): Promise<GitRelease> {
      throw new Error('TODO: IMPLEMENT')
    }

    /**
     *
     *
     * @returns {Promise<GitReleaseAsset>}
     */
    async uploadReleaseAsset(): Promise<GitReleaseAsset> {
      throw new Error('TODO: IMPLEMENT')
    }
  }
}
