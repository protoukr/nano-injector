import { Injector, createProvider, $Injector } from '..';

// to distinguish providers from any other entities $ sign is used
const $Clock = createProvider<(cb: () => void, time: number) => number>();
const $ClockRate = createProvider<number>();

const $CPU = createProvider<CPU>();

interface CPU {
  readonly model: string;
  readonly numCores: number;
  readonly frequency: number;
}

const $GPU = createProvider<GPU>();

interface GPU {
  readonly model: string;
  readonly numRayTracingCores: number;
  readonly memorySize: number;
}

const $RAM = createProvider<RAM>();

interface RAM {
  readonly capacity: number;
}

const $Motherboard = createProvider<Motherboard>();

interface Motherboard {
  readonly cpu: CPU;
  readonly gpu: GPU;
  readonly ram: RAM;
}

class GeForce911 implements GPU {
  model = 'GeForce911';
  numRayTracingCores = 100;
  memorySize = 2048;
}

class DefMotherboard implements Motherboard {
  constructor(
    readonly model: string,
    public cpu = $CPU(),
    public gpu = $GPU(),
    public ram = $RAM(),
  ) {}
}

class PC {
  constructor(
    private readonly name: string,
    private readonly motherboard = $Motherboard(),
  ) {}
}

// defining injector through which injection occurs
const injector = new Injector();

// binding $CPU provider to the exact value
injector.bindProvider($CPU).toValue({ numCores: 4, model: 't7', frequency: 2000 });

// binding $GPU provider to class which conforms to provider's returning type
// calling asSingleton specifies that value should be created only once
injector.bindProvider($GPU).toConstructor(GeForce911).asSingleton();

// binding $RAM provider to the factory which creates value conforming to
// provider's returning type
injector.bindProvider($RAM).toFactory(() => ({
  capacity: Math.floor(Math.random() * 1024),
}));

injector
  .bindProvider($Motherboard)
  .toFactory(
    () =>
      // only one required parameter is passed, the rest are initialized
      // automatically through providers
      new DefMotherboard('Asus ABC-123'),
  )
  .asSingleton();

// without ignoring compiler would tell you about wrong value's type
// @ts-expect-error
injector.bindProvider($ClockRate).toValue('asd');

injector.bindProvider($ClockRate).toValue(1000);

injector.bindProvider($Clock).toValue(setTimeout);

// the first parameter of PC constructor is required, so it is passed into the
// construction method
const myPC = injector.createInstance(PC, 'My pc');
console.log('Rate my setup:', myPC);

// directly getting the bound to the providers values
console.log('CPU:', injector.getValue($CPU));
console.log('GPU:', injector.getValue($GPU));
console.log('RAM:', injector.getValue($RAM));

injector.getValue($Clock)(() => console.log('Tick!'), 1000);

console.log(
  'Default motherboard:',
  // manually creating instance with all its dependencies
  new DefMotherboard(
    'Asus xyz',
    { frequency: 123, model: 'Intel xyz', numCores: 1 },
    { model: 'ZXC-222', memorySize: 0, numRayTracingCores: 1 },
    { capacity: 123 },
  ),
);

// calling function through injector
injector.callFunc(() => {
  // inside function all providers return bound to them values
  console.log('Inside function');
  console.log('CPU:', $CPU());
  console.log('GPU:', $GPU());
  console.log('RAM:', $RAM());
});

// binding few providers to one value
injector.bindProvider($RAM, $CPU, $GPU).toValue({
  capacity: 10,
  frequency: 100,
  memorySize: 200,
  model: 'ATB-21',
  numCores: 2,
  numRayTracingCores: 60,
});

console.log('Combined CPU:', injector.getValue($CPU), injector.getValue($GPU), injector.getValue($RAM));

// creating composition of injectors
const childInjector = new Injector({ parent: injector });

// overriding $CPU binding of parent injector inside child injector
childInjector.bindProvider($CPU).toValue({ numCores: 1, model: 'z2', frequency: 999 });

console.log('Overridden CPU:', childInjector.getValue($CPU));

const newMotherboard = new (class {
  gpu: GPU;
  cpu: CPU;
})();
// injecting value to the existing instance
injector.injectValues(newMotherboard, { cpu: $CPU, gpu: $GPU });
console.log('New motherboard:', newMotherboard);

// injector binds itself to $Injector provider, therefore it can be injected
// like any other values
class MyMegaPC {
  constructor(injector = $Injector()) {
    // getting instance from the injected injector
    console.log(injector.getValue($CPU));
  }
}
injector.createInstance(MyMegaPC);
