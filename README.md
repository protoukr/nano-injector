# Nano-injector

Miniature dependency injection library for TypeScript and JavaScript.

**Nano-injector** is a lightweight, type-safe dependency injection library that doesn't rely on decorators. It uses plain functions as dependency providers, making it easy to work with interfaces, primitives, and even functions.

## Features

- **Simple & Minimal:** Very concise API.
- **Ultra Lightweight:** Zero dependencies, tiny footprint (~1.5kb gzipped).
- **Type Safe:** Leverages TypeScript's type system for compile-time safety.
- **No Decorators:** Works with plain classes and functions without `reflect-metadata`.
- **Flexible:** Supports interfaces, primitives, and complex types.

## Installation

```bash
npm i nano-injector
```

## Quick Start

```typescript
import { Injector, createProvider } from 'nano-injector';

// 1. Define a provider
const $Logger = createProvider<{ log: (msg: string) => void }>();

// 2. Use the provider (just call it like a function!)
class MyService {
  constructor(private logger = $Logger()) {}

  doSomething() {
    this.logger.log('Hello from MyService!');
  }
}

// 3. Bind the provider in an injector
const injector = new Injector();
injector.bindProvider($Logger).toValue({ log: console.log });

// 4. Create an instance with dependencies automatically injected
const service = injector.createInstance(MyService);
service.doSomething(); // Logs: Hello from MyService!
```

## Core Concepts

### Providers

Providers are the heart of Nano-injector. They act as "tokens" for your dependencies. By convention, they are prefixed with `$` to distinguish them from other variables.

```typescript
const $Config = createProvider<{ apiUrl: string }>();
const $DbPort = createProvider<number>();
```

### The Injector

The `Injector` manages bindings and resolves dependencies.

```typescript
const injector = new Injector();
```

## Binding Dependencies

You can bind providers to values, constructors, or factories.

### `.toValue(value)`
Binds a provider to a specific value.

```typescript
injector.bindProvider($DbPort).toValue(5432);
```

### `.toConstructor(Class)`
Binds a provider to a class. Nano-injector will instantiate the class when the dependency is requested.

```typescript
class FileLogger {
  log(msg: string) { /* ... */ }
}
injector.bindProvider($Logger).toConstructor(FileLogger);
```

### `.toFactory(factory)`
Binds a provider to a factory function. The factory receives the `injector` as an argument.

```typescript
injector.bindProvider($Logger).toFactory((injector) => {
  const isDev = injector.tryGetValue($IsDev, false);
  return isDev ? new ConsoleLogger() : new SentryLogger();
});
```

### Singletons
By default, `toConstructor` and `toFactory` create a new instance every time the dependency is injected. Use `.asSingleton()` to ensure the same instance is reused.

```typescript
injector.bindProvider($AuthService).toConstructor(AuthService).asSingleton();
```

## Injecting Dependencies

There are several ways to resolve dependencies using an injector.

### 1. Within Classes (`createInstance`)
Call the provider function as a default parameter in the constructor. This keeps your classes testable as you can still pass dependencies manually.

```typescript
class MyController {
  constructor(private service = $MyService()) {}
}

const controller = injector.createInstance(MyController);
```

### 2. Within Functions (`callFunc`)
Nano-injector can call a function and resolve any providers invoked within it.

```typescript
function startApp() {
  const logger = $Logger();
  logger.log('App starting...');
}

injector.callFunc(startApp);
```

### 3. Manual Resolution (`getValue`)
Explicitly get the value bound to a provider.

```typescript
const logger = injector.getValue($Logger);
```

### 4. Injecting into Existing Objects (`injectValues`)
Useful for objects not created by the injector (e.g., in some frameworks).

```typescript
const obj = { logger: null };
injector.injectValues(obj, { logger: $Logger });
```

## Advanced Usage

### Parent Injectors
Create a hierarchy of injectors. If a binding is not found in the child injector, it will look in the parent.

```typescript
const parent = new Injector();
parent.bindProvider($Theme).toValue('dark');

const child = new Injector({ parent });
child.getValue($Theme); // Returns 'dark'
```

### Multiple Bindings
Bind multiple providers to the same value.

```typescript
injector.bindProvider($Logger, $ErrorHandler).toValue(myCombinedTool);
```

### The $Injector Provider
The injector itself is available as a provider, allowing you to inject it into your services for dynamic resolution.

```typescript
import { $Injector } from 'nano-injector';

class DynamicService {
  constructor(private injector = $Injector()) {}

  getSomething(type: string) {
    return this.injector.getValue(type === 'A' ? $ProviderA : $ProviderB);
  }
}
```

### Circular Dependency Detection
Nano-injector automatically detects circular dependencies and throws a `CircularDependencyError` with a helpful path description.

## Why Nano-injector?

Most DI libraries use decorators, which:
1. **Are not fully type-safe:** Often requiring manual type annotations that can get out of sync.
2. **Don't work well with interfaces:** Since interfaces don't exist at runtime, you usually need to use strings or symbols as tokens.
3. **Require boilerplate:** Often needing `reflect-metadata` and specific `tsconfig` settings like `emitDecoratorMetadata`.

**Nano-injector** addresses these issues by using standard TypeScript functions. When you call `$Logger()`, TypeScript knows exactly what type is expected, and the library ensures that only a matching type can be bound.

## [Docs](https://protoukr.github.io/nano-injector/)

## License
[MIT](LICENSE)
