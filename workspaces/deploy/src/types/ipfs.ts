/**
 * Content of a file for IPFS.
 */
export type FileContent = Uint8Array | Blob | string | Iterable<Uint8Array> | Iterable<number> | AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>

/**
 * Unix time for IPFS.
 */
export type UnixTime = Date | { secs: number, nsecs?: number } | number[]

/**
 *
 *
 * @export
 * @interface FileObject
 */
export interface FileObject {
  path: string,
  content?: FileContent
  mode?: number | string
  mtime?: UnixTime
}
