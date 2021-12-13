import { Injector } from './Injector';
import { Provider } from './Provider';
/**
 * Private class for holding current active injector
 */
declare class _InjectorsStack {
    private readonly injectors;
    private activeInjector;
    get<ProviderT extends Provider<unknown>, ValueT extends ProviderT extends Provider<infer R> ? R : never>(provider: ProviderT): ValueT | undefined;
    push(injector: Injector): void;
    pop(): void;
}
export declare const InjectorsStack: _InjectorsStack;
export {};
