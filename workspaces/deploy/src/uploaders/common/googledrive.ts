/* eslint-disable camelcase */

/*
import fs from 'fs-extra'
import { google, drive_v3 } from 'googleapis'
import { ServiceAccountCredentials } from 'types/google'
import { Provider } from '../base/base'
*/

/*
export class GoogleDrive extends Provider {
  public drive: drive_v3.Drive

  protected credentials?: ServiceAccountCredentials

  protected _credentialsPath?: string

  public get credentialsPath(): string | undefined {
    return this._credentialsPath || process.env.DEPLOY_GDRIVE_CREDENTIALS
  }

  public get scopes(): any {
    return [
      'https://www.googleapis.com/auth/drive',
    ]
  }

  public validate(): void {
    if (!this.credentialsPath) {
      throw new Error('Missing credentials path: DEPLOY_GDRIVE_CREDENTIALS')
    }
  }

  public async setup(): Promise<void> {
    this.credentials = fs.readJSONSync(this.credentialsPath!)

    const auth = new google.auth.JWT(this.credentials!.client_email, null, this.credentials!.private_key, this.scopes)

    this.drive = google.drive({ version: 'v3', auth })
  }

  public async upload(): Promise<any> {
    const response = await this.drive.files.list({})

    // this.drive.files.create()

    throw new Error('Not implemented')
  }
}
*/
