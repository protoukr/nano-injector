import { Binder } from '../src/Binder';
import { Injector } from '../src/Injector';

describe('Binder', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = new Injector();
  });

  describe('Transient Binding', () => {
    it('should return the bound value', () => {
      const binder = new Binder<number>(injector);

      binder.toValue(10);

      expect(binder.getValue()).toBe(10);
    });

    it('should create new instance for each call when bound to constructor', () => {
      const binder = new Binder<{ value: number }>(injector);
      class ValueType {
        value = 0;
      }

      binder.toConstructor(ValueType);

      expect(binder.getValue().value).toBe(0);
      expect(binder.getValue()).not.toBe(binder.getValue());
    });

    it('should create new instance for each call when bound to factory', () => {
      const binder = new Binder<{ value: number }>(new Injector());

      binder.toFactory(() => ({ value: 10 }));

      expect(binder.getValue().value).toBe(10);
      expect(binder.getValue()).not.toBe(binder.getValue());
    });
  });

  describe('Singleton Binding', () => {
    it('should share value when bound to constructor as singleton', () => {
      const binder = new Binder<{ value: number }>(injector);
      class ValueType {
        value = 10;
      }

      binder.toConstructor(ValueType).asSingleton();

      expect(binder.getValue().value).toBe(10);
      expect(binder.getValue()).toBe(binder.getValue());
    });

    it('should share value when bound to factory as singleton', () => {
      const binder = new Binder<{ value: number }>(new Injector());

      binder.toFactory(() => ({ value: 10 })).asSingleton();

      expect(binder.getValue().value).toBe(10);
      expect(binder.getValue()).toBe(binder.getValue());
    });
  });
});
