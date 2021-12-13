"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProviderName = exports.getProviderID = exports.isProvider = exports.createProvider = void 0;
const InjectorsStack_1 = require("./InjectorsStack");
const InjectingError_1 = require("./InjectingError");
/**
 * Symbol used for storing the id of a provider
 */
const ID_SYMBOL = Symbol('id');
/**
 * Symbol used for storing the name of a provider
 */
const NAME_SYMBOL = Symbol('name');
let PROVIDER_ID = 0;
/**
 * Creates the new provider for some value with a specific type
 * @param name name for this provider used mainly for debugging purposes
 */
function createProvider(name) {
    function provider(...args) {
        const value = InjectorsStack_1.InjectorsStack.get(provider);
        if (value !== undefined) {
            return value;
        }
        if (args.length !== 0) {
            return args[0];
        }
        throw new InjectingError_1.InjectingError(`Value of ${name !== null && name !== void 0 ? name : 'unknown'} provider is not found`);
    }
    provider[NAME_SYMBOL] = name;
    provider[ID_SYMBOL] = PROVIDER_ID++;
    return provider;
}
exports.createProvider = createProvider;
/**
 * Determines whether the received value is a provider
 * @param value value which should be tested
 */
function isProvider(value) {
    if (typeof value !== 'function') {
        return false;
    }
    const provider = value;
    return typeof provider[ID_SYMBOL] !== 'undefined';
}
exports.isProvider = isProvider;
/**
 * Returns the id of the specified provider
 * @param provider
 */
function getProviderID(provider) {
    return provider[ID_SYMBOL];
}
exports.getProviderID = getProviderID;
/**
 * Returns the name of the specified provider
 * @param provider
 */
function getProviderName(provider) {
    return provider[NAME_SYMBOL];
}
exports.getProviderName = getProviderName;
