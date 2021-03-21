import { Command, flags } from '@oclif/command'
import { upperFirst } from 'lodash'
import * as ora from 'ora'
import path from 'path'
import { Provider, Release, storage, DnsRecord, UploadResult } from '@dreamnet/deploy'

class Deploy extends Command {
  /**
   *
   *
   * @static
   */
  public static description = 'Upload a file or folder to the specified providers.'

  /**
   *
   *
   * @static
   */
  public static flags = {
    // show the application version
    version: flags.version({ char: 'v' }),
    // show help information
    help: flags.help({ char: 'h' }),
    // file providers
    provider: flags.string({
      multiple: true,
      options: [
        'ipfs',
        'ipfs-cluster',
        'infura',
        'pinata',
        'github',
        'gitea',
        'dreamlink',
        'dreamlink-cluster',
        'codeberg',
        'teknik',
        'minio',
        'mega',
      ],
      required: true,
      char: 'p',
      description: 'file providers',
    }),
    // dns providers
    dns: flags.string({
      multiple: true,
      options: ['cloudflare'],
      char: 'd',
      description: 'dns providers',
    }),
    // release name
    name: flags.string({
      char: 'n',
      description: 'release name',
    }),
    // path to CID's storage file
    storage: flags.string({
      char: 's',
      description: 'path to CID\'s storage file',
    }),
    caching: flags.boolean({
      char: 'c',
      description: 'enable the IPFS Caching in different public gateways'
    }),
    cachingTimeout: flags.integer({
      description: 'ipfs caching timeout'
    }),
    encrypt: flags.string({
      char: 'k',
      description: 'encryption key for output'
    })
  }

  /**
   *
   *
   * @static
   */
  public static args = [{ name: 'file', required: true }]

  /**
   *
   *
   * @type {ora.Ora}
   */
  public spinner: ora.Ora = ora.default()

  public async run(): Promise<void> {
    const release = await this.createRelease()

    this.log('------------------------------------------')
    this.log(`| ${release.filepath}`)
    this.log(`| Root: ${release.rootPath}`)
    this.log('------------------------------------------')
    this.log(`| Name: ${release.name}`)
    this.log(`| Directory: ${release.isDirectory}`)
    this.log(`| Encrypted: ${release.cryptr !== undefined}`)
    this.log(`| Files: ${release.files.length}`)
    this.log(`| Providers: ${release.providers.length}`)
    this.log(`| DNS: ${release.dnsProviders.length}`)
    this.log('------------------------------------------\n')

    const response = await release.deploy()

    this.log('')

    this.log(JSON.stringify(response))
  }

  public async createRelease(): Promise<Release> {
    const { args, flags } = this.parse(Deploy)

    const release = new Release(args.file)

    // Release name
    release.setName(flags.name)

    if (flags.encrypt) {
      // Encryption key
      release.setEncryptKey(flags.encrypt)
    }

    if (flags.caching) {
      // IPFS caching
      release.setCaching(flags.caching, flags.cachingTimeout)
    }

    // File providers
    flags.provider.forEach(provider => {
      switch (provider) {
      case 'ipfs':
      case 'mega':
        release.addProvider(provider.toUpperCase())
        break

      case 'ipfs-cluster':
        release.addProvider('IPFSCluster')
        break

      case 'infura':
      case 'pinata':
      case 'github':
      case 'gitea':
      case 'codeberg':
      case 'teknik':
      case 'minio':
        release.addProvider(upperFirst(provider))
        break

      case 'dreamlink':
        release.addProvider('DreamLink')
        break

      case 'dreamlink-cluster':
        release.addProvider('DreamLinkCluster')
        break
      }
    })

    if (flags.dns) {
      // DNS providers
      flags.dns.forEach(provider => {
        switch (provider) {
        case 'cloudflare':
          release.addDnsProvider('Cloudflare')
          break
        }
      })
    }

    if (flags.storage) {
      // CID storage
      storage.setFilepath(flags.storage)
      this.log(`Storage path: ${path.resolve(flags.storage)}`)
    }

    release.on('upload:begin', (provider: Provider) => {
      this.spinner.start(`Uploading to ${provider.label}...`)
    })

    release.on('upload:success', (result: UploadResult, provider: Provider) => {
      this.spinner.succeed(`Uploaded to ${provider.label}.`)

      if (!release.cryptr) {
        this.spinner.info(`${result.url}`)
      }
    })

    release.on('upload:fail', (error: Error, provider: Provider) => {
      this.spinner.fail(`Upload to ${provider.label} failed: ${error.message}`)
    })

    release.on('pin:begin', (provider: Provider) => {
      this.spinner.start(`Pinning to ${provider.label}...`)
    })

    release.on('pin:success', (cid: string, provider: Provider) => {
      this.spinner.succeed(`Pinned to ${provider.label}.`)

      if (!release.cryptr) {
        this.spinner.info(cid)
      }
    })

    release.on('pin:fail', (error: Error, provider: Provider) => {
      this.spinner.fail(`Pin to ${provider.label} failed: ${error.message}`)
    })

    release.on('unpin:begin', (provider: Provider) => {
      this.spinner.start(`Unpinning old version from ${provider.label}...`)
    })

    release.on('unpin:success', (provider: Provider) => {
      this.spinner.succeed(`Unpinned from ${provider.label}.`)

      if (!release.cryptr) {
        this.spinner.info(`${provider.release.previousCID}`)
      }
    })

    release.on('unpin:fail', (error: Error, provider: Provider) => {
      this.spinner.fail(`Unpin from ${provider.label} failed: ${error.message}`)
    })

    release.on('dns:begin', (provider: Provider) => {
      this.spinner.start(`Updating ${provider.label} DNS...`)
    })

    release.on('dns:fail', (error: Error, provider: Provider) => {
      this.spinner.fail(`${provider.label} DNS failed: ${error.message}`)
    })

    release.on('dns:success', (result: DnsRecord, provider: Provider) => {
      this.spinner.succeed(`${provider.label} DNS updated.`)

      if (!release.cryptr) {
        this.spinner.info(`${result.record} = ${result.content}`)
      }
    })

    release.on('cache:begin', (url: string) => {
      const uri = new URL(url)
      this.spinner.start(`Caching to ${uri.hostname}...`)
    })

    release.on('cache:fail', (error: Error, url: string) => {
      const uri = new URL(url)
      this.spinner.fail(`Cache to ${uri.hostname} failed: ${error.message}`)
    })

    release.on('cache:success', (url: string) => {
      const uri = new URL(url)
      this.spinner.succeed(`Cached to ${uri.hostname}`)
    })
    

    release.on('fail', (error: Error) => {
      // eslint-disable-next-line no-console
      console.trace(error)
    })

    await release.init()

    return release
  }
}

export = Deploy
