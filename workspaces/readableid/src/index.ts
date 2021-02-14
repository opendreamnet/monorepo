import { merge, upperFirst, toString, isArrayLike, isObjectLike, lowerCase } from 'lodash'
import Chance from 'chance'
import * as mnemonic from '@dreamnet/mnemonic'

export interface ReadableOptions {
  lowercase?: boolean;
  separator?: string;
}

export class ReadableID {
  public options: ReadableOptions = {
    lowercase: true,
    separator: ' ',
  }

  public seed: string

  public chance: Chance.Chance

  public constructor(seed: unknown, options: ReadableOptions = {}) {
    this.options = merge(this.options, options)
    this.seed = this.toString(seed)
    this.chance = new Chance(this.seed)
  }

  public randomInteger(min: number, max: number, localSeed?: string): number {
    let chance: Chance.Chance = this.chance

    if (localSeed) {
      chance = new Chance(this.seed + localSeed)
    }

    return chance.integer({ min, max })
  }

  public generate(count = 3): string {
    const words: string[] = []

    for (let i = 0; i < count; i++) {
      const rand = this.randomInteger(0, mnemonic.english.length - 1)
      const word = this.options.lowercase ? lowerCase(mnemonic.english[rand]) : upperFirst(mnemonic.english[rand])

      words.push(word)
    }

    return words.join(this.options.separator)
  }

  public encrypt(): string {
    const words = mnemonic.stringToMnemonic(this.seed)
      .split(' ')
      .map((word) => this.options.lowercase ? lowerCase(word) : upperFirst(word))

    return words.join(this.options.separator)
  }

  public decrypt(value: string): string {
    const words = value.split(this.options.separator || ' ').map(word => lowerCase(word))
    return mnemonic.mnemonicToString(words.join(' '))
  }

  public toString(value: unknown): string {
    if (isArrayLike(value) || isObjectLike(value)) {
      return JSON.stringify(value)
    }

    return toString(value)
  }
}

export function generate(seed: unknown, count = 3, options: ReadableOptions = {}): string {
  const instance = new ReadableID(seed, options)
  return instance.generate(count)
}

export function encrypt(seed: unknown, options: ReadableOptions = {}): string {
  const instance = new ReadableID(seed, options)
  return instance.encrypt()
}

export function decrypt(value: string): string {
  return mnemonic.mnemonicToString(value)
}
