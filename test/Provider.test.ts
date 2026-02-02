import { Injector } from '../src/Injector';
import { createProvider, getProviderID, getProviderName, isProvider } from '../src/Provider';

describe('Provider', () => {
  it('should correctly identify providers', () => {
    expect(isProvider(0)).toBe(false);
    expect(isProvider(() => undefined)).toBe(false);
    expect(isProvider(createProvider())).toBe(true);
  });

  it('should have a unique ID', () => {
    const id = getProviderID(createProvider());
    expect(typeof id).toBe('number');
  });

  it('should generate different IDs for different providers', () => {
    const p1 = createProvider();
    const p2 = createProvider();
    expect(getProviderID(p1)).not.toBe(getProviderID(p2));
  });

  it('should store and retrieve the provider name', () => {
    const name = getProviderName(createProvider('provider'));
    expect(name).toBe('provider');
  });

  it('should throw when called without binding (direct call)', () => {
    const provider = createProvider();
    expect(() => provider()).toThrow();
  });

  it('should return default value when passed one', () => {
    const injector = new Injector();
    const provider = createProvider<object>();

    // We must call this inside an injection context
    const val = injector.callFunc(() => provider(null));

    expect(val).toBeNull();
  });
});
