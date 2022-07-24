import { Injector } from './Injector';
export declare class NoActiveInjectorError extends Error {
    constructor();
}
/**
 * Private class for holding current active injector
 */
declare class _InjectorsStack {
    private readonly injectors;
    private _activeInjector?;
    get activeInjector(): Injector;
    push(injector: Injector): void;
    pop(): void;
}
export declare const InjectorsStack: _InjectorsStack;
export {};
