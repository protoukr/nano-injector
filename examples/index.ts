import { Injector, createProvider } from '../src';

// ==========================================
// 1. Define Interfaces and Providers
// ==========================================

interface Logger {
  log: (msg: string) => void;
}

interface Config {
  appName: string;
  port: number;
}

// Create providers (tokens) for our dependencies
const $Logger = createProvider<Logger>('Logger');
const $Config = createProvider<Config>('Config');

// ==========================================
// 2. Define Implementations
// ==========================================

class ConsoleLogger implements Logger {
  log(msg: string): void {
    console.log(`[Console] ${msg}`);
  }
}

class JsonLogger implements Logger {
  log(msg: string): void {
    console.log(JSON.stringify({ timestamp: Date.now(), msg }));
  }
}

// A Service that depends on Logger and Config
class AppService {
  // Dependencies are injected via default parameters!
  constructor(
    private readonly logger = $Logger(),
    private readonly config = $Config(),
  ) {}

  start(): void {
    this.logger.log(`Starting ${this.config.appName} on port ${this.config.port}...`);
  }
}

// ==========================================
// 3. Main Execution
// ==========================================

function main(): void {
  console.log('--- standard injection ---');
  const injector = new Injector();

  // Bind Config to a value
  injector.bindProvider($Config).toValue({
    appName: 'MyAwesomeApp',
    port: 3000,
  });

  // Bind Logger to a Class
  injector.bindProvider($Logger).toConstructor(ConsoleLogger);

  // Create an instance of AppService.
  // Nano-injector automatically resolves arguments.
  const app = injector.createInstance(AppService);
  app.start();

  console.log('\n--- swapping implementations ---');
  // We can re-bind or create a new injector with different bindings
  const jsonInjector = new Injector();
  jsonInjector.bindProvider($Config).toValue({ appName: 'JsonApp', port: 8080 });
  jsonInjector.bindProvider($Logger).toConstructor(JsonLogger);

  const jsonApp = jsonInjector.createInstance(AppService);
  jsonApp.start(); // Output will be JSON format

  console.log('\n--- hierarchical injection ---');
  // Child injector uses parent's config but overrides logger
  const childInjector = new Injector({ parent: injector });
  childInjector.bindProvider($Logger).toValue({
    log: (msg) => console.log(`[Child Override] ${msg}`),
  });

  const childApp = childInjector.createInstance(AppService);
  // Config comes from 'injector' (parent), Logger comes from 'childInjector'
  childApp.start();

  console.log('\n--- function injection ---');
  // We can also use providers inside arbitrary functions
  injector.callFunc(() => {
    const config = $Config();
    console.log(`Running inside function with config: ${config.appName}`);
  });

  console.log('\n--- mixed manual and injected parameters ---');
  class User {
    constructor(
      public readonly name: string, // parameters without default value must be passed manually
      private readonly logger = $Logger(),
    ) {}

    greet() {
      this.logger.log(`Hello, I am ${this.name}`);
    }
  }

  // We pass 'Alice' manually. The second argument (logger) is resolved by the injector.
  const user = injector.createInstance(User, 'Alice');
  user.greet();
}

main();
