# ts-typed-events

Zero dependency strongly typed event emitters for [TypeScript].

## Purpose

Using Node's [EventEmitter class] is nice; it's a useful software engineering
paradigm. However in TypeScript you lose out on TypeScript's robust type
checking when publishing and subscribing to events; or you must write very
brittle function overloads for _every function_: `on`, `off`, `once`, `emit`,
etc. This is annoying and tedious.

The aim of this is to leverage TypeScript's generics to allow for build-time
type checking. We also move the events into their own functions, so you don't
have to inherit or mixin any of our classes; just use these single Event
emitters. It is also un-opinionated, exposing functional and object oriented
building blocks in this library so you can use it best works in your project.

## Examples

### Simple usage

With classes

```ts
import { Event } from 'ts-typed-events';

const event = new Event();

event.on(() => {
  console.log('The event triggered!');
});

event.emit(); // prints: `The event triggered!`
```

_Or_ with functions

```ts
import { createEmitter } from 'ts-typed-events';

const { emit, event } = createEmitter();

event.on(() => {
  console.log('The event triggered!');
});

emit(); // prints: `The event triggered!`
```

### Strongly typed events

```ts
const event = new Event<string>();

event.on((str) => {
  console.log('hey we got the string:', str);
});

// this emit function requires an argument of type `string`
event.emit('some string'); // prints `hey we got the string: some string`
```

### async/await usage

You can register event listeners via traditional callbacks, or if no callback is
supplied to `event.once()`, a Promise is returned that you can `await`.

```ts
const event = new Event<number>();

// emit the event in 1 second
setTimeout(() => event.emit(1337), 1000);

const emitted = await event.once();
console.log('1 sec later we got', emitted);
// printed: `1 sec later we got 1337`
```

_Note_: async only works with `once`, not `on` as that can trigger multiple
times.

### Multiple callbacks

```ts
const event = new Event<'pizza' | 'ice cream'>();

event.on((food) => console.log('I like', food));
event.on((badFood) => console.log(badFood, 'is bad for me!'));

event.emit('pizza');
// printed: `I like pizza`, followed by: `pizza is bad for me!`
```

### Removing callbacks

```ts
const event = new Event();

const callback = () => { throw new Error(`I don't want to be called`); };
event.on(callback);
event.off(callback);

// The callback was removed, so the Error in the callback is not thrown
const emitted = event.emit();
console.log('were any callbacks invoked during the emit?', emitted);
// printed: `were any callbacks invoked during the emit? false`
```

### Combining this within Classes

As this module intends to replace the "built-in" [EventEmitter class], you
can use it much more freely because it is not a class you **must** inherit like
with the [EventEmitter class]. To replicate similar functionality you can make
each event a separate member variable of your.

```ts
class Dog {
  private timesBarked = 0;
  // NOTE: the emitter is private here, and the event is public.
  // This allows the class to completely control when it emits.
  private emitBarked = createEmitter();

  public barked = this.emitBarked.event;

  public bark() {
    this.timesBarked += 1;
    this.emitBarked();
  }
}

const dog = new Dog();
dog.barked.on(() => console.log('The dog barked!'));
dog.bark(); // prints: `The dog barked!`;
```

### `createEmitter` alternative Syntax

The method `createEmitter` returns an emitter function, with the event and
itself as properties. This makes the above examples when used with destructuring
look clean. However you can choose not to destructure it as well:

```ts
const emit = createEmitter<'something' | undefined>();

emit.event.on((something) => {
  console.log('did we get something?:', something);
});

emit(); // prints `did we get something?: undefined`
emit.emit('something'); // prints `did we get something?: something`

// the emitter has access to itself via the `emit` key as well
console.log(emit === emit.emit); // prints `true`
```

#### Sealed Events

The `Event` class has exposed the member function `emit`, which means any bit
of code that can register as a listener on your event, can also force that event
to emit.

Often you do not want to trust bits of code with that responsibility. For that
common use case this module exposes an alternative type of events
and API to generate Events called `SealedEvents` that cannot self emit, and
a separate emitter function to handle the emitting logic.

```ts
import { createEmitter, SealedEvent } from 'ts-typed-events';

const { event, emit } = createEmitter<BigInt>();

event instanceof SealedEvent; // true
'emit' in event; // === false

event.on((int) => {
  console.log('Emitted BigInt:', int);
});

emit(1337n); // prints: 'Emitted BigInt: 1337'
```

**Note**: you can also use `createEventEmitter` if you wish the `event` type to
be `instanceof Event`. Keep in mind that regular `Event` instances have access
to their emitter via `.emit`. This module exposes both variants for API
uniformity.

## Other Notes

This library leverages TypeScript's interfaces and generics very heavily to do
type checking at every point. If you plan to use this with regular JavaScript
most of this library's features are lost to you. However do not let that deter
you from trying this, or [TypeScript]!

## Docs

All the functions are documented using jsdoc style comments, so your
favorite IDE should pick up the documentation cleanly.

However, if you prefer external docs, they are available online here:
https://jacobfischer.github.io/ts-typed-events/

[TypeScript]: https://www.typescriptlang.org/
[EventEmitter class]: https://nodejs.org/api/events.html#events_class_eventemitter
