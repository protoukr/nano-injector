import { Injector } from './Injector'
import { Provider } from './Provider'

/**
 * Private class for holding current active injector
 */
class _InjectorsStack {
  private readonly injectors: Injector[] = []
  private activeInjector: Injector | undefined

  get<
    ProviderT extends Provider<unknown>,
    ValueT extends ProviderT extends Provider<infer R> ? R : never
  >(provider: ProviderT): ValueT | undefined {
    return this.activeInjector?.getValue(provider)
  }

  push (injector: Injector): void {
    if (this.activeInjector != null) {
      this.injectors.push(this.activeInjector)
    }
    this.activeInjector = injector
  }

  pop (): void {
    this.activeInjector = this.injectors.pop()
  }
}

export const InjectorsStack = new _InjectorsStack()
