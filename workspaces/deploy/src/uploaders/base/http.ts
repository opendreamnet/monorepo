import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import { ReleaseFile } from '../../types'
import { Provider } from './base'

export interface Http {
  /**
   *
   *
   * @type {FormData}
   */
  formData: FormData;

  /**
   *
   *
   * @type {AxiosInstance}
   */
  axios?: AxiosInstance;

  /**
   *
   *
   * @type {string}
   */
  _baseURL?: string

  /**
   *
   *
   * @type {string}
   */
  readonly uploadURL: string;

  /**
   *
   * @type {string}
   */
  readonly unpinURL?: string;
}

/**
 *
 *
 * @export
 * @abstract
 * @class Http
 * @extends {Provider}
 */
export class Http extends Provider {
  /**
   * Friendly provider name.
   *
   * @readonly
   * @type {string}
   */
  public get label(): string {
    return this.uploadURL ? `Http (${this.uploadURL})` : super.label
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get fileField(): string {
    return 'file'
  }

  /**
   *
   *
   * @readonly
   * @type {(string | undefined)}
   */
  public get defaultBaseURL(): string | undefined {
    return undefined
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  public get baseURL(): string | undefined {
    return this._baseURL || process.env[`DEPLOY_${this.name.toUpperCase()}_BASEURL`] || this.defaultBaseURL
  }

  /**
   *
   *
   * @readonly
   * @type {AxiosRequestConfig}
   */
  public get options(): AxiosRequestConfig {
    return {
      baseURL: this.baseURL,
      timeout: 5 * 1000,
      headers: this.headers,
    }
  }

  /**
   *
   *
   * @readonly
   * @type {AxiosRequestConfig}
   */
  public get uploadOptions(): AxiosRequestConfig {
    return {
      method: 'POST',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: (60 * 60 * 1000),
      url: this.uploadURL,
      data: this.formData,
      headers: this.formData.getHeaders(this.headers),
    }
  }

  /**
   *
   *
   * @param {string} value
   * @return {*}  {this}
   */
  public setBaseURL(value: string): this {
    this._baseURL = value
    return this
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  public async setup?(): Promise<void> {
    this.axios = axios.create(this.options)
  }

  /**
   *
   *
   * @returns {Promise<any>}
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
      timeout: (15 * 60 * 1000),
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

      this.formData.append(this.fileField, fs.createReadStream(file.path), {
        filename: file.name,
        filepath: file.relpath,
      })
    })
  }
}
