import { assert } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { Binder } from '../src/Binder';
import { Injector } from '../src/Injector';

describe('Binder', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = new Injector();
  });

  describe('not singleton', () => {
    it('check binding to value', () => {
      const binder = new Binder<number>(injector);

      binder.toValue(10);

      assert.equal(binder.getValue(), 10);
    });

    it('check binding to constructor ', () => {
      const binder = new Binder<{ value: number }>(injector);
      class ValueType {
        value = 0;
      }

      binder.toConstructor(ValueType);

      assert.equal(binder.getValue().value, 0);
      assert.notStrictEqual(binder.getValue(), binder.getValue());
    });

    it('check binding to factory', () => {
      const binder = new Binder<{ value: number }>(new Injector());

      binder.toFactory(() => ({ value: 10 }));

      assert.equal(binder.getValue().value, 10);
      assert.notStrictEqual(binder.getValue(), binder.getValue());
    });
  });

  describe('singleton', () => {
    it('check binding to constructor', () => {
      const binder = new Binder<{ value: number }>(injector);
      class ValueType {
        value = 10;
      }

      binder.toConstructor(ValueType).asSingleton();

      assert.equal(binder.getValue().value, 10);
      assert.strictEqual(binder.getValue(), binder.getValue());
    });

    it('check binding to factory', () => {
      const binder = new Binder<{ value: number }>(new Injector());

      binder.toFactory(() => ({ value: 10 })).asSingleton();

      assert.equal(binder.getValue().value, 10);
      assert.strictEqual(binder.getValue(), binder.getValue());
    });
  });
});
