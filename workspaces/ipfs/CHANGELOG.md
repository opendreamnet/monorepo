# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.2.0](https://github.com/dreamnettech/monorepo/compare/ipfs-v2.1.0...ipfs-v2.2.0) (2022-05-02)


### Features

* extended `toPem`, fixed confusions when generating pem, small refactor ([31a050b](https://github.com/dreamnettech/monorepo/commit/31a050bb9a671df8ae3bb256b9b7a036d546f4aa))

## [2.1.0](https://github.com/dreamnettech/monorepo/compare/ipfs-v2.0.1...ipfs-v2.1.0) (2022-05-02)


### Features

* added `PrivateKey.sign` and `PublicKey.verify` ([e0aa533](https://github.com/dreamnettech/monorepo/commit/e0aa533935d5f712b8945c95db3f8bfe011571a4))

### [2.0.1](https://github.com/dreamnettech/monorepo/compare/ipfs-v2.0.0...ipfs-v2.0.1) (2022-05-02)


### Bug Fixes

* `toPem()` and `toPemInline()` were using bytes in the IPFS context instead of general ([5e74e53](https://github.com/dreamnettech/monorepo/commit/5e74e53e877106c05967a2b041107c900cc980da))

## [2.0.0](https://github.com/dreamnettech/monorepo/compare/ipfs-v1.3.1...ipfs-v2.0.0) (2022-05-01)


### ⚠ BREAKING CHANGES

* ipfs upgrade, some breaking changes on api, private/public keys fixes

### Features

* ipfs upgrade, some breaking changes on api, private/public keys fixes ([2cd6db6](https://github.com/dreamnettech/monorepo/commit/2cd6db6bcac53de96aecd1df9968c5222c988651))


### Bug Fixes

* `progress.timeRemaining` is incorrect ([a7faa6f](https://github.com/dreamnettech/monorepo/commit/a7faa6f7441540ff3284a85cfb2a2e620f24d014))
* speedometer not working correctly ([f8e78c2](https://github.com/dreamnettech/monorepo/commit/f8e78c2c9b779e13951b60c4dd22066037b016e2))

### [1.3.1](https://github.com/dreamnettech/monorepo/compare/ipfs-v1.3.0...ipfs-v1.3.1) (2021-08-15)


### Bug Fixes

* connection to the same wrtc servers instead of selecting 2 at random. ([1942b7c](https://github.com/dreamnettech/monorepo/commit/1942b7c35795818ebd8248bce2ec8bb3dd1b51a6))

## [1.3.0](https://github.com/dreamnettech/monorepo/compare/ipfs-v1.2.0...ipfs-v1.3.0) (2021-07-13)


### Features

* added new parameters: [autoStart, autoLoadRefs, autoLoadPins, timeout, privateKey], added PublicKey and PrivateKey for easier key handling, added "completed" status after "ready" and more... ([d045395](https://github.com/dreamnettech/monorepo/commit/d0453953164d5c1386420a6b018e9a13ee1ab141))
* changed 'done' event to 'downloaded'. added downloadAsBlob() ([419b021](https://github.com/dreamnettech/monorepo/commit/419b0217ed206b2e2720b118401741983715cd80))

## [1.2.0](https://github.com/dreamnettech/monorepo/compare/ipfs-v1.1.0...ipfs-v1.2.0) (2021-06-11)


### Features

* added error handling in `Record` ([78a5e10](https://github.com/dreamnettech/monorepo/commit/78a5e109f8307925ab9664067f0521f822a29462))


### Bug Fixes

* improved error handling during `setup()` and `add()` ([9a207b4](https://github.com/dreamnettech/monorepo/commit/9a207b4e48211dc7ce64b277fe89c083483b044f))

## [1.1.0](https://github.com/dreamnettech/monorepo/compare/ipfs-v1.0.1...ipfs-v1.1.0) (2021-06-11)


### Features

* **ipfs:** added `getURL` and `getURLS` to get ([8d89cb8](https://github.com/dreamnettech/monorepo/commit/8d89cb8a1ef407f32bc8ba94314af8ad102bec6d))


### Bug Fixes

* **ipfs:** increased the number of event listeners to 50 ([2124133](https://github.com/dreamnettech/monorepo/commit/2124133162792eecf34aa638650fc48f8663b990))

### 1.0.1 (2021-06-09)


### Bug Fixes

* **ipfs:** workspace dependencies ([452c44b](https://github.com/dreamnettech/monorepo/commit/452c44b0ad62529afb94de4ddb5e0baa23772e8a))

## 1.0.0 (2021-05-25)
