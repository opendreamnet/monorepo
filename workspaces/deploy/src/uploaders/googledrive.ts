/* eslint-disable */
import fs from 'fs-extra'
import { google, drive_v3 } from 'googleapis'
import { ServiceAccountCredentials } from '../modules/types'
import { Provider } from './base/base'

export class GoogleDrive extends Provider {
  // eslint-disable-next-line @typescript-eslint/camelcase
  drive: drive_v3.Drive

  credentials?: ServiceAccountCredentials

  _credentialsPath?: string

  get credentialsPath(): string {
    return this._credentialsPath || process.env.DEPLOY_GDRIVE_CREDENTIALS
  }

  get scopes(): any {
    return [
      'https://www.googleapis.com/auth/drive',
    ]
  }

  validate(): void {
    if (!this.credentialsPath) {
      throw new Error('Missing credentials path: DEPLOY_GDRIVE_CREDENTIALS')
    }
  }

  async setup(): Promise<void> {
    this.credentials = fs.readJSONSync(this.credentialsPath)

    const auth = new google.auth.JWT(this.credentials.client_email, null, this.credentials.private_key, this.scopes)

    this.drive = google.drive({ version: 'v3', auth })
  }

  async upload(): Promise<any> {
    const response = await this.drive.files.list({})

    // this.drive.files.create()

    throw new Error('NOT IMPLEMENTED')
  }
}
