"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectorsStack = void 0;
/**
 * Private class for holding current active injector
 */
class _InjectorsStack {
    constructor() {
        this.injectors = [];
    }
    get(provider) {
        var _a;
        return (_a = this.activeInjector) === null || _a === void 0 ? void 0 : _a.getValue(provider);
    }
    push(injector) {
        if (this.activeInjector != null) {
            this.injectors.push(this.activeInjector);
        }
        this.activeInjector = injector;
    }
    pop() {
        this.activeInjector = this.injectors.pop();
    }
}
exports.InjectorsStack = new _InjectorsStack();
