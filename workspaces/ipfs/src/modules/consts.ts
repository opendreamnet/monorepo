/**
 * WebRTC.
 * Used to discover and communicate with other nodes
 * connected to the same WebRTC nodes (JS-IPFS only)
 *
 * @see
 * https://github.com/ipfs/js-ipfs/blob/master/docs/FAQ.md#what-are-all-these-refsqmfoo-http-errors-i-keep-seeing-in-the-console
 */
export const WRTC_NODES = [
  '/dns4/node1-wrtc.dreamlink.cloud/tcp/443/wss/p2p-webrtc-star',
  '/dns4/node2-wrtc.dreamlink.cloud/tcp/443/wss/p2p-webrtc-star',
  // '/dns4/node3-wrtc.dreamlink.cloud/tcp/443/wss/p2p-webrtc-star',
  '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
  // '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
]

/**
 * Preload.
 * Used to get and distribute files from the browser IPFS node.
 */
export const PRELOAD_NODES = [
  '/dns4/node0-preload.dreamlink.cloud/https',

  // Defaults
  '/dns4/node0.preload.ipfs.io/https',
  '/dns4/node1.preload.ipfs.io/https'
  // '/dns4/node2.preload.ipfs.io/https',
  // '/dns4/node3.preload.ipfs.io/https'
]

/**
 * Bootstrap.
 * Used to get and distribute files from the browser IPFS node.
 */
export const BOOTSTRAP_NODES = [
  '/dns4/node0-preload.dreamlink.cloud/tcp/443/wss/p2p/12D3KooWNwRazEX1ZfMVFFoBvUF6Ey8s7Ygu77RjPj55jDJ2DJF5',

  // Defaults
  '/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
  '/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6'
  // '/dns4/node2.preload.ipfs.io/tcp/443/wss/p2p/QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS',
  // '/dns4/node3.preload.ipfs.io/tcp/443/wss/p2p/QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN'
]

/**
 * Delegates.
 * Used to perform actions on the network from the browser IPFS node.
 */
export const DELEGATES_NODES = [
  '/dns4/node0-preload.dreamlink.cloud/tcp/443/https',

  // Defaults
  '/dns4/node0.delegate.ipfs.io/tcp/443/https',
  '/dns4/node1.delegate.ipfs.io/tcp/443/https'
  // '/dns4/node2.delegate.ipfs.io/tcp/443/https',
  // '/dns4/node3.delegate.ipfs.io/tcp/443/https'
]

/**
 * Recommended nodes for fast discovery.
 */
export const RECOMMENDED_NODES = [
  // Cloudflare
  '/ip4/172.65.0.13/tcp/4009/p2p/QmcfgsJsMtx6qJb74akCw1M24X1zFwgGo11h1cuhwQjtJP',

  // Pinata.cloud
  '/dnsaddr/nyc1-1.hostnodes.pinata.cloud',
  '/dnsaddr/nyc1-2.hostnodes.pinata.cloud',
  '/dnsaddr/nyc1-3.hostnodes.pinata.cloud',

  // NFT.Storage
  '/ip4/145.40.96.233/tcp/4001/p2p/12D3KooWEGeZ19Q79NdzS6CJBoCwFZwujqi5hoK8BtRcLa48fJdu',
  '/ip4/147.75.87.85/tcp/4001/p2p/12D3KooWBnmsaeNRP6SCdNbhzaNHihQQBPDhmDvjVGsR1EbswncV',
  '/ip4/136.144.57.203/tcp/4001/p2p/12D3KooWDLYiAdzUdM7iJHhWu5KjmCN62aWd7brQEQGRWbv8QcVb',

  // Web3.Storage
  '/ip4/139.178.69.155/tcp/4001/p2p/12D3KooWR19qPPiZH4khepNjS3CLXiB7AbrbAD4ZcDjN1UjGUNE1',
  '/ip4/139.178.68.91/tcp/4001/p2p/12D3KooWEDMw7oRqQkdCJbyeqS5mUmWGwTp8JJ2tjCzTkHboF6wK',
  '/ip4/147.75.33.191/tcp/4001/p2p/12D3KooWPySxxWQjBgX9Jp6uAHQfVmdq8HG1gVvS1fRawHNSrmqW',

  // Protocol Labs
  '/dns4/nft-storage-am6.nft.dwebops.net/tcp/18402/p2p/12D3KooWCRscMgHgEo3ojm8ovzheydpvTEqsDtq7Vby38cMHrYjt',
  '/dns4/nft-storage-dc13.nft.dwebops.net/tcp/18402/p2p/12D3KooWQtpvNvUYFzAo1cRYkydgk15JrMSHp6B6oujqgYSnvsVm',
  '/dns4/nft-storage-sv15.nft.dwebops.net/tcp/18402/p2p/12D3KooWQcgCwNCTYkyLXXQSZuL5ry1TzpM8PRe9dKddfsk1BxXZ'
]