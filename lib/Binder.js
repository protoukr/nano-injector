"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Binder = void 0;
const InjectingError_1 = require("./InjectingError");
/**
 * Class through which is defined how to create value for this binder
 */
class Binder {
    constructor(injector) {
        this.injector = injector;
    }
    /**
     * Creates the new value if needed through previously defined method, and returns it
     */
    getValue() {
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
     * Directly defines value for this binder
     * @param value
     */
    toValue(value) {
        this.value = value;
        this.factory = undefined;
        this.ctor = undefined;
        return this;
    }
    /**
     * Defines constructor as a method for creating value. All previously defined methods
     * will be ignored
     * @param ctor
     */
    toConstructor(ctor) {
        this.ctor = ctor;
        this.factory = undefined;
        this.value = undefined;
        return this;
    }
    /**
     * Defines factory as a method for creating value. All previously defined methods
     * will be ignored
     * @param factory
     */
    toFactory(factory) {
        this.factory = factory;
        this.ctor = undefined;
        this.value = undefined;
        return this;
    }
    /**
     * Defines whether value should be a singleton. If yes the value will be created only once
     * and the same instance will be returned forever
     * @param value
     */
    asSingleton(value = true) {
        this.isSingleton = value;
        return this;
    }
    /**
     * Creates value through previously defined method
     * @private
     */
    createValue() {
        if (this.ctor != null) {
            // eslint-disable-next-line new-cap
            return new this.ctor();
        }
        if (this.factory != null) {
            return this.factory(this.injector);
        }
        throw new InjectingError_1.InjectingError('Creation method isn\'t specified');
    }
}
exports.Binder = Binder;
