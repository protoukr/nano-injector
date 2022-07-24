import { Binder } from './Binder';
import { Provider, ProviderValueType } from './Provider';
/**
 * Thrown when circular dependency is detected
 */
export declare class CircularDependencyError extends Error {
    constructor(providers: Array<Provider<unknown>>);
}
export declare class NoBinderError extends Error {
    constructor(provider: Provider<unknown>);
}
declare type UnionToIntersection<T> = (T extends any ? (k: T) => void : never) extends (k: infer R) => void ? R : never;
/**
 * Provider which every injector binds itself to
 */
export declare const $Injector: Provider<Injector>;
/**
 * Main entity in the library, which holds provider's bindings and through which
 * dependencies are resolved
 */
export declare class Injector {
    private readonly binders;
    private readonly resolvingProviders;
    private readonly name;
    private readonly parent;
    private readonly logger;
    /**
     * @param params.name name of the injector which can be useful mainly for debugging purposes
     * @param params.parent parent injector for the composition of injectors
     * @param params.logger specific log function if the custom output is required
     */
    constructor(params?: {
        name?: string;
        parent?: Injector;
        logger?: (msg: string) => unknown;
    });
    /**
     * Creates new binder and joins it to the specified providers. If the provider
     * is already bound, then overriding occurs
     * @param providers providers which the binder should be joined to
     */
    bindProvider<ProviderT extends Array<Provider<unknown>>, ValueT extends UnionToIntersection<ProviderT extends Array<Provider<infer R>> ? R : never>>(...providers: ProviderT): Binder<ValueT>;
    /**
     * Resolves all providers to their values and assigns them to the specified instance
     * @param instance
     * @param providers
     */
    injectValues<T extends object, K extends keyof T>(instance: T, providers: Record<K, Provider<T[K]>>): void;
    /**
     * Activates this injector and creates new instance of the type with the provided arguments
     * @param type
     * @param args
     */
    createInstance<ClassT extends new (...args: any[]) => unknown>(type: ClassT, ...args: ConstructorParameters<ClassT>): InstanceType<ClassT>;
    /**
     * Activates this injector and calls the function with provided arguments
     * @param func function which should be called
     * @param args args which should be passed to the called function
     */
    callFunc<FuncT extends (...args: any[]) => unknown>(func: FuncT, ...args: Parameters<FuncT>): ReturnType<FuncT>;
    /**
     * Returns bound to the specified provider value. If the value is not found
     * exception is thrown
     * @param provider
     */
    getValue<ProviderT extends Provider<unknown>>(provider: ProviderT): ProviderValueType<ProviderT>;
    /**
     * Returns bound to the specified provider value. If the value is not found
     * default value is returned
     * @param provider
     */
    tryGetValue<ProviderT extends Provider<unknown>>(provider: ProviderT): ProviderValueType<ProviderT> | undefined;
    tryGetValue<ProviderT extends Provider<unknown>, DefValT>(provider: ProviderT, defVal: DefValT): ProviderValueType<ProviderT> | DefValT;
    private pushResolvingProvider;
    private popResolvingProvder;
    private getBinder;
    /**
     * Finds binder for the specified provider recursively up to the root injector
     * @param provider
     * @private
     */
    private tryGetBinderRecursively;
    /**
     * Checks is there circular dependency and throws error if so
     * @param provider
     * @private
     */
    private checkCircularDependency;
    /**
     * Temporary activates this injector calls provided function and returns its value
     * @param func
     * @private
     */
    private activateAndCall;
}
export {};
