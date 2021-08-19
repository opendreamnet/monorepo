import fs from 'fs'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import FormData from 'form-data'
import { ReleaseFile } from '../../types'
import { Provider } from './base'

export interface Http {
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
  readonly uploadUrl: string;

  /**
   *
   */
  readonly unpinUrl?: string;
}

export class Http extends Provider {
  /**
   * Friendly name.
   *
   * @readonly
   */
  public get label(): string {
    return this.uploadUrl ? `Http (${this.uploadUrl})` : super.label
  }

  /**
   * Name of the field for the file.
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
  public getOptions(): AxiosRequestConfig {
    return {
      baseURL: this.baseUrl,
      timeout: 5 * 1000,
      headers: this.headers
    }
  }

  /**
   * Upload request options.
   *
   * @readonly
   */
  public getUploadOptions(files?: ReleaseFile[]): AxiosRequestConfig {
    if (!files) {
      files = this.release.files
    }

    const formData = this.getFormData(files)

    return {
      method: 'POST',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: (60 * 60 * 1000),
      url: this.uploadUrl,
      data: formData,
      headers: formData.getHeaders(this.headers)
    }
  }

  /**
   *
   */
  public setBaseUrl(value: string): this {
    this._baseURL = value
    return this
  }

  /**
   * Provider initialization.
   */
  public async setup?(): Promise<void> {
    this.axios = axios.create(this.getOptions())
  }

  /**
   *
   */
  public async upload(): Promise<unknown> {
    if (!this.axios) {
      throw new Error('Axios has not been created.')
    }

    const response = await this.axios.request(this.getUploadOptions())

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

    if (!this.unpinUrl) {
      return
    }

    await this.axios.request({
      method: 'DELETE',
      url: `${this.unpinUrl}/${this.release.previousCID}`,
      timeout: (15 * 60 * 1000)
    })
  }

  /**
   *
   *
   * @returns {void}
   */
  public getFormData(files: ReleaseFile[]): FormData {
    const formData = new FormData()

    files.forEach(file => {
      if (file.isDirectory) {
        return
      }

      formData.append(this.formDataField, fs.createReadStream(file.path), {
        filename: file.name,
        filepath: file.relpath
      })
    })

    return formData
  }
}
