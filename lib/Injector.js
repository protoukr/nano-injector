"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Injector = exports.$Injector = exports.NoBinderError = exports.CircularDependencyError = void 0;
const Binder_1 = require("./Binder");
const Provider_1 = require("./Provider");
const InjectorsStack_1 = require("./InjectorsStack");
/**
 * Thrown when circular dependency is detected
 */
class CircularDependencyError extends Error {
    constructor(providers) {
        const providerNames = providers.map(Provider_1.getProviderName)
            .map((name) => name !== null && name !== void 0 ? name : '?');
        super(`Circular dependency detected: ${providerNames.join('->')}`);
    }
}
exports.CircularDependencyError = CircularDependencyError;
class NoBinderError extends Error {
    constructor(provider) {
        var _a;
        const providerName = (_a = (0, Provider_1.getProviderName)(provider)) !== null && _a !== void 0 ? _a : 'unknown';
        super(`Value of ${providerName} provider is not found`);
    }
}
exports.NoBinderError = NoBinderError;
/**
 * Provider which every injector binds itself to
 */
exports.$Injector = (0, Provider_1.createProvider)();
/**
 * Main entity in the library, which holds provider's bindings and through which
 * dependencies are resolved
 */
class Injector {
    /**
     * @param params.name name of the injector which can be useful mainly for debugging purposes
     * @param params.parent parent injector for the composition of injectors
     * @param params.logger specific log function if the custom output is required
     */
    constructor(params = {}) {
        this.binders = new Map();
        this.resolvingProviders = [];
        const { name, parent, logger = console.warn } = params;
        this.name = name;
        this.parent = parent;
        this.logger = logger;
        this.bindProvider(exports.$Injector).toValue(this);
    }
    /**
     * Creates new binder and joins it to the specified providers. If the provider
     * is already bound, then overriding occurs
     * @param providers providers which the binder should be joined to
     */
    bindProvider(...providers) {
        const binder = new Binder_1.Binder(this);
        providers.forEach((provider) => this.binders.set(provider, binder));
        return binder;
    }
    /**
     * Resolves all providers to their values and assigns them to the specified instance
     * @param instance
     * @param providers
     */
    injectValues(instance, providers) {
        Object.entries(providers)
            .filter(([, value]) => (0, Provider_1.isProvider)(value))
            .forEach(([name, provider]) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            instance[name] = this.getValue(provider);
        });
    }
    /**
     * Activates this injector and creates new instance of the type with the provided arguments
     * @param type
     * @param args
     */
    createInstance(type, ...args) {
        // eslint-disable-next-line new-cap
        return this.activateAndCall(() => new type(...args));
    }
    /**
     * Activates this injector and calls the function with provided arguments
     * @param func function which should be called
     * @param args args which should be passed to the called function
     */
    callFunc(func, ...args) {
        return this.activateAndCall(() => func(...args));
    }
    /**
     * Returns bound to the specified provider value. If the value is not found
     * exception is thrown
     * @param provider
     */
    getValue(provider) {
        const binder = this.getBinder(provider);
        this.pushResolvingProvider(provider);
        const value = this.activateAndCall(() => binder.getValue());
        this.popResolvingProvder();
        return value;
    }
    tryGetValue(provider, defValue) {
        try {
            return this.getValue(provider);
        }
        catch (err) {
            if (err instanceof NoBinderError) {
                return defValue;
            }
            throw err;
        }
    }
    pushResolvingProvider(provider) {
        this.checkCircularDependency(provider);
        this.resolvingProviders.push(provider);
    }
    popResolvingProvder() {
        this.resolvingProviders.pop();
    }
    getBinder(provider) {
        const binder = this.tryGetBinderRecursively(provider);
        if (binder == null) {
            throw new NoBinderError(provider);
        }
        return binder;
    }
    /**
     * Finds binder for the specified provider recursively up to the root injector
     * @param provider
     * @private
     */
    tryGetBinderRecursively(provider) {
        var _a, _b;
        return ((_a = this.binders.get(provider)) !== null && _a !== void 0 ? _a : (_b = this.parent) === null || _b === void 0 ? void 0 : _b.tryGetBinderRecursively(provider));
    }
    /**
     * Checks is there circular dependency and throws error if so
     * @param provider
     * @private
     */
    checkCircularDependency(provider) {
        const i = this.resolvingProviders.indexOf(provider);
        if (i !== -1) {
            const providers = [...this.resolvingProviders.slice(i), provider];
            throw new CircularDependencyError(providers);
        }
    }
    /**
     * Temporary activates this injector calls provided function and returns its value
     * @param func
     * @private
     */
    activateAndCall(func) {
        InjectorsStack_1.InjectorsStack.push(this);
        const value = func();
        InjectorsStack_1.InjectorsStack.pop();
        return value;
    }
}
exports.Injector = Injector;
