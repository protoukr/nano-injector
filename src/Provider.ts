import { InjectorsStack } from './InjectorsStack'
import { InjectingError } from './InjectingError'

/**
 * Symbol used for storing the id of a provider
 */
const ID_SYMBOL = Symbol('id')
/**
 * Symbol used for storing the name of a provider
 */
const NAME_SYMBOL = Symbol('name')

/**
 * Provider is a second main concept in the library. Basically just it is just a function
 * through which binding with the specific value occurs.
 */
export interface Provider<T> {
  readonly [ID_SYMBOL]: number
  readonly [NAME_SYMBOL]: string

  /**
   * Returns bound to this provider value. Throws the exception if it's not found.
   * If throwing the exception is not desired any value to the provider should
   * be passed
   */
  (): T

  /**
   * Returns bound to this provider value. Returns default one if the bound value
   * is not found
   * @param defValue
   */
  <DefValT>(defValue: DefValT): T | DefValT
}

let PROVIDER_ID = 0

/**
 * Creates the new provider for some value with a specific type
 * @param name name for this provider used mainly for debugging purposes
 */
export function createProvider<T> (name?: string): Provider<T> {
  function provider (...args: unknown[]): T | unknown {
    const value = InjectorsStack.get(provider as Provider<T>)
    if (value !== undefined) {
      return value
    }
    if (args.length !== 0) {
      return args[0]
    }
    throw new InjectingError(`Value of ${name ?? 'unknown'} provider is not found`)
  }

  provider[NAME_SYMBOL] = name
  provider[ID_SYMBOL] = PROVIDER_ID++
  return provider as Provider<T>
}

/**
 * Determines whether the received value is a provider
 * @param value value which should be tested
 */
export function isProvider<T = unknown> (value: unknown): value is Provider<T> {
  if (typeof value !== 'function') {
    return false
  }
  const provider = value as Provider<unknown>
  return typeof provider[ID_SYMBOL] !== 'undefined'
}

/**
 * Returns the id of the specified provider
 * @param provider
 */
export function getProviderID (provider: Provider<unknown>): number {
  return provider[ID_SYMBOL]
}

/**
 * Returns the name of the specified provider
 * @param provider
 */
export function getProviderName (provider: Provider<unknown>): string {
  return provider[NAME_SYMBOL]
}
