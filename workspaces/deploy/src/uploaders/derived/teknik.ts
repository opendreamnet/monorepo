import { Gitea } from '../gitea'

export class Teknik extends Gitea {
  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get label(): string {
    return 'Teknik.io'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get baseURL(): string {
    return super.baseURL || 'https://git.teknik.io/api/v1'
  }
}
