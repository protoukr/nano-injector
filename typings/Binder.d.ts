import { Injector } from './Injector';
export declare class NoCreationMethodSpecifiedError extends Error {
    constructor();
}
/**
 * Class through which is defined how to create value for this binder
 */
export declare class Binder<T> {
    private readonly injector;
    private value;
    private ctor;
    private factory;
    private isSingleton;
    constructor(injector: Injector);
    /**
     * Creates the new value if needed through previously defined method, and returns it
     */
    getValue(): T;
    /**
     * Directly defines value for this binder
     * @param value
     */
    toValue(value: T): Binder<T>;
    /**
     * Defines constructor as a method for creating value. All previously defined methods
     * will be ignored
     * @param ctor
     */
    toConstructor(ctor: new () => T): Binder<T>;
    /**
     * Defines factory as a method for creating value. All previously defined methods
     * will be ignored
     * @param factory
     */
    toFactory(factory: (injector: Injector) => T): Binder<T>;
    /**
     * Defines whether value should be a singleton. If yes the value will be created only once
     * and the same instance will be returned forever
     * @param value
     */
    asSingleton(value?: boolean): Binder<T>;
    /**
     * Creates value through previously defined method
     * @private
     */
    private createValue;
}
