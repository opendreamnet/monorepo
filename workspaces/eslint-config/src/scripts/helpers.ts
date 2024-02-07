import path from 'path'
import { ESLint, type Linter } from 'eslint'
import standardConfigObj from 'eslint-config-standard/.eslintrc.json'
import tsStandardConfigObj from 'eslint-config-standard-with-typescript/lib/index'
import { configs as stylisticConfigs } from '@stylistic/eslint-plugin'
import { baseConfig as baseLinterConfig } from '../base'

function fromFlatConfig(flatConfig: Linter.FlatConfig): Linter.Config {
  const config: Linter.Config = {
    rules: flatConfig.rules,
    settings: flatConfig.settings,
  }

  return config
}

export async function getConfig(overrideConfig: Linter.Config): Promise<any> {
  const eslint = new ESLint({
    overrideConfig,
    useEslintrc: false,
  })

  const config = await eslint.calculateConfigForFile(
    path.resolve(process.cwd(), 'tests', 'index.ts'),
  )

  return config
}

export async function getMissingRules(ts = false): Promise<Record<string, any>> {
  const [
    baseConfig,
    standardConfig,
    tsStandardConfig,
    stylisticDisabledConfig,
  ] = await Promise.all([
    // Recommended rules from all packages
    getConfig(baseLinterConfig),
    // Rules by the standard package
    getConfig(standardConfigObj as unknown as Linter.Config),
    // Rules by the standard-with-typescript package
    getConfig(tsStandardConfigObj),
    // Rules disabled by the @stylistic package
    getConfig(
      fromFlatConfig(stylisticConfigs['disable-legacy']),
    ),
  ])

  if (baseConfig.rules === undefined) {
    throw new Error()
  }

  if (standardConfig.rules === undefined) {
    throw new Error()
  }

  if (tsStandardConfig.rules === undefined) {
    throw new Error()
  }

  if (stylisticDisabledConfig.rules === undefined) {
    throw new Error()
  }

  // Rules to be added
  const missingRules: Record<string, any> = {}

  // Transform the rule object into an array of strings
  const baseRules = Object.keys(baseConfig.rules)
  const standardRules = Object.keys(standardConfig.rules)
  const tsStandardRules = Object.keys(tsStandardConfig.rules)
    .filter(rule => rule.startsWith('@typescript-eslint/'))
  const stylisticDisabledRules = Object.keys(stylisticDisabledConfig.rules)
  const rules = ts ? tsStandardRules : standardRules

  for (const rule of rules) {
    const normalizedRule = rule
      .replace('@typescript-eslint/', '')

    // This rule is already being declared by @stylistic/recommended-extends
    if (baseRules.includes('@stylistic/' + normalizedRule)) {
      continue
    }

    // This rule has been deactivated,
    // it means that it must be migrated.
    if (stylisticDisabledRules.includes(rule)) {
      if (!ts) {
        missingRules['@stylistic/' + rule] = standardConfig.rules[rule]
      }

      continue
    }

    // This rule has already been declared by another package.
    if (baseRules.includes(rule)) {
      const defaultValue = !ts
        ? standardConfig.rules[rule]
        : tsStandardConfig.rules[rule]

      // Same configuration, skip
      if (
        JSON.stringify(baseConfig.rules[rule])
        === JSON.stringify(defaultValue)
      ) {
        continue
      }
    }

    if (ts) {
      // This typescript rule replaces another one, the original one must be deactivated.
      if (
        standardRules.includes(normalizedRule)
        || baseRules.includes(normalizedRule)
      ) {
        missingRules[normalizedRule] = ['off']
      }
    }

    // This rule needs to be added
    missingRules[rule] = !ts
      ? standardConfig.rules[rule]
      : tsStandardConfig.rules[rule]
  }

  return missingRules
}
