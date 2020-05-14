import { Command, flags } from '@oclif/command'
import * as ora from 'ora'
import { upperFirst } from 'lodash'
import { UrlHash, DNSRecord } from './modules/interfaces'
import { DnsProvider } from './dnslink'
import { Release, Provider } from '.'

class Deploy extends Command {
  static description = ''

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),

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
        'antopie',
        'codeberg',
        'teknik',
      ],
      required: true,
      char: 'p',
    }),

    dns: flags.string({
      multiple: true,
      options: ['cloudflare'],
      char: 'd',
    }),

    name: flags.string({
      char: 'n',
    }),
  }

  static args = [
    {
      name: 'release',
      required: true,
    },
  ]

  // eslint-disable-next-line import/namespace
  spinner: ora.Ora = ora.default()

  async run(): Promise<void> {
    const { args, flags } = this.parse(Deploy)

    const release = new Release(args.release, flags.name)

    flags.provider.forEach(provider => {
      switch (provider) {
      case 'ipfs':
        release.addProvider(provider.toUpperCase())
        break

      case 'ipfs-cluster':
        release.addProvider('IPFSCluster')
        break

      case 'infura':
      case 'pinata':
      case 'github':
      case 'gitea':
      case 'antopie':
      case 'codeberg':
      case 'teknik':
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
      flags.dns.forEach(provider => {
        switch (provider) {
        case 'cloudflare':
          release.addDnsProvider('Cloudflare')
          break
        }
      })
    }

    release.on('upload_begin', (provider: Provider) => {
      this.spinner.start(`Uploading to ${provider.label}...`)
    })

    release.on('upload_success', (result: UrlHash, provider: Provider) => {
      this.spinner.succeed(`Uploaded to ${provider.label}.`)
      this.spinner.info(`${result.url}`)
    })

    release.on('upload_fail', (error: any, provider: Provider) => {
      this.spinner.fail(`Upload to ${provider.label} failed: ${error.message}`)

      if (error.response) {
        console.warn(error.response)
      }

      if (error.request) {
        console.warn(error.request)
      }
    })

    release.on('pin_begin', (provider: Provider) => {
      this.spinner.start(`Pinning to ${provider.label}...`)
    })

    release.on('pin_success', (cid: string, provider: Provider) => {
      this.spinner.succeed(`Pinned to ${provider.label}.`)
      this.spinner.info(cid)
    })

    release.on('pin_fail', (error: Error, provider: Provider) => {
      this.spinner.fail(`Pin to ${provider.label} failed: ${error.message}`)
    })

    release.on('unpin_begin', (provider: Provider) => {
      this.spinner.start(`Unpinning old version from ${provider.label}...`)
    })

    release.on('unpin_success', (provider: Provider) => {
      this.spinner.succeed(`Unpinned from ${provider.label}.`)
      this.spinner.info(`${provider.release.previousCID}`)
    })

    release.on('unpin_fail', (error: Error, provider: Provider) => {
      this.spinner.fail(`Unpin from ${provider.label} failed: ${error.message}`)
    })

    release.on('dns_begin', (provider: DnsProvider) => {
      this.spinner.start(`Updating ${provider.label} DNS...`)
    })

    release.on('dns_fail', (error: Error, provider: DnsProvider) => {
      this.spinner.fail(`${provider.label} DNS update has failed: ${error.message}`)
    })

    release.on('dns_success', (result: DNSRecord, provider: DnsProvider) => {
      this.spinner.succeed(`${provider.label} DNS updated.`)
      this.spinner.info(`${result.record} = ${result.content}`)
    })

    const response = await release.run()

    this.log(JSON.stringify(response))
  }
}

export = Deploy
