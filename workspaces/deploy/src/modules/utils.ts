import { Provider } from '../uploaders'

export function isProvider(value: any): value is Provider {
  return value instanceof Provider
}

export function applyMixins(derivedCtor: any, baseCtors: any[]): any {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name))
    })
  })
}
