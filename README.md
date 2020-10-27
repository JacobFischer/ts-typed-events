# ts-typed-events

Strongly typed event emitters for [TypeScript](https://www.typescriptlang.org/).

This is a TypeScript project, although the compiled source is available in the
npm package, it is solely designed around the purpose of making events easier to
work with _in TypeScript_.

## Purpose

Using Node's [EventEmitter](https://nodejs.org/api/events.html) class is nice;
it's a useful software engineering paradigm. However in TypeScript you loose out
on TypeScript's robust type checking when publishing and subscribing to events.

The aim of this is to leverage TypeScript's generic types to allow for compile-
time type checking. We also move the events into their own class, so you don't
have to inherit or mixin any of our classes, just use these single Event
emitters.

## Examples

### Importing

```ts
import { Event } from "ts-typed-events";
```

### Simple Usage

```ts
const event = new Event<string>();

event.on((str) => {
    console.log("hey we got the string: ", str);
});

event.emit("some string"); // prints `hey we got the string: some string`
```

### Events without types (signals)

```ts
const signal = new Event();

signal.on(() => {
    console.log("The event triggered!");
});

signal.emit(); // prints: `The event triggered!`
```

### async/await usage

```ts
const event = new Event<number>();

// emit the event in 1 second
setTimeout(() => event.emit(1337), 1000);

const emitted = await event.once();
console.log("1 sec later we got", emitted);
// printed: `1 sec later we got 1337`
```

_Note_: async only works with `once`, not `on` as that can trigger multiple
times.

### Multiple callbacks

```ts
const event = new Event<"pizza" | "ice cream">();

event.on((food) => console.log("I like", food));
event.on((badFood) => console.log(badFood, "is bad for me!"));

event.emit("pizza");
// printed: `I like pizza` followed by `pizza is bad for me!`
```

### Removing callbacks

```ts
const event = new Event();
const callback = () => { throw new Error("I don't want to be called"); };

event.on(callback);
event.off(callback);

event.emit(); // The callback was removed, so it does not get called
```

### Classes

```ts
class Dog {
    eventBarked = new Event();

    bark() {
        this.eventBarked.emit();
    }
}

const dog = new Dog();
dog.eventBarked.on(() => console.log("The dog barked!"));
dog.bark();
// printed: `The dog barked!`;
```

## Other Notes

This library leverages TypeScript's interfaces and generics very heavily to do
type checking at every point. If you plan to use this with regular JavaScript
most of this library's features are lost to you, so you'd probably be best off
sticking to the built-in EventEmitter class.

## Docs

All the functions are documented clearly using jsdoc style comments, so your
favorite IDE should pick up the documentation cleanly.

However, if you prefer external docs, they are available online here:
https://jacobfischer.github.io/ts-typed-events/
