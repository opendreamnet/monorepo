# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.4.1](https://github.com/dreamnettech/monorepo/compare/deploy-v1.4.0...deploy-v1.4.1) (2022-10-15)


### Miscellaneous changes

* added web3 host support for cloudflare ([3288399](https://github.com/dreamnettech/monorepo/commit/32883993078b65e309c3099e6f8f374a60d5a4f0))
* updated and renamed @dreamnet/eslint-config-dreamnet to @opendreamnet/eslint-config ([eadd97d](https://github.com/dreamnettech/monorepo/commit/eadd97d8b6f82f168372008b899e6f9e9b1457fe))

## [1.4.0](https://github.com/dreamnettech/monorepo/compare/deploy-v1.3.1...deploy-v1.4.0) (2021-08-19)


### Features

* added nft.storage and web3.storage ([fa5c731](https://github.com/dreamnettech/monorepo/commit/fa5c73192a6ffcb68949612f6706ca06e4ea2b85))
* added support for finding previous CID using release name ([046b01c](https://github.com/dreamnettech/monorepo/commit/046b01c25f36cde23efe935cb3b52dbbf73c9dbd))
* added support for only pinning on pinata.cloud ([1062991](https://github.com/dreamnettech/monorepo/commit/106299104b87804f3cba4e58ce1da72b8fbe2247))
* added support for only pinning on slate ([fab9a2e](https://github.com/dreamnettech/monorepo/commit/fab9a2ec730815e8164c66328150266a41c89eaa))


### Bug Fixes

* ipfs provider not working ([451faf3](https://github.com/dreamnettech/monorepo/commit/451faf3818d69afa0cea1fb91111d0b9e6877f1b))
* removed unpin support on web3.storage ([70ce0a8](https://github.com/dreamnettech/monorepo/commit/70ce0a89cc702a838ce6907752fff4cbc6e8575d))
* typescript error ([de23aa6](https://github.com/dreamnettech/monorepo/commit/de23aa6b4e4810982a0982e294e80bfe6210825c))


### Miscellaneous changes

* code improvements ([eafe245](https://github.com/dreamnettech/monorepo/commit/eafe245dc88d2184f164dfa9140b8d6b5f1a3d3c))
* dreamlink-cluster code improvements ([e7700a2](https://github.com/dreamnettech/monorepo/commit/e7700a2539f2b789b138352c51598245ba019040))
* improvements in the api and the code in general ([20b3aa9](https://github.com/dreamnettech/monorepo/commit/20b3aa9b6683b36ba1381d802d2444ba1d6c8ac7))
* in case of error during `pin` now it will try to upload the file instead of throwing error ([e881074](https://github.com/dreamnettech/monorepo/commit/e8810741d649cea3a20fd7dbd0559f97bd177ca7))
* lint fixed ([3104e9c](https://github.com/dreamnettech/monorepo/commit/3104e9c03a1b3127f42cf0d75568a37ef201aab9))
* release name is now required ([d32201a](https://github.com/dreamnettech/monorepo/commit/d32201a5f0ac1ca171ca47a9d8bcb306247edeb8))
* removed ipfs-http-client from empty "declare module" ([7cd5ad4](https://github.com/dreamnettech/monorepo/commit/7cd5ad449ddeb3078b9c1e4ee35ca98fa248d022))
* timeout adjustments ([4c9049d](https://github.com/dreamnettech/monorepo/commit/4c9049d8f97a118923d2fa61ae8404b9a8fc8dcf))

### [1.3.1](https://github.com/dreamnettech/monorepo/compare/deploy-v1.3.0...deploy-v1.3.1) (2021-07-23)


### Bug Fixes

* outdated information on dreamlink provider ([64eb108](https://github.com/dreamnettech/monorepo/commit/64eb1083884050555f3d0a3233457824c4544e62))
* outdated public gateways list ([1b52a9e](https://github.com/dreamnettech/monorepo/commit/1b52a9efd4ef0833cdecd90f0bef01c915046084))

## 1.3.0 (2021-07-22)


### Features

* added slate.host uploader. ([31f5451](https://github.com/dreamnettech/monorepo/commit/31f54517dc93e3bfa0941648ac5d301a7384a22e))


### Bug Fixes

* DNS step always created a record instead of updating the existing one. ([5456a90](https://github.com/dreamnettech/monorepo/commit/5456a90c516ffc3236310326df0564b84546526a))


### Miscellaneous changes

* added standard-version. ([a53da3a](https://github.com/dreamnettech/monorepo/commit/a53da3a1ee5ba7ba14e3262ab9aba812f6ccaedd))
* code improvements. ([d24a434](https://github.com/dreamnettech/monorepo/commit/d24a4347be2e78f0e3d07827d2aff2661a5ea004))
* enhancements to package.json format. ([c001741](https://github.com/dreamnettech/monorepo/commit/c001741d386ac1abd8a87e1978cad789b816a8af))
* eslint fixes. ([b4b5156](https://github.com/dreamnettech/monorepo/commit/b4b5156f8be3f4e2c49796591c1352910f83d03e))
* minor code improvements. ([3ef188f](https://github.com/dreamnettech/monorepo/commit/3ef188fd4575afde406214be0648dd61bf5fddc8))
* reduced cacheTimeout to 5 seconds. ([588522e](https://github.com/dreamnettech/monorepo/commit/588522e9bf2bac8b9d5f9523f00ead1009e6bd7c))
* renamed link() to exec(). ([cd93887](https://github.com/dreamnettech/monorepo/commit/cd93887cdf9745d77158c5971de77ad75d4160fc))
* yarn.lock ([2c25e3e](https://github.com/dreamnettech/monorepo/commit/2c25e3eac1371b0187dc4e41a7f6518e6b4c2b03))
