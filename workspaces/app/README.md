# @opendreamnet/app

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

Utilities for OpenDreamNet applications.

## Example

```ts
import * as app from '@opendreamnet/app'

// NodeJS: package.productName || package.displayName || package.name
// Browser: OpenDreamApp
app.getName()

// Affects getName()
app.setName('My application')

// -> win32 || darwin || linux || android
app.getPlatform()

// Object with bools
app.is
app.is.browser // false
app.is.node // true
app.is.windows // false
app.is.linux // true
app.is.dev // NodeJS: process.env.NODE_ENV !== 'production' || Browser: null

// Allows you to select a value depending on `.is`
app.choice({
  windows: 'is windows!',
  linux: 'nice linux distribution',
  macos: 'cool mac'
}, 'unknown os!') // -> "nice linux distribution"

// Works the same as `electron.getPath()` [https://www.electronjs.org/docs/api/app#appgetpathname]
// but without needing electron.
app.getPath('cwd') // /home/user/src/monorepo/workspaces/app
app.getPath('home') // /home/user
app.getPath('temp') // /tmp
app.getPath('appData') // /home/user/.config
app.getPath('userData') // /home/user/.config/DreamNet/${getName()}
```

## License

[MIT](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@opendreamnet/app?style=flat-square
[npm-version-href]: https://npmjs.com/package/@opendreamnet/app

[npm-downloads-src]: https://img.shields.io/npm/dm/@opendreamnet/app?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/@opendreamnet/app