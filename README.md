# ts-typed-events - v3.0 Release Candidate 2

Strongly typed event emitters for [TypeScript](https://www.typescriptlang.org/).

This is a TypeScript project, although the compiled source is available in the
npm package, it is solely designed around the purpose of making events easier to
work with _in TypeScript_.

## Purpose

Using Node's [EventEmitter](https://nodejs.org/api/events.html) class is nice;
it's a useful software engineering paradigm. However in TypeScript you lose out
on TypeScript's robust type checking when publishing and subscribing to events.

The aim of this is to leverage TypeScript's generic types to allow for compile-
time type checking. We also move the events into their own class, so you don't
have to inherit or mixin any of our classes, just use these single Event
emitters. It is also un-opinionated, exposing functional and object oriented
build blocks in this library so you can use it best works in your project.

## Examples

### Importing

```ts
import { createEventEmitter } from "ts-typed-events";
```

### Simple Usage

```ts
const { event, emit } = createEventEmitter<string>();

event.on((str) => {
    console.log("hey we got the string:", str);
});

emit("some string"); // prints `hey we got the string: some string`
```

### Events without types (signals)

```ts
const { event: signal, emit } = createEventEmitter<string>();

signal.on(() => {
    console.log("The event triggered!");
});

emit(); // prints: `The event triggered!`
```

### async/await usage

```ts
const { event, emit } = createEventEmitter<number>();

// emit the event in 1 second
setTimeout(() => emit(1337), 1000);

const emitted = await event.once();
console.log("1 sec later we got", emitted);
// printed: `1 sec later we got 1337`
```

_Note_: async only works with `once`, not `on` as that can trigger multiple
times.

### Multiple callbacks

```ts
const { event, emit } = createEventEmitter<"pizza" | "ice cream">();

event.on((food) => console.log("I like", food));
event.on((badFood) => console.log(badFood, "is bad for me!"));

emit("pizza");
// printed: `I like pizza` followed by `pizza is bad for me!`
```

### Removing callbacks

```ts
const { event, emit } = createEventEmitter();

const callback = () => { throw new Error("I don't want to be called"); };
event.on(callback);
event.off(callback);

// The callback was removed, so the Error in the callback is not thrown
const emitted = emit();
console.log("were any callbacks invoked during the emit?", emitted);
// printed: `were any callbacks invoked during the emit? false`
```

### Alternative Syntax

The main method, `createEventEmitter`, returns the emitter function, with
the event and itself as properties. This makes the above examples when used
with destructuring look clean. However you can choose not to destructure it
as well:

```ts
const emit = createEventEmitter<"something" | undefined>();

emit.event.on((something) => {
    console.log("did we get something?:", something);
});

emit(); // prints `did we get something?: undefined`

// the emitter has access to itself via the `emit` key as well
console.log(emit === emit.emit); // print `true`
```

### Public Events

In the above examples, the `event` and `emit` are two separate constructs.
This is to separate the callback and invocation logic. However there are some
times when you could want an event to be able to be triggered by anything with
access to it.

```ts
import { PublicEvent } from "ts-typed-events";

const publicEvent = new PublicEvent();

publicEvent.on(() => console.log("someone triggered this!"));

publicEvent.emit(); // prints: `someone triggered this!`
```

You can also use it functionally if you want to avoid classes/OOP.

```ts
import { createPublicEventAndEmit } from "ts-typed-events";

const { event, emit } = createPublicEventEmitter<string>();

event.on((emitted) => console.log(`someone emitted: '${emitted}'!`));

event.emit("first"); // prints: `someone emitted 'first'!`

// you still can use the "normal" emitter too
emit("second"); // prints: `someone emitted 'second'!`
```

### Classes

```ts
class Dog {
    private timesBarked = 0;
    // By keeping reference to the tuple, we have wrapped the emit function
    // in a private variable, and only exposed the public event.
    // This allows us to decide inside our class instances when we want to
    // emit events.
    private emitBarked = createEventEmit();
    public barked = this.emitBarked.event;

    public bark() {
        this.timesBarked += 1;
        this.emitBarked();
    }
}

const dog = new Dog();
dog.barked.on(() => console.log("The dog barked!"));
dog.bark(); // prints: `The dog barked!`;
```

## Other Notes

This library leverages TypeScript's interfaces and generics very heavily to do
type checking at every point. If you plan to use this with regular JavaScript
most of this library's features are lost to you, so you'd probably be best off
sticking to the built-in EventEmitter class.

## Docs

All the functions are documented using jsdoc style comments, so your
favorite IDE should pick up the documentation cleanly.

However, if you prefer external docs, they are available online here:
https://jacobfischer.github.io/ts-typed-events/
