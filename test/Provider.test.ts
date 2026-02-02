import { assert } from 'chai';
import { describe, it } from 'mocha';
import { createProvider, getProviderID, getProviderName, isProvider } from '../src/Provider';

describe('Provider', () => {
  it('check provider determination', () => {
    assert.isFalse(isProvider(0));
    assert.isFalse(isProvider(() => undefined));
    assert.isTrue(isProvider(createProvider()));
  });

  it('check id getting', () => {
    const id = getProviderID(createProvider());

    assert.isNumber(id);
  });

  it('check name getting', () => {
    const name = getProviderName(createProvider('provider'));

    assert.strictEqual(name, 'provider');
  });

  it('check exception throwing', () => {
    const provider = createProvider();

    assert.throws(() => provider());
  });

  it('check default value returning', () => {
    const provider = createProvider<object>();

    const val = provider(null);

    assert.isNull(val);
  });
});
