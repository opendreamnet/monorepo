import { defineBuildConfig } from 'unbuild'
import buildConfig from '@opendreamnet/build/build.config'
import ts from '@rollup/plugin-typescript'

export default defineBuildConfig({
  entries: ['./src/index'],
  preset: buildConfig,
  rollup: {
    cjsBridge: false
  },
  hooks: {
    'rollup:options'(ctx, opts) {
      if (!opts.plugins) {
        opts.plugins = []
      }

      // Plugins
      // opts.plugins.unshift(ts())
    }
  }
})