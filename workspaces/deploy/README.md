# @dreamnet/deploy

[![Version](https://img.shields.io/npm/v/@dreamnet/deploy.svg)](https://npmjs.org/package/@dreamnet/deploy)
[![Downloads/week](https://img.shields.io/npm/dw/@dreamnet/deploy.svg)](https://npmjs.org/package/@dreamnet/deploy)
![License](https://img.shields.io/npm/l/@dreamnet/deploy.svg)

Deploy files and folders to different file providers:

- [IPFS](https://docs.ipfs.io/reference/http/api/)
  - [Pinata](https://pinata.cloud/)
  - [Infura](https://infura.io)
- [IPFS Cluster](https://cluster.ipfs.io/documentation/reference/api/)
- [Minio (S3)](https://docs.min.io/docs/minio-quickstart-guide.html)
- [MEGA](https://mega.co.nz/)
- Git/Gitea
  - Github
  - codeberg.org
  - git.teknik.io

It is also possible to update the [DNSLink](https://docs.ipfs.io/concepts/dnslink/) of a domain if you have uploaded your file to an IPFS provider, supported DNS providers:

- [Cloudflare](https://www.cloudflare.com/)

## Usage

Setup with environment variables:

```ts
import { Release } from '@dreamnet/deploy'

const release = new Release('./build/myapp.exe')

// Upload file to IPFS, Pinata and MEGA.
release.addProvider(['IPFS', 'Pinata', 'MEGA'])
```

Setup without environment variables:

```ts
import { Release, IPFS, Pinata, MEGA } from '@dreamnet/deploy'

const release = new Release('./build/myapp.exe')

// IPFS
const ipfs = new IPFS()
ipfs.setAddress('/ip4/127.0.0.1/tcp/5002')
  .setUsername('root')
  .setPassword('secret')

// Pinata
const pinata = new Pinata()
pinata.setToken('...')

// MEGA
const mega = new MEGA()
mega.setEmail('test@example.com')
  .setPassword('secret')
  .setFolder('/projects/releases/')

// Upload file to IPFS, Pinata and MEGA.
release.addProvider([ipfs, pinata, mega])
```

Deploy:

```ts
// Deploy!
const response = await release.deploy()

/*
[
  {
    provider: "IPFS",
    cid: "Qm...",
    url: "https://gateway.ipfs.io/ipfs/Qm..."
  },
  {
    provider: "Pinata",
    cid: "Qm...",
    url: "https://gateway.pinata.cloud/ipfs/Qm..."
  },
  {
    provider: "MEGA",
    cid: null,
    url: "https://mega.nz/file/cSx..."
  }
]
*/
console.log(response)
```

Events:

```ts
import { Provider, UploadResult } from '@dreamnet/deploy'

release.on('upload:begin', (provider: Provider) => {
  console.log(`Uploading to ${provider.label}...`)
})

release.on('upload:success', (result: UploadResult, provider: Provider) => {
  console.log(`Uploaded to ${provider.label}.`)
  console.log(result.url)
})

release.on('upload:fail', (error: Error, provider: Provider) => {
  console.error(`Upload to ${provider.label} failed: ${error.message}`)
})

release.on('pin:begin', (provider: Provider) => {
  console.log(`Pinning to ${provider.label}...`)
})

release.on('pin:success', (provider: Provider) => {
  console.log(`Pinned to ${provider.label}.`)
  console.log(cid)
})

release.on('pin:fail', (error: Error, provider: Provider) => {
  console.error(`Pin to ${provider.label} failed: ${error.message}`)
})

release.on('unpin:begin', (provider: Provider) => {
  console.log(`Unpinning old version from ${provider.label}...`)
})

release.on('unpin:success', (provider: Provider) => {
  console.log(`Unpinned from ${provider.label}.`)
  console.log(provider.release.previousCID)
})

release.on('unpin:fail', (error: Error, provider: Provider) => {
  console.error(`Unpin from ${provider.label} failed: ${error.message}`)
})

release.on('dns:begin', (provider: Provider) => {
  console.log(`Updating ${provider.label} DNSLink...`)
})

release.on('dns:fail', (error: Error, provider: Provider) => {
  console.error(`${provider.label} DNSLink update has failed: ${error.message}`)
})

release.on('dns:success', (result: DnsRecord, provider: Provider) => {
  console.log(`${provider.label} DNSLink updated.`)
  console.log(`${result.record} = ${result.content}`)
})

release.on('fail', (error: Error) => {
  console.trace(error)
})
```

## Enviroment variables


### IFPS

- `DEPLOY_IPFS_GATEWAY` (default: `https://gateway.ipfs.io`)
- `DEPLOY_IPFS_ADDRESS` (default: `/ip4/127.0.0.1/tcp/5001`)
- `DEPLOY_IPFS_USERNAME`: Username if the API is behind a [basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication).
- `DEPLOY_IPFS_PASSWORD`: Password if the API is behind a [basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication).

### Pinata

- `DEPLOY_PINATA_GATEWAY` (default: `https://gateway.pinata.cloud`)
- `DEPLOY_PINATA_TOKEN`: (required) [API JWT](https://pinata.cloud/keys)

### Infura

- `DEPLOY_INFURA_GATEWAY` (default: `https://gateway.ipfs.io`)
- `DEPLOY_INFURA_ADDRESS` (default: `/dns4/ipfs.infura.io/tcp/5001/https`)

### IFPS Cluster

- `DEPLOY_IPFSCLUSTER_GATEWAY` (default: `https://gateway.ipfs.io`)
- `DEPLOY_IPFSCLUSTER_ADDRESS` (default: `/ip4/127.0.0.1/tcp/9094`)
- `DEPLOY_IPFSCLUSTER_USERNAME`: Username if the API is behind a [basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication).
- `DEPLOY_IPFSCLUSTER_PASSWORD`: Password if the API is behind a [basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication).

### Minio

- `DEPLOY_MINIO_GATEWAY`: (default by address: `http://127.0.0.1:9000`) Url to access the public files.
- `DEPLOY_MINIO_ADDRESS` (default: `/ip4/127.0.0.1/tcp/9000/http`)
- `DEPLOY_MINIO_SSL` (default by address: `false`)
- `DEPLOY_MINIO_BUCKET` (required)
- `DEPLOY_MINIO_FOLDER`: Parent path where the files will be stored.
- `DEPLOY_MINIO_KEY` (required)
- `DEPLOY_MINIO_SECRET` (required)

### MEGA

- `DEPLOY_MEGA_EMAIL` (required)
- `DEPLOY_MEGA_PASSWORD` (required)
- `DEPLOY_MEGA_FOLDER`: Parent path where the files will be stored.

### Git

> These will be used as defaults for any git-based provider.

- `DEPLOY_GIT_OWNER`: Owner of the repository. (Example: **dreamnettech**)
- `DEPLOY_GIT_REPO`: Repository name. (Example: **monorepo**)
- `DEPLOY_GIT_TAG`: Tag to create the release (if necessary) and upload the files.
- `DEPLOY_GIT_RELEASE_NAME`: (default: `DEPLOY_GIT_TAG`) Name that will be given to the release.

### Github

- `DEPLOY_GITHUB_OWNER` (required)
- `DEPLOY_GITHUB_REPO` (required)
- `DEPLOY_GITHUB_TAG` (required)
- `DEPLOY_GITHUB_RELEASE_NAME`
- `DEPLOY_GITHUB_TOKEN` (required)

### codeberg.org

- `DEPLOY_CODEBERG_OWNER` (required)
- `DEPLOY_CODEBERG_REPO` (required)
- `DEPLOY_CODEBERG_TAG` (required)
- `DEPLOY_CODEBERG_RELEASE_NAME`
- `DEPLOY_CODEBERG_TOKEN` (required)

### git.teknik.io

- `DEPLOY_TEKNIK_OWNER` (required)
- `DEPLOY_TEKNIK_REPO` (required)
- `DEPLOY_TEKNIK_TAG` (required)
- `DEPLOY_TEKNIK_RELEASE_NAME`
- `DEPLOY_TEKNIK_TOKEN` (required)

### Cloudflare

- `DEPLOY_CLOUDFLARE_EMAIL` (required if `DEPLOY_CLOUDFLARE_TOKEN` is empty)
- `DEPLOY_CLOUDFLARE_KEY` (required if `DEPLOY_CLOUDFLARE_TOKEN` is empty)
- `DEPLOY_CLOUDFLARE_TOKEN`
- `DEPLOY_CLOUDFLARE_ZONE` (required)
- `DEPLOY_CLOUDFLARE_RECORD` (required)

## TODO

- Improve programmatic implementation. (Intended to use with enviroment variables)
- Tests
- More providers
- More documentation (DNSLink, Unpin, etc)

## Similar

- [@dreamnet/deploy-cli](https://www.npmjs.com/package/@dreamnet/deploy-cli)