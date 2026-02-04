import { NoBinderError, CircularDependencyError, Injector } from '../src/Injector';
import { createProvider } from '../src/Provider';

describe('Injector', () => {
  it('should resolve the bound value', () => {
    const provider = createProvider<number>();
    const injector = new Injector();
    injector.bindProvider(provider).toValue(0);

    const value = injector.getValue(provider);

    expect(value).toBe(0);
  });

  it('should throw NoBinderError when value is not bound', () => {
    const provider = createProvider<number>();
    const injector = new Injector();

    expect(() => injector.getValue(provider)).toThrow(NoBinderError);
  });

  it('should return default value when provider is not bound', () => {
    const provider = createProvider<number>();
    const injector = new Injector();

    const value = injector.tryGetValue(provider, 100);

    expect(value).toBe(100);
  });

  it('should return bound value instead of default value if bound', () => {
    const provider = createProvider<number>();
    const injector = new Injector();
    injector.bindProvider(provider).toValue(50);

    const value = injector.tryGetValue(provider, 100);

    expect(value).toBe(50);
  });

  it('should resolve value from parent injector', () => {
    const provider = createProvider<number>();
    const parentInjector = new Injector();
    const childInjector = new Injector({ parent: parentInjector });

    parentInjector.bindProvider(provider).toValue(42);

    const value = childInjector.getValue(provider);

    expect(value).toBe(42);
  });

  it('should share singleton instance from parent injector', () => {
    const provider = createProvider<number>();
    const parentInjector = new Injector();
    const childInjector1 = new Injector({ parent: parentInjector });
    const childInjector2 = new Injector({ parent: parentInjector });

    parentInjector
      .bindProvider(provider)
      .toFactory(() => Math.random())
      .asSingleton();

    const value1 = childInjector1.getValue(provider);
    const value2 = childInjector2.getValue(provider);

    expect(value1).toBe(value2);
  });

  it('should prioritize child injector bindings over parent', () => {
    const provider = createProvider<number>();
    const parentInjector = new Injector();
    const childInjector = new Injector({ parent: parentInjector });

    parentInjector.bindProvider(provider).toValue(10);
    childInjector.bindProvider(provider).toValue(5);

    const value = childInjector.getValue(provider);

    expect(value).toBe(5);
  });

  it('should resolve dependencies inside a function call', () => {
    const p = createProvider<number>();
    const injector = new Injector();
    injector.bindProvider(p).toValue(10);

    const value = injector.callFunc((value = p()) => value);

    expect(value).toBe(10);
  });

  it('should detect circular dependencies', () => {
    const p1 = createProvider<number>('1');
    const p2 = createProvider<number>('2');
    const p3 = createProvider<number>('3');
    const injector = new Injector();

    // p1 -> p2 -> p3 -> p1
    injector.bindProvider(p1).toFactory(() => p2());
    injector.bindProvider(p2).toFactory(() => p3());
    injector.bindProvider(p3).toFactory(() => p1());

    expect(() => injector.getValue(p1)).toThrow(CircularDependencyError);
  });

  it('should create an instance with resolved dependencies', () => {
    const provider = createProvider<number>();
    class SomeClass {
      constructor(public value = provider()) {}
    }
    const injector = new Injector();
    injector.bindProvider(provider).toValue(10);

    const inst = injector.createInstance(SomeClass);

    expect(inst).toBeInstanceOf(SomeClass);
    expect(inst.value).toBe(10);
  });

  it('should pass explicit arguments to constructor during instance creation', () => {
    const provider = createProvider<number>();
    class SomeClass {
      constructor(
        public name: string,
        public value = provider(),
      ) {}
    }
    const injector = new Injector();
    injector.bindProvider(provider).toValue(99);

    const inst = injector.createInstance(SomeClass, 'test');

    expect(inst).toBeInstanceOf(SomeClass);
    expect(inst.name).toBe('test');
    expect(inst.value).toBe(99);
  });

  it('should bind multiple providers to the same value', () => {
    const p1 = createProvider<{ val1: number }>();
    const p2 = createProvider<{ val2: number }>();
    const injector = new Injector();
    const sharedValue = { val1: 1, val2: 2 };

    injector.bindProvider(p1, p2).toValue(sharedValue);

    const v1 = injector.getValue(p1);
    const v2 = injector.getValue(p2);

    expect(v1).toBe(sharedValue);
    expect(v2).toBe(sharedValue);
  });

  it('should inject specific values into an object', () => {
    const p1 = createProvider<number>('1');
    const p2 = createProvider<number>('2');
    const p3 = createProvider<number>('3');
    const injector = new Injector();
    injector.bindProvider(p1).toValue(1);
    injector.bindProvider(p2).toValue(2);
    injector.bindProvider(p3).toValue(3);

    const obj = { v1: 0, v2: 0, v3: 0 };

    injector.injectValues(obj, { v1: p1, v2: p2, v3: p3 });

    expect(obj).toEqual({ v1: 1, v2: 2, v3: 3 });
  });

  it('should not throw CircularDependencyError if a previous resolution failed', () => {
    const provider = createProvider<number>();
    const injector = new Injector();

    let shouldThrow = true;
    injector.bindProvider(provider).toFactory(() => {
      if (shouldThrow) {
        throw new Error('Resolution failed');
      }
      return 42;
    });

    // First attempt fails
    expect(() => injector.getValue(provider)).toThrow('Resolution failed');

    // Second attempt succeeds (or fails with the same error, but crucially NOT CircularDependencyError)
    shouldThrow = false;
    expect(injector.getValue(provider)).toBe(42);
  });
});
