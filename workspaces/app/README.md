# @dreamnet/app

[![Version](https://img.shields.io/npm/v/app.svg)](https://npmjs.org/package/app)
[![Downloads/week](https://img.shields.io/npm/dw/@dreamnet/app.svg)](https://npmjs.org/package/@dreamnet/app)
![License](https://img.shields.io/npm/l/@dreamnet/app.svg)

Utility functions for various applications.

## Usage

```ts
import * as app from '@dreamnet/app'

// NodeJS: package.productName || package.displayName || package.name
// Browser: DreamApp
app.getName()

// Affects getName()
app.setName('My application')

// -> win32 || darwin || linux || android
app.getPlatform()

// Object with bools depending on the platform it is running on
app.is

// Examples:
app.is.browser // -> false
app.is.node // -> true
app.is.windows // -> false
app.is.linux // -> true
app.is.dev // NodeJS: process.env.NODE_ENV !== 'production' | Browser: null

// Allows you to select a value depending on `.is`
app.choice({
  windows: 'is windows!',
  linux: 'nice linux distribution',
  macos: 'cool mac'
}, 'default value: unknown os!') // -> "nice linux distribution"

// Works the same as `electron.getPath()` [https://www.electronjs.org/docs/api/app#appgetpathname]
// but without needing electron.
app.getPath('cwd') // -> /home/user/src/monorepo/workspaces/app
app.getPath('home') // -> /home/user
app.getPath('temp') // -> /tmp
app.getPath('appData') // -> /home/user/.config
app.getPath('userData') // -> /home/user/.config/DreamNet/${getName()}
```

