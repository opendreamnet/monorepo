export type ControllerOptions = {
  /**
   * Flag to activate custom config for tests.
   */
  test?: boolean
  /**
   * Use remote endpoint to spawn the nodes. Defaults to true when not in node.
   */
  remote?: boolean
  /**
   * Endpoint URL to manage remote Controllers. (Defaults: `http://localhost:43134`).
   */
  endpoint?: string
  /**
   * A new repo is created and initialized for each invocation, as well as cleaned up automatically once the process exits.
   */
  disposable?: boolean
  /**
   * The daemon type
   */
  type?: 'go' | 'js' | 'proc'
  /**
   * Additional environment variables, passed to executing shell. Only applies for Daemon controllers.
   */
  env?: Record<string, any>
  /**
   * Custom cli args.
   */
  args?: string[]
  /**
   * Reference to a IPFS HTTP Client object.
   */
  ipfsHttpModule?: any
  /**
   * Reference to a IPFS API object.
   */
  ipfsModule?: any
  /**
   * Path to a IPFS exectutable.
   */
  ipfsBin?: string
  /**
   * Options for the IPFS instance same as https://github.com/ipfs/js-ipfs#ipfs-constructor.
   * proc nodes receive these options as is, daemon nodes translate the options as far as possible to cli arguments.
   * TODO: type
   */
  ipfsOptions?: any
  /**
   * Whether to use SIGKILL to quit a daemon that does not stop after .stop() is called. (default true)
   *
   */
  forceKill?: boolean
  /**
   * How long to wait before force killing a daemon in ms. (default 5000)
   */
  forceKillTimeout?: number
}

export type Time = { secs: number, nsecs?: number }

export type UnixTime = Date | Time | number[]

export type Entry = {
  path: string
  cid: any
  size: number
  mode?: number
  mtime?: Time
}

export type Link = Entry & {
  name?: string
  type: 'file' | 'dir'
  depth: number
}

export type File = Entry & {
  type: 'file' | 'dir'
  content?: AsyncIterable<Uint8Array>
}

export type Peer = {
  id: string
  addrs: unknown[]
}

export type FileStream<T> = Iterable<T> | AsyncIterable<T> | ReadableStream<T>

export type FileContent = Uint8Array | Blob | string | FileStream<Uint8Array> | Iterable<number>

export type FileObject = {
  /**
   * The path you want the file to be accessible at from the root CID
   * _after_ it has been added.
   */
  path?: string
  /**
   * The contents of the file.
   */
  content?: FileContent
  /**
   * File mode to store the entry with.
   * (see https://en.wikipedia.org/wiki/File_system_permissions#Numeric_notation)
   */
  mode?: number | string
  /**
   * The modification time of the entry.
   */
  mtime?: UnixTime
}

export type AddOptions = {
  /**
   * chunking algorithm used to build ipfs DAGs.
   * @default size-262144
   */
  chunker?: string
  /**
   * the CID version to use when storing the data.
   * @default 0
   */
  cidVersion?: number
  /**
   * multihash hashing algorithm to use.
   * @default sha2-256
   */
  hashAlg?: string
  /**
   * If true, will not add blocks to the blockstore.
   * @default false
   */
  onlyHash?: boolean
  /**
   * pin this object when adding.
   * @default true
   */
  pin?: boolean
  /**
   * a function that will be called with the number of bytes added
   * as a file is added to ipfs and the path of the file being added
   */
  progress?: (bytes: number, path: string) => void
  /**
   * if true, DAG leaves will contain raw file data and not be wrapped in a protobuf.
   * @default false
   */
  rawLeaves?: boolean
  /**
   * if true will use the trickle DAG format for DAG generation.
   * @default false
   */
  trickle?: boolean
  /**
   * Adds a wrapping node around the content.
   * @default false
   */
  wrapWithDirectory?: boolean
  /**
   * A timeout in ms.
   */
  timeout?: number
  /**
   * Can be used to cancel any long running requests started as a result of this call.
   */
  signal?: AbortSignal
}