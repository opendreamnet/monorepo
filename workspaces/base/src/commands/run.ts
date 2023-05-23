import { Command, Flags, CliUx } from '@oclif/core'
import Listr from 'listr'
import path from 'path'
import pkgUp from 'pkg-up'
import fs from 'fs-extra'
import { isNil } from 'lodash'
import execa from 'execa'

const COPY_FILES = [
  '.editorconfig',
  '.eslintignore',
  '.eslintrc',
  '.gitignore',
  'tsconfig.json'
]

const DEV_DEPENDENCIES = [
  'shx',
  'standard-version'
]

const TYPESCRIPT_DEPENDENCIES = [
  'typescript',
  'ts-node',
]

const ESLINT_DEPENDENCIES = [
  '@opendreamnet/eslint-config',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'eslint',
  'eslint-plugin-import',
  'eslint-plugin-lodash',
  'eslint-plugin-promise'
]

const DEPENDENCIES = [
  '@opendreamnet/app',
  'lodash'
]

export default class Run extends Command {
  static override description = ''

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    // flag with a value (-r, --root=VALUE)
    root: Flags.string({ char: 'r', description: '' }),
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
  }

  protected root!: string

  protected cliRoot!: string

  public async run(): Promise<void> {
    const { flags } = await this.parse(Run)

    // Directory detection
    const root = flags.root || process.cwd()
    const cliRoot = await pkgUp({ cwd: __dirname }).then(value => value ? path.dirname(value) : value) || path.dirname(path.dirname(__filename))

    // Not here you fool
    if (root === cliRoot) {
      this.error('You cannot execute this command in this directory, specify another one with --root')
    }

    this.root = root
    this.cliRoot = cliRoot

    // Project directory
    this.log(`> ${this.root}`)
    fs.ensureDirSync(this.root)

    // Questions
    const initYarn = await CliUx.ux.confirm('Do you want to initialize Yarn v2?')
    const yarnPlugins = await CliUx.ux.confirm('Do you want to install Yarn plugins?')
    let setupPackage = initYarn

    if (!initYarn) {
      setupPackage = await CliUx.ux.confirm('Do you want to setup package.json?')
    }

    const devDeps = await CliUx.ux.confirm('Do you want to install dev dependencies?')
    const tsDeps = await CliUx.ux.confirm('Do you want to install typescript?')
    const eslintDeps = await CliUx.ux.confirm('Do you want to install eslint?')
    const recDeps = await CliUx.ux.confirm('Do you want to install recommended dependencies?')

    // Build workload
    const workload: Listr.ListrTask<Listr.ListrContext>[] = []

    // Regular files
    for (const file of COPY_FILES) {
      workload.push({
        title: file,
        task: (ctx, task) => this.copy(file, flags.force).catch((err: any) => task.report(err))
      })
    }

    // Yarn init
    workload.push({
      title: 'Yarn',
      enabled: () => initYarn,
      task: (ctx, task) => this.yarnInit().catch((err: any) => task.report(err))
    })

    // package.json
    workload.push({
      title: 'package.json',
      enabled: () => initYarn || setupPackage,
      task: (ctx, task) => this.setupPackage().catch((err: any) => task.report(err))
    })

    // Yarn Plugins
    workload.push({
      title: 'Yarn Plugins',
      enabled: () => yarnPlugins,
      task: () => {
        return new Listr([
          {
            title: 'typescript',
            task: (ctx, task) => execa('yarn', ['plugin', 'import', 'typescript'], { cwd: root }).catch((err: any) => task.report(err))
          }
        ])
      }
    })

    // Recommended Dependencies
    workload.push({
      title: 'Recommended Dependencies',
      enabled: () => recDeps,
      task: (ctx, task) => execa('yarn', ['add', ...DEPENDENCIES], { cwd: root }).catch((err: any) => task.report(err))
    })

    // Dev Dependencies
    workload.push({
      title: 'Dev Dependencies',
      enabled: () => devDeps,
      task: (ctx, task) => execa('yarn', ['add', '--dev', ...DEV_DEPENDENCIES], { cwd: root }).catch((err: any) => task.report(err))
    })

    // Typescript Dependencies
    workload.push({
      title: 'Typescript Dependencies',
      enabled: () => tsDeps,
      task: (ctx, task) => execa('yarn', ['add', '--dev', ...TYPESCRIPT_DEPENDENCIES], { cwd: root }).catch((err: any) => task.report(err))
    })

    // Eslint Dependencies
    workload.push({
      title: 'Eslint Dependencies',
      enabled: () => eslintDeps,
      task: (ctx, task) => execa('yarn', ['add', '--dev', ...ESLINT_DEPENDENCIES], { cwd: root }).catch((err: any) => task.report(err))
    })

    const tasks = new Listr(workload)
    await tasks.run()

    this.exit(0)
  }

  public async copy(filename: string, force: boolean, destFilename?: string) {
    const finalFilename = destFilename || filename
    const src = path.resolve(this.cliRoot, 'assets', filename)
    const dest = path.resolve(this.root, finalFilename)

    if (!fs.existsSync(src)) {
      this.warn(`Asset file ${filename} not found!`)
      return
    }

    if (!force && fs.existsSync(dest)) {
      this.warn(`The file ${finalFilename} already exists, skipping.`)
      return
    }

    try {
      fs.copyFileSync(src, dest)
    } catch (err: any) {
      this.warn(`An error occurred while copying ${finalFilename}: ${err}`)
    }
  }

  public async yarnInit() {
    const packageExists = fs.existsSync(path.resolve(this.root, 'package.json'))

    if (!packageExists) {
      // Create package.json
      execa.sync('yarn', ['init', '-2'], { cwd: this.root })
    } else {
      execa.sync('yarn', ['set', 'version', 'stable'], { cwd: this.root })
    }

    // Set nodeLinker
    fs.appendFileSync(path.resolve(this.root, '.yarnrc.yml'), '\nnodeLinker: node-modules', )
  }

  public async setupPackage() {
    let pkgFile = path.resolve(this.root, 'package.json') // await pkgUp({ cwd: this.root })

    if (!fs.existsSync(pkgFile)) {
      fs.writeFileSync(pkgFile, '{}')
    }

    const pkg = JSON.parse(fs.readFileSync(pkgFile, { encoding: 'utf-8' }))

    if (!pkg.version) {
      pkg.version = '0.1.0'
    }

    pkg.scripts = {
      build: 'tsc -b',
      watch: 'tsc -w',
      ...(pkg.scripts || {}),
      lint: 'eslint --fix --ext .ts,.js src',
      clean: 'shx rm -rf dist',
      release: 'standard-version'
    }

    if (!pkg.files) {
      pkg.files = [
        'dist/',
        'src/'
      ]
    }

    if (!pkg.engines) {
      pkg.engines = {
        node: '>= 18'
      }
    }

    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2))
  }
}
