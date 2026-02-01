import { assert } from 'chai';
import { describe, it } from 'mocha';
import { Injector } from '../src/Injector';
import { createProvider, getProviderID, getProviderName, isProvider } from '../src/Provider';

describe('Provider', () => {
  it('should correctly identify providers', () => {
    assert.isFalse(isProvider(0));
    assert.isFalse(isProvider(() => undefined));
    assert.isTrue(isProvider(createProvider()));
  });

  it('should have a unique ID', () => {
    const id = getProviderID(createProvider());
    assert.isNumber(id);
  });

  it('should generate different IDs for different providers', () => {
    const p1 = createProvider();
    const p2 = createProvider();
    assert.notEqual(getProviderID(p1), getProviderID(p2));
  });

  it('should store and retrieve the provider name', () => {
    const name = getProviderName(createProvider('provider'));
    assert.strictEqual(name, 'provider');
  });

  it('should throw when called without binding (direct call)', () => {
    const provider = createProvider();
    assert.throws(() => provider());
  });

  it('should return default value when passed one', () => {
    const injector = new Injector();
    const provider = createProvider<object>();

    // We must call this inside an injection context
    const val = injector.callFunc(() => provider(null));

    assert.isNull(val);
  });
});
