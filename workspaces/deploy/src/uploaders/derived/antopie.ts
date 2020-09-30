import { Gitea } from '../gitea'

export class Antopie extends Gitea {
  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get label(): string {
    return 'Antopie.org'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get baseURL(): string {
    return super.baseURL || 'https://code.antopie.org/api/v1'
  }
}
