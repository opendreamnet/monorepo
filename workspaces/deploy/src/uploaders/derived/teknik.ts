import { Gitea } from '../common/gitea'

export class Teknik extends Gitea {
  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get label(): string {
    return 'Teknik.io'
  }

  /**
   *
   *
   * @readonly
   * @type {(string | undefined)}
   */
  public get defaultBaseURL(): string | undefined {
    return 'https://git.teknik.io/api/v1'
  }
}
