"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Injector = exports.$Injector = void 0;
const Binder_1 = require("./Binder");
const Provider_1 = require("./Provider");
const InjectorsStack_1 = require("./InjectorsStack");
const InjectingError_1 = require("./InjectingError");
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
     * undefined is returned
     * @param provider
     */
    getValue(provider) {
        const binder = this.getBinder(provider);
        if (binder == null) {
            return undefined;
        }
        this.checkCircularDependency(provider);
        this.resolvingProviders.push(provider);
        const value = this.activateAndCall(() => binder.getValue());
        this.resolvingProviders.pop();
        return value;
    }
    /**
     * Finds binder for the specified provider recursively up to the root injector
     * @param provider
     * @private
     */
    getBinder(provider) {
        const binder = this.binders.get(provider);
        if (binder == null && this.parent != null) {
            return this.parent.getBinder(provider);
        }
        return binder;
    }
    /**
     * Checks is there circular dependency and throws error if so
     * @param provider
     * @private
     */
    checkCircularDependency(provider) {
        const i = this.resolvingProviders.indexOf(provider);
        if (i === -1) {
            return;
        }
        const providers = [...this.resolvingProviders.slice(i), provider]
            .map(Provider_1.getProviderName)
            .map((name) => name !== null && name !== void 0 ? name : '?');
        throw new InjectingError_1.InjectingError(`Circular dependency detected: ${providers.join('->')}`);
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
