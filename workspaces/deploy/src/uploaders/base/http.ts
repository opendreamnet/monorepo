import fs from 'fs'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import FormData from 'form-data'
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
  readonly uploadURL: string;

  /**
   *
   * @unused
   * @type {string}
   */
  readonly pinURL?: string;
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
   *
   *
   * @readonly
   * @type {string}
   */
  get label(): string {
    return this.uploadURL ? `Http (${this.uploadURL})` : super.label
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get fileFieldName(): string {
    return 'file'
  }

  /**
   *
   *
   * @readonly
   * @type {string}
   */
  get baseURL(): string {
    return ''
  }

  /**
   *
   *
   * @readonly
   * @type {AxiosRequestConfig}
   */
  get options(): AxiosRequestConfig {
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
  get uploadOptions(): AxiosRequestConfig {
    return {
      method: 'POST',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: (15 * 60 * 1000),
      url: this.uploadURL,
      data: this.formData,
      headers: this.formData.getHeaders(this.headers),
    }
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  async setup?(): Promise<void> {
    this.axios = axios.create(this.options)
  }

  /**
   *
   *
   * @returns {Promise<any>}
   */
  async upload(): Promise<any> {
    if (!this.axios) {
      return
    }

    await this.createFormData()

    const response = await this.axios.request(this.uploadOptions)

    return response.data
  }

  /**
   *
   *
   * @returns {Promise<void>}
   */
  async createFormData(): Promise<void> {
    this.formData = new FormData()

    this.release.files.forEach(file => {
      if (file.isDirectory) {
        return
      }

      this.formData.append(this.fileFieldName, fs.createReadStream(file.path), {
        filename: file.name,
        filepath: file.relpath,
      })
    })
  }
}
