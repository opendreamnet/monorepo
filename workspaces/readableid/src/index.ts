import fs from 'fs'
import path from 'path'
import { merge, upperFirst } from 'lodash'
import Chance from 'chance'

export interface ReadableOptions {
  lowercase?: boolean;
  count?: number;
  separator?: string;
  seed?: string|number;
}

export class ReadableID {
  options: ReadableOptions = {
    lowercase: false,
    count: 3,
    separator: '',
    seed: undefined,
  }

  adjectives: string[]

  nouns: string[]

  constructor(options: ReadableOptions = {}) {
    this.options = merge(this.options, options)
    this.adjectives = fs.readFileSync(path.join(__dirname, 'words', 'adjectives.txt')).toString().split(' ')
    // this.nouns = fs.readFileSync(path.join(__dirname, 'words', 'nouns.txt')).toString().split(' ')
  }

  random(localSeed: string|number, min: number, max: number): number {
    // @ts-ignore
    const chance = new Chance(this.options.seed, localSeed)
    return chance.integer({ min, max })
  }

  generate(): string {
    const words: string[] = []

    for (let i = 0; i < this.options.count; i++) {
      const rand = this.random(i, 0, this.adjectives.length - 1)
      let word = this.adjectives[rand]

      if (!this.options.lowercase) {
        word = upperFirst(word)
      }

      words.push(word)
    }

    return words.join(this.options.separator)
  }
}

export function generate(options: ReadableOptions = {}): string {
  const instance = new ReadableID(options)
  return instance.generate()
}
