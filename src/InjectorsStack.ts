import { Injector } from './Injector';

export class NoActiveInjectorError extends Error {
  constructor() {
    super('No active injector found');
  }
}

/**
 * Private class to manage the stack of active injectors.
 */
class _InjectorsStack {
  private readonly injectors: Injector[] = [];
  private _activeInjector?: Injector;

  get activeInjector(): Injector {
    if (this._activeInjector == null) {
      throw new NoActiveInjectorError();
    }
    return this._activeInjector;
  }

  push(injector: Injector): void {
    if (this._activeInjector != null) {
      this.injectors.push(this._activeInjector);
    }
    this._activeInjector = injector;
  }

  pop(): void {
    this._activeInjector = this.injectors.pop();
  }
}

export const InjectorsStack = new _InjectorsStack();
