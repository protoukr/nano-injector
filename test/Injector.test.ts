import { assert } from 'chai'
import { describe, it } from 'mocha'
import { NoBinderError, CircularDependencyError, Injector } from '../src/Injector'
import { createProvider } from '../src/Provider'

describe('Injector', () => {
  it('check bound value getting', () => {
    const provider = createProvider<number>()
    const injector = new Injector()
    injector.bindProvider(provider).toValue(0)

    const value = injector.getValue(provider)

    assert.equal(value, 0)
  })

  it('check unbound value getting', () => {
    const provider = createProvider<number>()
    const injector = new Injector()

    assert.throws(() => injector.getValue(provider), NoBinderError)
  })

  it('check unbound value safe getting', () => {
    const provider = createProvider<number>()
    const injector = new Injector()

    const value = injector.tryGetValue(provider, 0)

    assert.strictEqual(value, 0)
  })

  it('check value getting through composition', () => {
    const provider = createProvider<number>()
    const parentInjector = new Injector()
    const childInjector1 = new Injector({ parent: parentInjector })
    const childInjector2 = new Injector({ parent: parentInjector })
    parentInjector
      .bindProvider(provider)
      .toFactory(() => Math.random())
      .asSingleton()

    const value1 = childInjector1.getValue(provider)
    const value2 = childInjector2.getValue(provider)

    assert.strictEqual(value1, value2)
  })

  it('check value overriding in child injector', () => {
    const provider = createProvider<number>()
    const parentInjector = new Injector()
    const childInjector = new Injector({ parent: parentInjector })

    parentInjector.bindProvider(provider).toValue(10)
    childInjector.bindProvider(provider).toValue(5)

    const value = childInjector.getValue(provider)

    assert.strictEqual(value, 5)
  })

  it('check resolving providers inside function', () => {
    const p = createProvider<number>()
    const injector = new Injector()
    injector.bindProvider(p).toValue(10)

    const value = injector.callFunc((value = p()) => value)

    assert.strictEqual(value, 10)
  })

  it('check circular dependencies determination', () => {
    const p1 = createProvider<number>('1')
    const p2 = createProvider<number>('2')
    const p3 = createProvider<number>('3')
    const injector = new Injector()
    injector.bindProvider(p1).toFactory(() => p2())
    injector.bindProvider(p2).toFactory(() => p3())
    injector.bindProvider(p3).toFactory(() => p1())

    assert.throws(() => injector.getValue(p1), CircularDependencyError)
  })

  it('check instance creation', () => {
    const provider = createProvider<number>()
    class SomeClass {
      constructor (public value = provider()) {}
    }
    const injector = new Injector()
    injector.bindProvider(provider).toValue(10)

    // TODO: check in future typescript versions
    // @ts-expect-error
    const inst = injector.createInstance(SomeClass)

    assert.instanceOf(inst, SomeClass)
    // TODO: check in future typescript versions
    // @ts-expect-error
    assert.strictEqual(inst.value, 10)
  })

  it('check binding few providers to one value', () => {
    const p1 = createProvider<{ val1: number }>()
    const p2 = createProvider<{ val2: number }>()
    const injector = new Injector()
    injector.bindProvider(p1, p2).toValue({ val1: 1, val2: 2 })

    const v1 = injector.getValue(p1)
    const v2 = injector.getValue(p2)

    // TODO: check in future typescript versions
    // @ts-expect-error
    assert.isTrue(v1 === v2)
  })

  it('check injecting values to existing instance', () => {
    const p1 = createProvider<number>('1')
    const p2 = createProvider<number>('2')
    const p3 = createProvider<number>('3')
    const injector = new Injector()
    injector.bindProvider(p1).toValue(1)
    injector.bindProvider(p2).toValue(2)
    injector.bindProvider(p3).toValue(3)
    const obj = {
      v1: 0,
      v2: 0,
      v3: 0
    }

    injector.injectValues(obj, { v1: p1, v2: p2, v3: p3 })

    assert.deepEqual(obj, { v1: 1, v2: 2, v3: 3 })
  })
})
