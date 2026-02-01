# Nano-injector

**Miniature, type-safe dependency injection library for TypeScript and JavaScript.** Zero dependencies. No decorators.
~1.4KB gzipped.

## Features

- **Type Safe**: leveraged by TypeScript's type inference.
- **Zero Dependencies**: fast cold starts and small footprint.
- **No Decorators**: works with plain functions and classes.
- **Flexible**: supports value, class, and factory bindings.
- **Hierarchical**: supports parent-child injector relationships.
- **Circular Dependency Detection**: automatically detects and warns about cycles.

## Motivation

Most dependency injection libraries in the TypeScript ecosystem rely heavily on decorators (e.g., `@Inject`). While
familiar, this approach has drawbacks:

1.  **Type Safety**: Decorators often use string tokens (e.g., `@Inject('IStorage')`), decoupling the type from the
    injection token.
2.  **Complexity**: They don't work natively with interfaces or primitives without workarounds.
3.  **Verbosity**: requires duplicating type definitions and injection tokens.

**Nano-injector** takes a different approach. It uses **Providers**—plain functions that act as both unique identity
tokens and accessors. This allows TypeScript to infer types automatically, reducing boilerplate and runtime errors.

## Installation

```bash
npm install nano-injector
```

## Core Concepts

- **Provider**: A typed function created via `createProvider<T>()`. It acts as a unique key for the dependency and a way
  to access it.
- **Injector**: The container that manages bindings and resolves dependencies.
- **Binder**: An intermediate object returned when you bind a provider, used to configure _how_ it resolves (to a value,
  a class, or a factory).

## Usage

### 1. Define Interfaces and Providers

Define your interfaces (or types) and create a corresponding provider for each. By convention, providers often start
with `$` to distinguish them from values.

```typescript
import { createProvider } from 'nano-injector';

// Define interfaces
interface Logger {
  log(msg: string): void;
}

interface Config {
  apiKey: string;
  port: number;
}

// Create providers
export const $Logger = createProvider<Logger>();
export const $Config = createProvider<Config>();
```

### 2. Create the Injector

```typescript
import { Injector } from 'nano-injector';

const injector = new Injector();
```

### 3. Bind Dependencies

You can bind providers to specific values, classes, or factories.

#### Value Binding

Useful for configuration, primitives, or existing instances.

```typescript
injector.bindProvider($Config).toValue({
  apiKey: 'secret-key',
  port: 8080,
});
```

#### Class Binding

Useful for services. You can also make them singletons.

```typescript
class ConsoleLogger implements Logger {
  log(msg: string) {
    console.log(msg);
  }
}

// Bind to a class (created on demand)
injector.bindProvider($Logger).toConstructor(ConsoleLogger);

// Bind as a singleton (created once and reused)
injector.bindProvider($Logger).toConstructor(ConsoleLogger).asSingleton();
```

#### Factory Binding

Useful when creation logic is dynamic or depends on other factors.

```typescript
injector.bindProvider($Logger).toFactory((injector) => {
  // logic to determine which logger to return
  return new ConsoleLogger();
});
```

### 4. Injection

Nano-injector leverages TypeScript's default parameter values for injection. This makes your code cleaner and testable
(you can simply pass mocks as arguments in tests).

#### Constructor Injection

Used in classes. Simply assign the provider call as a default value.

```typescript
class UserService {
  // Dependencies are automatically resolved when `new` is called by the injector
  constructor(
    private logger = $Logger(),
    private config = $Config(),
  ) {}

  doWork() {
    this.logger.log(`Starting work on port ${this.config.port}`);
  }
}
```

To instantiate this class with dependencies resolved:

```typescript
// The injector resolves arguments automatically
const userService = injector.createInstance(UserService);
userService.doWork();
```

#### Mixing Manual and Injected Parameters

You can mix manual arguments with injected ones. Since injection relies on default parameter values, manual arguments
usually come first.

```typescript
class User {
  constructor(
    public name: string, // Manual argument
    private logger = $Logger(), // Injected
  ) {}
}

// Pass manual arguments to createInstance
const user = injector.createInstance(User, 'Alice');
```

#### Function Injection

You can also use providers inside functions called by the injector.

```typescript
function startServer() {
  const config = $Config(); // Resolve dependency
  console.log(`Server started on ${config.port}`);
}

// Execute the function within the injection context
injector.callFunc(startServer);
```

#### Direct Retrieval

If you need to get a value imperatively:

```typescript
const config = injector.getValue($Config);
```

## Advanced Features

### Multi-Binding (Intersection Types)

You can bind multiple providers to a single value that implements all of them.

```typescript
interface Writer {
  write(data: string): void;
}
interface Reader {
  read(): string;
}

const $Writer = createProvider<Writer>();
const $Reader = createProvider<Reader>();

class FileSystem implements Writer, Reader {
  write(data: string) {
    /*...*/
  }
  read() {
    return '';
  }
}

// Bind both providers to the same singleton instance
injector.bindProvider($Writer, $Reader).toConstructor(FileSystem).asSingleton();
```

### Hierarchical Injectors

Injectors can have parents. If a provider isn't found in the current injector, it looks up the tree.

```typescript
const parent = new Injector();
parent.bindProvider($Config).toValue({ apiKey: 'global', port: 80 });

const child = new Injector({ parent });

// Child resolves $Config from parent
const config = child.getValue($Config);
```

### Circular Dependencies

The library automatically detects circular dependencies during resolution and throws a specific error to help you debug
the structure of your application.

## License

MIT
