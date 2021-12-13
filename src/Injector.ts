import { Binder } from './Binder'
import {
  createProvider,
  getProviderName,
  isProvider,
  Provider
} from './Provider'
import { InjectorsStack } from './InjectorsStack'
import { InjectingError } from './InjectingError'

// https://stackoverflow.com/a/50375286
type UnionToIntersection<T> =
  (T extends any ? (k: T) => void : never) extends (k: infer R) => void ? R : never

/**
 * Provider which every injector binds itself to
 */
export const $Injector = createProvider<Injector>()

/**
 * Main entity in the library, which holds provider's bindings and through which
 * dependencies are resolved
 */
export class Injector {
  private readonly binders = new Map<() => unknown, Binder<unknown>>()
  private readonly resolvingProviders: Array<Provider<unknown>> = []

  private readonly name: string | undefined
  private readonly parent: Injector | undefined
  private readonly logger: (msg: string) => unknown

  /**
   * @param params.name name of the injector which can be useful mainly for debugging purposes
   * @param params.parent parent injector for the composition of injectors
   * @param params.logger specific log function if the custom output is required
   */
  constructor (params: {
    name?: string
    parent?: Injector
    logger?: (msg: string) => unknown
  } = {}) {
    const { name, parent, logger = console.warn } = params
    this.name = name
    this.parent = parent
    this.logger = logger
    this.bindProvider($Injector).toValue(this)
  }

  /**
   * Creates new binder and joins it to the specified providers. If the provider
   * is already bound, then overriding occurs
   * @param providers providers which the binder should be joined to
   */
  bindProvider<
    ProviderT extends Array<Provider<unknown>>,
    ValueT extends UnionToIntersection<ProviderT extends Array<Provider<infer R>> ? R : never>
  >(...providers: ProviderT): Binder<ValueT> {
    const binder = new Binder<ValueT>(this)
    providers.forEach((provider) => this.binders.set(provider, binder))
    return binder
  }

  /**
   * Resolves all providers to their values and assigns them to the specified instance
   * @param instance
   * @param providers
   */
  injectValues<T extends object, K extends keyof T>(
    instance: T,
    providers: Record<K, Provider<T[K]>>
  ): void {
    Object.entries(providers)
      .filter(([, value]) => isProvider(value))
      .forEach(([name, provider]: [string, Provider<T[K]>]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        instance[name] = this.getValue(provider)
      })
  }

  /**
   * Activates this injector and creates new instance of the type with the provided arguments
   * @param type
   * @param args
   */
  createInstance<
    ClassT extends new (...args: unknown[]) => unknown,
    CtorParamsT extends ConstructorParameters<ClassT>,
    InstT extends InstanceType<ClassT>
  >(type: ClassT, ...args: CtorParamsT): InstT {
    // eslint-disable-next-line new-cap
    return this.activateAndCall(() => new type(...args)) as InstT
  }

  /**
   * Activates this injector and calls the function with provided arguments
   * @param func function which should be called
   * @param args args which should be passed to the called function
   */
  callFunc<
    FuncT extends (...args: unknown[]) => unknown,
    ParamsT extends Parameters<FuncT>,
    ReturnT extends ReturnType<FuncT>
  >(func: FuncT, ...args: ParamsT): ReturnT {
    return this.activateAndCall<ReturnT>(() => func(...args) as ReturnT)
  }

  /**
   * Returns bound to the specified provider value. If the value is not found
   * undefined is returned
   * @param provider
   */
  getValue<
    ProviderT extends Provider<unknown>,
    ValueT extends ProviderT extends Provider<infer R> ? R : never
  >(provider: ProviderT): ValueT | undefined {
    const binder = this.getBinder(provider)
    if (binder == null) {
      return undefined
    }
    this.checkCircularDependency(provider)
    this.resolvingProviders.push(provider)
    const value = this.activateAndCall(() => binder.getValue() as ValueT)
    this.resolvingProviders.pop()
    return value
  }

  /**
   * Finds binder for the specified provider recursively up to the root injector
   * @param provider
   * @private
   */
  private getBinder<ValueT>(provider: Provider<ValueT>): Binder<ValueT> | undefined {
    const binder = this.binders.get(provider) as Binder<ValueT> | undefined
    if (binder == null && this.parent != null) {
      return this.parent.getBinder(provider)
    }
    return binder
  }

  /**
   * Checks is there circular dependency and throws error if so
   * @param provider
   * @private
   */
  private checkCircularDependency (provider: Provider<unknown>): void {
    const i = this.resolvingProviders.indexOf(provider)
    if (i === -1) {
      return
    }
    const providers = [...this.resolvingProviders.slice(i), provider]
      .map(getProviderName)
      .map((name) => name ?? '?')

    throw new InjectingError(
      `Circular dependency detected: ${providers.join('->')}`
    )
  }

  /**
   * Temporary activates this injector calls provided function and returns its value
   * @param func
   * @private
   */
  private activateAndCall<T>(func: () => T): T {
    InjectorsStack.push(this)
    const value = func()
    InjectorsStack.pop()
    return value
  }
}
