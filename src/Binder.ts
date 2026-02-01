import { Injector } from './Injector';

export class NoCreationMethodSpecifiedError extends Error {
  constructor() {
    super('No creation method specified');
  }
}

/**
 * A class that defines how to create a value for this binder.
 */
export class Binder<T> {
  private value: T | undefined;
  private ctor: (new () => T) | undefined;
  private factory: ((injector: Injector) => T) | undefined;
  private isSingleton: boolean = false;

  constructor(private readonly injector: Injector) {}

  /**
   * Creates a new value (if needed) using the defined creation method, and returns it.
   */
  getValue(): T {
    if (this.value !== undefined) {
      return this.value;
    }
    if (this.isSingleton) {
      this.value = this.createValue();
      return this.value;
    }
    return this.createValue();
  }

  /**
   * Sets a specific value for this binder.
   * @param value
   */
  toValue(value: T): Binder<T> {
    this.value = value;
    this.factory = undefined;
    this.ctor = undefined;
    return this;
  }

  /**
   * Use a class constructor to create the value. Previous creation methods are cleared.
   * @param ctor
   */
  toConstructor(ctor: new () => T): Binder<T> {
    this.ctor = ctor;
    this.factory = undefined;
    this.value = undefined;
    return this;
  }

  /**
   * Use a factory function to create the value. Previous creation methods are cleared.
   * @param factory
   */
  toFactory(factory: (injector: Injector) => T): Binder<T> {
    this.factory = factory;
    this.ctor = undefined;
    this.value = undefined;
    return this;
  }

  /**
   * Configures whether the value should be a singleton. If true, the value is created once and reused for all subsequent requests.
   * @param value
   */
  asSingleton(value = true): Binder<T> {
    this.isSingleton = value;
    return this;
  }

  /**
   * Creates the value using the configured creation method.
   * @private
   */
  private createValue(): T {
    if (this.ctor != null) {
      return new this.ctor();
    }
    if (this.factory != null) {
      return this.factory(this.injector);
    }
    throw new NoCreationMethodSpecifiedError();
  }
}
