# @opendreamnet/ipfs

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

Easily create and use an IPFS node, either in NodeJS or web browser.

## Example

### NodeJS

```ts
import { IPFS } from '@opendreamnet/ipfs'

async function ipfsStart() {
  // IPFS repo created at `process.env.IPFS_PATH` or `%tmp%/opendreamnet/ipfs-repo`
  const client = new IPFS({
    start: false
  })

  console.log('Starting IPFS node...');

  await client.start();

  /*
  {
    peerId: '12D3KooWR8qnTdrajANsKrxDgVExpFrBc24KijTBHc3hT99fm7BL',
    privateKey: undefined,
    publicKey: [PublicKey]
  }
  */
  console.log('Started!', {
    peerId: client.identity.id,
    privateKey: client.privateKey,
    publicKey: client.publicKey
  })

  // Download to ./image.jpg
  console.log('Downloading test image...')

  // image = [Entry]
  const image = await client.fromCID('bafybeiaynnrpkowrudgxydruws4gz76gyyngtexuh7piwpa72pnnm7hmei', { 
    name: 'image.jpg',
    timeout: 2 * 60 * 1000
  });

  await image.download(path.resolve(process.cwd(), 'data', 'image.jpg'));
  // or...
  await image.download({ directory: path.resolve(process.cwd(), 'data') });

  // Upload
  console.log('Uploading ./src ...')
  const record = await client.add('./src')
  console.log({ record })
}

ipfsStart()
```

### Webpack 4

```js
{
  transpile: ['ipfs-core', '@opendreamnet/ipfs', '@opendreamnet/app']
}
```

### Web Browser (UMD)

```html
<!-- Latest version -->
<script src="https://unpkg.com/@opendreamnet/ipfs/dist/index.umd.js" />


<!-- Image Preview -->
<img id="ipfs-image" height="500" />
```

```js
async function ipfsStart() {
  const client = new IPFS({
    start: false
  });

  console.log('Starting IPFS node...');

  await client.start();

  /*
  {
    peerId: '12D3KooWR8qnTdrajANsKrxDgVExpFrBc24KijTBHc3hT99fm7BL',
    privateKey: [PrivateKey],
    publicKey: [PublicKey]
  }
  */
  console.log('Started!', {
    peerId: client.identity.id,
    privateKey: client.privateKey,
    publicKey: client.publicKey
  });

  // Show image
  console.log('Downloading test image...');

  const image = await client.fromCID('bafybeiaynnrpkowrudgxydruws4gz76gyyngtexuh7piwpa72pnnm7hmei', { 
    name: 'image.jpg',
    timeout: 2 * 60 * 1000
  });

  const blob = await image.getBlob();
  document.querySelector('#ipfs-image').src = window.URL.createObjectURL(blob);
}

ipfsStart();
```

## License

[MIT](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@opendreamnet/ipfs?style=flat-square
[npm-version-href]: https://npmjs.com/package/@opendreamnet/ipfs

[npm-downloads-src]: https://img.shields.io/npm/dm/@opendreamnet/ipfs?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/@opendreamnet/ipfs