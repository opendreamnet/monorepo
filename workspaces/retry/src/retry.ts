/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable promise/param-names */
/* eslint-disable promise/no-nesting */
/* eslint-disable lodash/prefer-lodash-typecheck */

import { TimeoutError } from './errors'
import { promisify } from './helpers'

export type MaybePromise<T> = Promise<T> | T

export type RetryCallback<T> = () => MaybePromise<T>

export type RetryPromise<T> = () => Promise<T>

/**
 * Options for retry
 */
export interface RetryOptions {
  retry: boolean
  delay: number
}

export interface RetryStats {
  callCount: number
  retryCount: number
  retryMax: number
}

export type FailedAttemptCallback = (error: Error, options: RetryOptions, stats: RetryStats) => MaybePromise<void | Error | RetryOptions>

/**
 * General options
 */
export interface Options {
  /**
   * Maximum number of attempts
   *
   * @default Infinity
   */
  retries?: number

  /**
   * Time in milliseconds for first retry
   *
   * @default 100
   */
  delay?: number

  /**
   * @default 1.1
   */
  delayExponent?: number

  /**
   * Time in milliseconds maximum for each retry
   *
   * @default Infinity
   */
  maxDelay?: number

  /**
   * Time in milliseconds to make timeout
   */
  timeout?: number | null

  /**
   *
   */
  onFailedAttempt?: FailedAttemptCallback | null

  /**
   *
   */
  abortSignal?: AbortSignal | null
}

const defaultOptions: Required<Options> = {
  retries: Infinity,
  delay: 100,
  delayExponent: 1.1,
  maxDelay: Infinity,
  timeout: null,
  onFailedAttempt: null,
  abortSignal: null
}

const MIN_RETRY_DELAY = 10

export class Retry {
  protected options: Required<Options>

  protected callCount = 1

  public get retryCount() {
    return this.callCount - 1
  }

  protected previousError?: Error

  protected timeout?: NodeJS.Timeout

  protected retryTimeout?: NodeJS.Timeout

  protected aborted = false

  public constructor(baseOptions?: Options | number) {
    if (typeof baseOptions === 'number') {
      baseOptions = { retries: baseOptions }
    }

    this.options = {
      ...defaultOptions,
      ...(baseOptions || {})
    }

    if (this.options.abortSignal) {
      this.options.abortSignal.addEventListener('abort', () => {
        this.aborted = true
      })
    }
  }

  protected clearRetryTimeout() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
      this.retryTimeout = undefined
    }
  }

  protected clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = undefined
    }
  }

  protected clear() {
    this.clearTimeout()
    this.clearRetryTimeout()
  }

  public attempt<T>(callback: RetryCallback<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.options.timeout) {
        // Setup timeout
        this.timeout = setTimeout(() => {
          this.clearTimeout()
          return reject(new TimeoutError('Timed out', this.previousError))
        }, this.options.timeout)
      }

      // Execute callback
      promisify(callback)
        // Clear timeouts
        .finally(this.clear.bind(this))
        // Success? Then resolve
        .then(resolve)
        // Error. Setup retry
        .catch(async err => {
          // Save error
          this.previousError = err

          if (this.aborted) {
            // No more retries
            return reject(err)
          }

          const retryOptions: RetryOptions = {
            retry: this.retryCount < this.options.retries,
            delay: Math.max(this.options.delay * Math.pow(this.options.delayExponent, this.retryCount), MIN_RETRY_DELAY)
          }

          if (this.options.onFailedAttempt) {
            // Execute on failed callback
            const response = await promisify(() => {
              return this.options.onFailedAttempt!(err, retryOptions, {
                callCount: this.callCount,
                retryCount: this.retryCount,
                retryMax: this.options.retries
              })
            })
              .catch(reject)

            if (response instanceof Error) {
              // The retry must be stopped
              return reject(response)
            }

            if (typeof response === 'object') {
              // Use other delay for retry
              retryOptions.retry = response.retry
              retryOptions.delay = response.delay
            }
          }

          if (!retryOptions.retry) {
            // No more retries
            return reject(err)
          }

          // One more time
          this.callCount += 1

          // Minimium
          retryOptions.delay = Math.min(Math.max(retryOptions.delay, MIN_RETRY_DELAY), this.options.maxDelay)

          this.retryTimeout = setTimeout(() => {
            // Try again
            this.attempt(callback)
              .then(resolve)
              .catch(reject)
          }, retryOptions.delay)
        })
    })
  }
}

export function retry<T>(callback: RetryCallback<T>, baseOptions?: Options | number): Promise<T> {
  const retryInstance = new Retry(baseOptions)
  return retryInstance.attempt(callback)
}
