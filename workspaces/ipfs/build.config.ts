import { defineBuildConfig } from 'unbuild'
import buildConfig from '@opendreamnet/build/build.config'

export default defineBuildConfig({
  entries: ['./src/index'],
  preset: buildConfig
})