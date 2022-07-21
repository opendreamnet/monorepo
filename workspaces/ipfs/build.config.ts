import { defineBuildConfig } from 'unbuild'
import buildConfig from '@opendreamnet/build/build.config'

export default defineBuildConfig({
  entries: ['./src/index'],
  externals: [
    '@multiformats/multiaddr',
    '@libp2p/interfaces'
  ],
  
  preset: buildConfig
})