"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectorsStack = exports.NoActiveInjectorError = void 0;
class NoActiveInjectorError extends Error {
    constructor() {
        super('No active injector found');
    }
}
exports.NoActiveInjectorError = NoActiveInjectorError;
/**
 * Private class for holding current active injector
 */
class _InjectorsStack {
    constructor() {
        this.injectors = [];
    }
    get activeInjector() {
        if (this._activeInjector == null) {
            throw new NoActiveInjectorError();
        }
        return this._activeInjector;
    }
    push(injector) {
        if (this._activeInjector != null) {
            this.injectors.push(this._activeInjector);
        }
        this._activeInjector = injector;
    }
    pop() {
        this._activeInjector = this.injectors.pop();
    }
}
exports.InjectorsStack = new _InjectorsStack();
