import { Gitea } from '../common/gitea'

export class Codeberg extends Gitea {
  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get label(): string {
    return 'Codeberg'
  }

  /**
   *
   *
   * @readonly
   * @type {(string | undefined)}
   */
  public get defaultBaseURL(): string | undefined {
    return 'https://codeberg.org/api/v1'
  }
}
