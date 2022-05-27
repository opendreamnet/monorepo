import { defineBuildConfig } from 'unbuild'
import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin'

export default defineBuildConfig({
  rollup: {
    emitCJS: true,
    cjsBridge: true,
    esbuild: {
      sourceMap: true
    }
  },
  declaration: true,
  hooks: {
    'rollup:options'(ctx, opts) {
      if (!opts.plugins) {
        opts.plugins = []
      }
      
      // Plugins
      opts.plugins.push(optimizeLodashImports())
    }
  }
})