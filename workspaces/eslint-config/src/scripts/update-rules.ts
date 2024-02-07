/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs'
import path from 'path'
import { baseConfig } from '../base'
import { getMissingRules, getConfig } from './helpers'

/**
 * Create 2 files with the missing rules from the "standard" library.
 *
 * A missing rule is one that is not declared in the `extends` libraries
 * or whose configuration differs.
 */
async function main(): Promise<void> {
  /*
  // ESLint configuration of `base.ts`.
  fs.writeFileSync(
    path.resolve(process.cwd(), 'src', 'json', 'base.eslintrc.json'),
    JSON.stringify(await getConfig(baseConfig), null, 2),
  )
  */

  // Rules for JavaScript
  fs.writeFileSync(
    path.resolve(process.cwd(), 'src', 'json', 'standard.rules.json'),
    JSON.stringify(await getMissingRules(), null, 2),
  )

  // Rules for Typescript
  fs.writeFileSync(
    path.resolve(process.cwd(), 'src', 'json', 'standard.typescript.rules.json'),
    JSON.stringify(await getMissingRules(true), null, 2),
  )
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
