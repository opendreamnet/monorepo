import { pbkdf2Sync } from 'pbkdf2'
import randomBytes from 'randombytes'
import english from './english.json'

const INVALID_MNEMONIC = 'Invalid mnemonic'

export { english }

/**
 *
 *
 * @param {string} [str]
 * @return {*}  {string}
 */
function normalize(str?: string): string {
  return (str || '').normalize('NFKD')
}

/**
 *
 *
 * @param {*} s
 * @return {*}  {string}
 */
function toHex(s: string): string {
  // utf8 to latin1
  s = unescape(encodeURIComponent(s))
  let h = ''
  for (let i = 0; i < s.length; i++) {
      h += s.charCodeAt(i).toString(16)
  }
  return h
}

/**
 *
 *
 * @param {*} h
 * @return {*}  {string}
 */
function fromHex(h: string): string {
  let s = ''
  for (let i = 0; i < h.length; i+=2) {
      s += String.fromCharCode(parseInt(h.substr(i, 2), 16))
  }
  return decodeURIComponent(escape(s))
}

/**
 *
 *
 * @param {string} str
 * @param {string} padString
 * @param {number} length
 * @return {*}  {string}
 */
function lpad(str: string, padString: string, length: number): string {
  while (str.length < length) {
    str = padString + str
  }
  return str
}

/**
 *
 *
 * @param {string} bin
 * @return {*}  {number}
 */
function binaryToByte(bin: string): number {
  return parseInt(bin, 2)
}

/**
 *
 *
 * @param {number[]} bytes
 * @return {*}  {string}
 */
function bytesToBinary(bytes: number[]): string {
  return bytes.map((x: number): string => lpad(x.toString(2), '0', 8)).join('')
}

/**
 *
 *
 * @param {string} [password]
 * @return {*}  {string}
 */
function salt(password?: string): string {
  return 'mnemonic' + (password || '')
}

/**
 *
 *
 * @export
 * @param {string} mnemonic
 * @param {string} [password]
 * @return {*}  {Buffer}
 */
export function mnemonicToSeed(
  mnemonic: string,
  password?: string,
): Buffer {
  const mnemonicBuffer = Buffer.from(normalize(mnemonic), 'utf8')
  const saltBuffer = Buffer.from(salt(normalize(password)), 'utf8')

  return pbkdf2Sync(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512')
}

/**
 *
 *
 * @export
 * @param {string} mnemonic
 * @param {string[]} [wordlist]
 * @return {*}  {string}
 */
export function mnemonicToEntropy(
  mnemonic: string,
  wordlist?: string[],
): string {
  wordlist = wordlist || english

  const words = normalize(mnemonic).split(' ')

  // Convert word indices to 11-bit binary strings
  const entropyBits = words
    .map(
      (word: string): string => {
        const index = wordlist!.indexOf(word)

        if (index === -1) {
          throw new Error(INVALID_MNEMONIC)
        }

        let binary = lpad(index.toString(2), '0', 11)

        if (word === words[words.length - 1]) {
          // The last word must have the original number of bits.
          binary = index.toString(2)
        }

        return binary
      },
    )
    .join('')

  // calculate the checksum and compare
  const entropyBytes = entropyBits.match(/(.{1,8})/g)!.map(binaryToByte)
  const entropy = Buffer.from(entropyBytes)

  return entropy.toString('hex')
}

/**
 *
 *
 * @export
 * @param {string} mnemonic
 * @param {string[]} [wordlist]
 * @return {*}  {string}
 */
export function mnemonicToString(
  mnemonic: string,
  wordlist?: string[],
): string {
  const entropy = mnemonicToEntropy(mnemonic, wordlist)
  return fromHex(entropy)
}

/**
 *
 *
 * @export
 * @param {(Buffer | string)} entropy
 * @param {string[]} [wordlist]
 * @return {*}  {string}
 */
export function entropyToMnemonic(
  entropy: Buffer | string,
  wordlist?: string[],
): string {
  if (!Buffer.isBuffer(entropy)) {
    // Entropy must be a buffer.
    entropy = Buffer.from(entropy, 'hex')
  }

  wordlist = wordlist || english

  // Transform the buffer into a joined 8-bit binary.
  const entropyBits = bytesToBinary(Array.from(entropy))

  // Break the binary into 11-bit chunks.
  const chunks = entropyBits.match(/(.{1,11})/g)!

  const words = chunks.map(
    (binary: string): string => {
      const index = binaryToByte(binary)
      return wordlist![index]
    },
  )

  return words.join(' ')
}

/**
 *
 *
 * @export
 * @param {string} entropy
 * @param {string[]} [wordlist]
 * @return {*}  {string}
 */
export function stringToMnemonic(
  entropy: string,
  wordlist?: string[],
): string {
  return entropyToMnemonic(toHex(entropy), wordlist)
}

/**
 *
 *
 * @export
 * @param {number} [strength]
 * @param {(size: number) => Buffer} [rng]
 * @param {string[]} [wordlist]
 * @return {*}  {string}
 */
export function generateMnemonic(
  strength?: number,
  rng?: (size: number) => Buffer,
  wordlist?: string[],
): string {
  strength = strength || 128
  // @ts-ignore
  rng = rng || randomBytes

  return entropyToMnemonic(rng!(strength / 8), wordlist)
}

/**
 *
 *
 * @export
 * @param {string} mnemonic
 * @param {string[]} [wordlist]
 * @return {*}  {boolean}
 */
export function validateMnemonic(
  mnemonic: string,
  wordlist?: string[],
): boolean {
  try {
    mnemonicToEntropy(mnemonic, wordlist)
  } catch (e) {
    return false
  }

  return true
}