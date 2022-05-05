# @opendreamnet/build

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

Base config files for building OpenDreamNet packages.

## Files

- `webpack.config.ts` for Webpack 5
- `build.config.ts` for [Unbuild](https://github.com/unjs/unbuild)

## Examples

`webpack.config.ts`
```ts
import path from 'path'
import { Configuration } from 'webpack'
import { merge } from 'lodash'
import webpackConfig from '@opendreamnet/build/webpack.config'

const config: Configuration = merge(webpackConfig, {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.umd.js'
  }
})

export default config
```

---

`build.config.ts`
```ts
import { defineBuildConfig } from 'unbuild'
import buildConfig from '@opendreamnet/build/build.config'

export default defineBuildConfig({
  entries: ['./src/index'],
  preset: buildConfig
})
```

---

`package.json`
```json
{
  "scripts": {
    "watch": "unbuild --stub",
    "build": "unbuild && webpack-cli"
  }
}
```

## License

[MIT](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@opendreamnet/build?style=flat-square
[npm-version-href]: https://npmjs.com/package/@opendreamnet/build

[npm-downloads-src]: https://img.shields.io/npm/dm/@opendreamnet/build?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/@opendreamnet/build