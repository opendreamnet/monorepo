import type { RetryCallback } from './retry'

export function promisify<T>(callback: RetryCallback<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    try {
      const result = callback()

      if (result instanceof Promise) {
        result.then(resolve).catch(reject)
      } else {
        resolve(result)
      }
    } catch (err) {
      reject(err)
    }
  })
}
