import { Gitea } from '../gitea'

export class Codeberg extends Gitea {
  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get label(): string {
    return 'Codeberg.org'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get baseURL(): string {
    return super.baseURL || 'https://codeberg.org/api/v1'
  }
}
