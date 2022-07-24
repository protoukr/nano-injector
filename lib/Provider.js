"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProviderName = exports.getProviderID = exports.isProvider = exports.createProvider = void 0;
const InjectorsStack_1 = require("./InjectorsStack");
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
    function provider(defValue) {
        const hasDefaultValue = arguments.length > 0;
        const { activeInjector } = InjectorsStack_1.InjectorsStack;
        if (hasDefaultValue) {
            return activeInjector.tryGetValue(provider, defValue);
        }
        return activeInjector.getValue(provider);
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
