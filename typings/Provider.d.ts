/**
 * Symbol used for storing the id of a provider
 */
declare const ID_SYMBOL: unique symbol;
/**
 * Symbol used for storing the name of a provider
 */
declare const NAME_SYMBOL: unique symbol;
/**
 * Provider is a second main concept in the library. Basically just it is just a function
 * through which binding with the specific value occurs.
 */
export interface Provider<T> {
    readonly [ID_SYMBOL]: number;
    readonly [NAME_SYMBOL]: string;
    /**
     * Returns bound to this provider value. Throws the exception if it's not found.
     * If throwing the exception is not desired any value to the provider should
     * be passed
     */
    (): T;
    /**
     * Returns bound to this provider value. Returns default one if the bound value
     * is not found
     * @param defValue
     */
    <DefValT>(defValue: DefValT): T | DefValT;
}
/**
 * Creates the new provider for some value with a specific type
 * @param name name for this provider used mainly for debugging purposes
 */
export declare function createProvider<T>(name?: string): Provider<T>;
/**
 * Determines whether the received value is a provider
 * @param value value which should be tested
 */
export declare function isProvider<T = unknown>(value: unknown): value is Provider<T>;
/**
 * Returns the id of the specified provider
 * @param provider
 */
export declare function getProviderID(provider: Provider<unknown>): number;
/**
 * Returns the name of the specified provider
 * @param provider
 */
export declare function getProviderName(provider: Provider<unknown>): string;
export {};
