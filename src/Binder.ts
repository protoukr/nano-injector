import { Injector } from './Injector'

export class NoCreationMethodSpecifiedError extends Error {
  constructor () {
    super('No creation method specified')
  }
}

/**
 * Class through which is defined how to create value for this binder
 */
export class Binder<T> {
  private value: T | undefined
  private ctor: (new () => T) | undefined
  private factory: ((injector: Injector) => T) | undefined
  private isSingleton: boolean

  constructor (private readonly injector: Injector) {}

  /**
   * Creates the new value if needed through previously defined method, and returns it
   */
  getValue (): T {
    if (this.value !== undefined) {
      return this.value
    }
    if (this.isSingleton) {
      this.value = this.createValue()
      return this.value
    }
    return this.createValue()
  }

  /**
   * Directly defines value for this binder
   * @param value
   */
  toValue (value: T): Binder<T> {
    this.value = value
    this.factory = undefined
    this.ctor = undefined
    return this
  }

  /**
   * Defines constructor as a method for creating value. All previously defined methods
   * will be ignored
   * @param ctor
   */
  toConstructor (ctor: new () => T): Binder<T> {
    this.ctor = ctor
    this.factory = undefined
    this.value = undefined
    return this
  }

  /**
   * Defines factory as a method for creating value. All previously defined methods
   * will be ignored
   * @param factory
   */
  toFactory (factory: (injector?: Injector) => T): Binder<T> {
    this.factory = factory
    this.ctor = undefined
    this.value = undefined
    return this
  }

  /**
   * Defines whether value should be a singleton. If yes the value will be created only once
   * and the same instance will be returned forever
   * @param value
   */
  asSingleton (value = true): Binder<T> {
    this.isSingleton = value
    return this
  }

  /**
   * Creates value through previously defined method
   * @private
   */
  private createValue (): T {
    if (this.ctor != null) {
      // eslint-disable-next-line new-cap
      return new this.ctor()
    }
    if (this.factory != null) {
      return this.factory(this.injector)
    }
    throw new NoCreationMethodSpecifiedError()
  }
}
