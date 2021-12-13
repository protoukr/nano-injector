# Nano-injector

Miniature dependency injection library for TypeScript and JavaScript.

# Motivation

There is a myriad of dependency injection libraries in typescript ecosystem. Most of them are built around decorators.
Decorators are an obvious solution for such kinds of tasks. But in terms of dependency injection, they have its
drawbacks - they are not type safe, which means that theoretically, it is possible to bind any value to the required type,
and they don't work well with interfaces and primitives, therefore some workaround solutions are required to overcome
this limitation.
Typically, injecting of an interface, using these libraries, looks like as follows:
```typescript
// binding value
injector.bind('IStorage').toValue(new DefStorage())

// injecting it
@Inject('IStorage')
private storage: IStorage
```
where string IStorage should be passed to Inject decorator in order to let the injector know which value should be injected
to the required property. Since it is just a string, any string can be passed, therefore any type can be injected,
and the compiler won't warn you about that. Also, there is type duplication, therefore the whole usage looks a bit ugly.

**Nano-injector** is addressing these issues, by doing dependency injection in a little bit different way - instead of using
decorators, it uses plain functions as dependencies providers. By doing so, the same workflow, using Nano-injector,
looks as follows:

```typescript
// defining provider
const $IStorage = createProvider<IStorage>()

// binding it to the value
injector.bindProvider($IStorage).toValue(new DefStorage())

// injecting it
private storage = $IStorage()
```
Here _**$IStorage**_ is the provider, which basically is a plain function, and which should be bound to desired value through
injector. Type of storage property compiler infers automatically, which reduces unneeded code duplication. Also, you can bind only
value of the type specified during provider creation, if not to do so, the compiler will warn you about that.

Also, unlike other libraries, Nano-injector is very small, with a very concise API.
More usage details you can find below, and in the example directory.

# Features

- Very simple
- Ultra lightweight
- Zero dependencies
- No decorators
- Type safe
- Injectable interfaces and primitives

# Installation
```bash
npm i nano-injector
```
# Usage
Importing dependencies:
```typescript
import { Injector, createProvider } from 'nano-injector'
```
Defining types and providers:
```typescript
// to distinguish providers from any other entities $ sign is used
const $Clock = createProvider<(cb: () => void, time: number) => number>()
const $ClockRate = createProvider<number>()

const $CPU = createProvider<CPU>()
interface CPU {
  readonly model: string
  readonly numCores: number
  readonly frequency: number
}

const $GPU = createProvider<GPU>()
interface GPU {
  readonly model: string
  readonly numRayTracingCores: number
  readonly memorySize: number
}

const $RAM = createProvider<RAM>()
interface RAM {
  readonly capacity: number
}

const $Motherboard = createProvider<Motherboard>()
interface Motherboard {
  readonly cpu: CPU
  readonly gpu: GPU
  readonly ram: RAM
}

class GeForce911 implements GPU {
  model = 'GeForce911'
  numRayTracingCores = 100
  memorySize = 2048
}

class DefMotherboard implements Motherboard {
  constructor(
    readonly model: string,
    public cpu = $CPU(),
    public gpu = $GPU(),
    public ram = $RAM()
  ) {}
}

class PC {
  constructor(private name: string, private motherboard = $Motherboard()) {}
}
```
Defining injector through which injection occurs:
```typescript
const injector = new Injector()
```
Binding providers:
```typescript
// binding $CPU provider to exact value
injector.bindProvider($CPU).toValue({ numCores: 4, model: 't7', frequency: 2000 })

// binding $GPU provider to class which conforms to provider's returning type
// calling asSingleton specifies that value should be created only once
injector.bindProvider($GPU).toConstructor(GeForce911).asSingleton()

// binding $RAM provider to the factory which creates value conforming to
// provider's returning type
injector.bindProvider($RAM).toFactory(() => ({
  capacity: Math.floor(Math.random() * 1024),
}))

injector
  .bindProvider($Motherboard)
  .toFactory(
    () =>
      // only one required parameter is passed, the rest are initialized
      // automatically through providers
      new DefMotherboard('Asus ABC-123')
  )
  .asSingleton()

// without ignoring compiler would tell you about wrong value's type
// @ts-expect-error
injector.bindProvider($ClockRate).toValue('asd')

injector.bindProvider($ClockRate).toValue(1000)

injector.bindProvider($Clock).toValue(setTimeout)
```
Creating instances with all dependencies injected:
```typescript
// the first parameter of PC constructor is required, so it is passed into the
// construction method
injector.createInstance(PC, 'My pc')
```
Directly getting the bound to the providers values:
```typescript
injector.getValue($CPU)
injector.getValue($GPU)
injector.getValue($RAM)

injector.getValue($Clock)(() => console.log('Tick!'), 1000)
```
Manually creating instance with all its dependencies:
```typescript
new DefMotherboard(
  'Asus xyz',
  { frequency: 123, model: 'Intel xyz', numCores: 1 },
  { model: '', memorySize: 0, numRayTracingCores: 1 },
  { capacity: 123 },
)
```
Calling function through injector:
```typescript
injector.callFunc(() => {
  // inside function all providers return bound to them values
  console.log('Inside function')
  console.log('CPU:', $CPU())
  console.log('GPU:', $GPU())
  console.log('RAM:', $RAM())
})
```
It's also possible to bind few providers to the same value. The bound value should conform to
intersection of all providers' types:
```typescript
injector.bindProvider($RAM, $CPU, $GPU).toValue({
  capacity: 10,
  frequency: 100,
  memorySize: 200,
  model: 'ATB-21',
  numCores: 2,
  numRayTracingCores: 60,
})
```
Creating composition of injectors:
```typescript
const childInjector = new Injector({ parent: injector })
```
Overriding $CPU binding of parent injector inside child injector:
```typescript
childInjector.bindProvider($CPU).toValue({ numCores: 1, model: 'z2', frequency: 999 })
```
Injecting value to the existing instance:
```typescript
const newMotherboard = new class {
  gpu: GPU
  cpu: CPU
}
injector.injectValues(newMotherboard, { cpu: $CPU, gpu: $GPU })
```
# [Docs](https://protoukr.github.io/nano-injector/)

# Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
