import fs from 'fs'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import FormData from 'form-data'
import { ReleaseFile } from '../../types'
import { Provider } from './base'

export interface Http {
  /**
   *
   */
  formData: FormData;

  /**
   *
   */
  axios?: AxiosInstance;

  /**
   *
   */
  _baseURL?: string

  /**
   *
   */
  readonly uploadURL: string;

  /**
   *
   */
  readonly unpinURL?: string;
}

export class Http extends Provider {
  /**
   * Friendly provider name.
   *
   * @readonly
   */
  public get label(): string {
    return this.uploadURL ? `Http (${this.uploadURL})` : super.label
  }

  /**
   *
   *
   * @readonly
   */
  public get formDataField(): string {
    return 'file'
  }

  /**
   *
   *
   * @readonly
   */
  public get defaultBaseUrl(): string | undefined {
    return undefined
  }

  /**
   *
   *
   * @readonly
   */
  public get baseUrl(): string | undefined {
    return this._baseURL || process.env[`DEPLOY_${this.name.toUpperCase()}_BASEURL`] || this.defaultBaseUrl
  }

  /**
   *
   *
   * @readonly
   */
  public get options(): AxiosRequestConfig {
    return {
      baseURL: this.baseUrl,
      timeout: 5 * 1000,
      headers: this.headers
    }
  }

  /**
   *
   *
   * @readonly
   */
  public get uploadOptions(): AxiosRequestConfig {
    return {
      method: 'POST',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: (60 * 60 * 1000),
      url: this.uploadURL,
      data: this.formData,
      headers: this.formData.getHeaders(this.headers)
    }
  }

  /**
   *
   */
  public setBaseURL(value: string): this {
    this._baseURL = value
    return this
  }

  /**
   *
   */
  public async setup?(): Promise<void> {
    this.axios = axios.create(this.options)
  }

  /**
   *
   */
  public async upload(): Promise<unknown> {
    if (!this.axios) {
      throw new Error('Axios has not been created.')
    }

    this.createFormData()

    const response = await this.axios.request(this.uploadOptions)

    return response.data
  }

  /**
   *
   *
   * @return {*}  {Promise<void>}
   */
  public async unpin(): Promise<void> {
    if (!this.axios) {
      throw new Error('Axios has not been created.')
    }

    if (!this.unpinURL) {
      return
    }

    await this.axios.request({
      method: 'DELETE',
      url: `${this.unpinURL}/${this.release.previousCID}`,
      timeout: (15 * 60 * 1000)
    })
  }

  /**
   *
   *
   * @returns {void}
   */
  public createFormData(files?: ReleaseFile[]): void {
    this.formData = new FormData()

    if (!files) {
      files = this.release.files
    }

    files.forEach(file => {
      if (file.isDirectory) {
        return
      }

      this.formData.append(this.formDataField, fs.createReadStream(file.path), {
        filename: file.name,
        filepath: file.relpath
      })
    })
  }
}
