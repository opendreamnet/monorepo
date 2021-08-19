import { Command, flags } from '@oclif/command'
import { upperFirst } from 'lodash'
import * as ora from 'ora'
import { Provider, Release, DnsRecord, DeployResult } from '@opendreamnet/deploy'

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
        'slate',
        'nft.storage',
        'web3.storage'
      ],
      required: true,
      char: 'p',
      description: 'file providers'
    }),

    // dns providers
    dns: flags.string({
      multiple: true,
      options: ['cloudflare'],
      char: 'd',
      description: 'dns providers'
    }),

    // release name
    name: flags.string({
      char: 'n',
      description: 'release name'
    }),

    unpin: flags.boolean({
      char: 'u',
      description: 'true to find the CID of the previous release and unpin it.'
    }),

    caching: flags.boolean({
      char: 'c',
      description: 'true to do caching of the file on public IPFS gateways.'
    }),

    cachingTimeout: flags.integer({
      description: 'ipfs caching timeout'
    }),

    encrypt: flags.string({
      char: 'k',
      description: 'output encryption key'
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

    this.log(`Release: ${release.filepath}`)
    // this.log(`Root: ${release.rootPath}`)
    this.log(`Name: ${release.name}`)
    this.log(`Directory: ${release.isDirectory}`)
    this.log(`Encrypted: ${release.cryptr !== undefined}`)
    this.log(`Files: ${release.files.length}`)
    this.log(`Providers: ${release.providers.length}`)
    this.log(`DNS: ${release.dnsProviders.length}`)
    this.log('')

    const response = await release.deploy()

    this.log('')
    this.log(JSON.stringify(response, null, 2))
  }

  public async createRelease(): Promise<Release> {
    const { args, flags } = this.parse(Deploy)

    const release = new Release(args.file)

    // Release name
    if (flags.name) {
      release.setName(flags.name)
    }

    if (flags.encrypt) {
      // Encryption key
      release.setEncryptKey(flags.encrypt)
    }

    if (flags.unpin) {
      // Unpin previous release.
      release.setUnpinPrevious(flags.unpin)
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
      case 'slate':
        release.addProvider(upperFirst(provider))
        break

      case 'dreamlink':
        release.addProvider('DreamLink')
        break

      case 'dreamlink-cluster':
        release.addProvider('DreamLinkCluster')
        break

      case 'nft.storage':
        release.addProvider('NFTStorage')
        break

      case 'web3.storage':
        release.addProvider('Web3Storage')
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

    // Find previous CID.
    release.on('previousCID:begin', () => {
      this.spinner.start('Finding previous CID...')
    })

    release.on('previousCID:success', (cid: string) => {
      if (release.cryptr) {
        this.spinner.succeed(`Previous CID: ${cid.substring(0, 5)}...`)
      } else {
        this.spinner.succeed(`Previous CID: ${cid}`)
      }
    })

    release.on('previousCID:fail', (error: Error) => {
      this.spinner.fail(`Previous CID: ${error.message}`)
    })

    // Upload.
    release.on('upload:begin', (provider: Provider) => {
      this.spinner.start(`Uploading to ${provider.label}...`)
    })

    release.on('upload:success', (result: DeployResult, provider: Provider) => {
      this.spinner.succeed(`Uploaded to ${provider.label}.`)

      if (!release.cryptr) {
        this.spinner.info(`${result.url}`)
      }
    })

    release.on('upload:fail', (error: Error, provider: Provider) => {
      this.spinner.fail(`Upload to ${provider.label} failed: ${error.message}`)
    })

    // Pin.
    release.on('pin:begin', (provider: Provider) => {
      this.spinner.start(`Pinning to ${provider.label}...`)
    })

    release.on('pin:success', (result: DeployResult, provider: Provider) => {
      this.spinner.succeed(`Pinned to ${provider.label}.`)

      if (!release.cryptr) {
        this.spinner.info(`${result.url}`)
      }
    })

    release.on('pin:fail', (error: Error, provider: Provider) => {
      this.spinner.fail(`Pin to ${provider.label} failed: ${error.message}`)
    })

    // Unpin
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

    // DNS
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

    // Caching
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

    return release
  }
}

export = Deploy
