import { InjectorsStack } from './InjectorsStack';

export type ProviderValueType<T extends Provider<any>> = T extends Provider<infer R> ? R : never;

/**
 * Symbol used to store the unique ID of a provider.
 */
const ID_SYMBOL = Symbol('id');
/**
 * Symbol used for storing the name of a provider
 */
const NAME_SYMBOL = Symbol('name');

/**
 * A Provider is a core concept in the library. It is essentially a function
 * that facilitates binding to a specific value.
 */
export interface Provider<T> {
  readonly [ID_SYMBOL]: number;
  readonly [NAME_SYMBOL]?: string;

  /**
   * Returns the value bound to this provider. Throws an exception if the value is not found.
   * To avoid an exception, pass a default value.
   */
  (): T;

  /**
   * Returns the value bound to this provider, or the default value if the bound value is not found.
   * @param defValue
   */
  <DefValT>(defValue: DefValT): T | DefValT;
}

let PROVIDER_ID = 0;

/**
 * Creates a new provider for a specific value type.
 * @param name name for this provider used mainly for debugging purposes
 */
export function createProvider<T>(name?: string): Provider<T> {
  function callback(defValue?: any): T {
    const hasDefaultValue = arguments.length > 0;
    const { activeInjector } = InjectorsStack;
    if (hasDefaultValue) {
      return activeInjector.tryGetValue(provider, defValue);
    }
    return activeInjector.getValue(provider);
  }
  const provider: Provider<T> = Object.assign(callback, {
    [NAME_SYMBOL]: name,
    [ID_SYMBOL]: PROVIDER_ID++,
  });
  return provider;
}

/**
 * Determines whether the given value is a provider.
 * @param value value which should be tested
 */
export function isProvider<T = unknown>(value: unknown): value is Provider<T> {
  if (typeof value !== 'function') {
    return false;
  }
  const provider = value as Provider<unknown>;
  return typeof provider[ID_SYMBOL] !== 'undefined';
}

/**
 * Returns the unique ID of the specified provider.
 * @param provider
 */
export function getProviderID(provider: Provider<unknown>): number {
  return provider[ID_SYMBOL];
}

/**
 * Returns the name of the specified provider
 * @param provider
 */
export function getProviderName(provider: Provider<unknown>): string | undefined {
  return provider[NAME_SYMBOL];
}
