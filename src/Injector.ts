import { Binder } from './Binder';
import { createProvider, getProviderName, isProvider, Provider, ProviderValueType } from './Provider';
import { InjectorsStack } from './InjectorsStack';

/**
 * Thrown when circular dependency is detected
 */
export class CircularDependencyError extends Error {
  constructor(providers: Array<Provider<unknown>>) {
    const providerNames = providers.map(getProviderName).map((name) => name ?? '?');
    super(`Circular dependency detected: ${providerNames.join('->')}`);
  }
}

export class NoBinderError extends Error {
  constructor(provider: Provider<unknown>) {
    const providerName = getProviderName(provider) ?? 'unknown';
    super(`Value of ${providerName} provider is not found`);
  }
}

// https://stackoverflow.com/a/50375286
type UnionToIntersection<T> = (T extends any ? (k: T) => void : never) extends (k: infer R) => void ? R : never;

/**
 * Provider which every injector binds itself to
 */
export const $Injector = createProvider<Injector>();

/**
 * Main entity in the library, which holds provider's bindings and through which
 * dependencies are resolved
 */
export class Injector {
  private readonly binders = new Map<() => unknown, Binder<unknown>>();
  private readonly resolvingProviders: Array<Provider<unknown>> = [];

  private readonly name: string | undefined;
  private readonly parent: Injector | undefined;
  private readonly logger: (msg: string) => unknown;

  /**
   * @param params.name name of the injector which can be useful mainly for debugging purposes
   * @param params.parent parent injector for the composition of injectors
   * @param params.logger specific log function if the custom output is required
   */
  constructor(
    params: {
      name?: string;
      parent?: Injector;
      logger?: (msg: string) => unknown;
    } = {},
  ) {
    const { name, parent, logger = console.warn } = params;
    this.name = name;
    this.parent = parent;
    this.logger = logger;
    this.bindProvider($Injector).toValue(this);
  }

  /**
   * Creates new binder and joins it to the specified providers. If the provider
   * is already bound, then overriding occurs
   * @param providers providers which the binder should be joined to
   */
  bindProvider<
    ProviderT extends Array<Provider<unknown>>,
    ValueT extends UnionToIntersection<ProviderT extends Array<Provider<infer R>> ? R : never>,
  >(...providers: ProviderT): Binder<ValueT> {
    const binder = new Binder<ValueT>(this);
    providers.forEach((provider) => this.binders.set(provider, binder));
    return binder;
  }

  /**
   * Resolves all providers to their values and assigns them to the specified instance
   * @param instance
   * @param providers
   */
  injectValues<T extends object, K extends keyof T>(instance: T, providers: Record<K, Provider<T[K]>>): void {
    (Object.keys(providers) as K[]).forEach((key) => {
      const provider = providers[key];
      if (isProvider(provider)) {
        instance[key] = this.getValue(provider);
      }
    });
  }

  /**
   * Activates this injector and creates new instance of the type with the provided arguments
   * @param type
   * @param args
   */
  createInstance<ClassT extends new (...args: any[]) => unknown>(
    type: ClassT,
    ...args: ConstructorParameters<ClassT>
  ): InstanceType<ClassT> {
    return this.activateAndCall(() => new type(...args)) as InstanceType<ClassT>;
  }

  /**
   * Activates this injector and calls the function with provided arguments
   * @param func function which should be called
   * @param args args which should be passed to the called function
   */
  callFunc<FuncT extends (...args: any[]) => unknown>(func: FuncT, ...args: Parameters<FuncT>): ReturnType<FuncT> {
    return this.activateAndCall<ReturnType<FuncT>>(() => func(...args) as ReturnType<FuncT>);
  }

  /**
   * Returns bound to the specified provider value. If the value is not found
   * exception is thrown
   * @param provider
   */
  getValue<ProviderT extends Provider<unknown>>(provider: ProviderT): ProviderValueType<ProviderT> {
    const binder = this.getBinder(provider);
    this.pushResolvingProvider(provider);
    const value = this.activateAndCall(() => binder.getValue() as ProviderValueType<ProviderT>);
    this.popResolvingProvder();
    return value;
  }

  /**
   * Returns bound to the specified provider value. If the value is not found
   * default value is returned
   * @param provider
   */
  tryGetValue<ProviderT extends Provider<unknown>>(provider: ProviderT): ProviderValueType<ProviderT> | undefined;
  tryGetValue<ProviderT extends Provider<unknown>, DefValT>(
    provider: ProviderT,
    defVal: DefValT,
  ): ProviderValueType<ProviderT> | DefValT;
  tryGetValue(provider: Provider<unknown>, defValue?: unknown): unknown {
    try {
      return this.getValue(provider);
    } catch (err) {
      if (err instanceof NoBinderError) {
        return defValue;
      }
      throw err;
    }
  }

  private pushResolvingProvider(provider: Provider<unknown>): void {
    this.checkCircularDependency(provider);
    this.resolvingProviders.push(provider);
  }

  private popResolvingProvder(): void {
    this.resolvingProviders.pop();
  }

  private getBinder<ValueT>(provider: Provider<ValueT>): Binder<ValueT> {
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
  private tryGetBinderRecursively<ValueT>(provider: Provider<ValueT>): Binder<ValueT> | undefined {
    return (this.binders.get(provider) ?? this.parent?.tryGetBinderRecursively(provider)) as Binder<ValueT> | undefined;
  }

  /**
   * Checks is there circular dependency and throws error if so
   * @param provider
   * @private
   */
  private checkCircularDependency(provider: Provider<unknown>): void {
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
  private activateAndCall<T>(func: () => T): T {
    InjectorsStack.push(this);
    try {
      return func();
    } finally {
      InjectorsStack.pop();
    }
  }
}
