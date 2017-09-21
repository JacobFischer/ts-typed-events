# ts-typed-events

Strongly typed event emitters for [TypeScript](https://www.typescriptlang.org/).

This is a TypeScript project, although the compiled source is available in the
npm package, it is solely designed around the purpose of making events easier to
work with _in TypeScript_.

## Purpose

Using Node's [EventEmitter](https://nodejs.org/api/events.html) class is nice,
it's a useful software engineering paradigm; however in TypeScript you loose out
on TypeScript's robust type checking when publishing and subscribing to events.

The aim of this is to leverage TypeScript's generic types to allow for compile-
time type checking. We also move the events into their own class, so you don't
have to inherit or mixin any of our classes, just use these single Event
emitters.

## Examples

### Importing

```ts
import { Event, events } from "ts-typed-events";
```

### Simple Usage

```ts
const event = new Event<string>();

event.on((str) => {
    console.log("hey we got the string:", str);
});

event.emit("some string");
```

### Events without types (signals)

```ts
const event = new Event();

event.on(() => {
    console.log("The event triggered!");
});

event.emit(undefined); // required for the ts compiler to be happy
```

_strictly speaking the type is undefined_

### async/await usage

```ts
const event = new Event<number>();

// emit the event in 1 second
setTimeout(() => {
    event.emit(1337);
}, 1000);

const emitted = await event.once();
console.log("1 sec later we got", emitted);
```

_Note_: async only works with `once`, not `on` as that can trigger multiple
times.

### Class with multiple events

```ts
class Dog {
    public readonly events = events({
        barked: new Event();
        called: new Event<string>();
        didSomethingComplex: new Event<{a: string, b: number, c: boolean[]}>();
    });

    public callIt(name: string): void {
        this.events.called.emit(name);
    }

    public doComplexTask(): void {
        this.events.didSomethingComplex.emit({
            a: "some string",
            b: 1,
            c: [true, false, true, true],
        });
    }
}

const dog = new Dog();

dog.events.called.once(console.log);
dog.callIt("good boy"); // now the called event should trigger and pipe the string to console.log

dog.events.didSomethingComplex.on((obj) => {
    console.log(obj.a, obj.b, obj.c);
});
dog.doComplexTask(); // the above callback is hit!

dog.callIt("still a good boy"); // the first console.log callback is not fired, because it was only fired `once`
```

### Class inheriting events

```ts
class Pug extends Dog {
    public readonly events = events.concat(super.events, {
        snort: new Event();
    });

    public snort(): void {
        this.events.snort.emit(undefined);
    }
}

const pug = new Pug();

pug.events.called.once(console.log);
pug.callIt("good boy"); // this still works from the super's events!

pug.events.snort.on(() => {
    console.log("this pug snorted, cut little guy");
});
pug.snort();
```



### Removing callbacks

```ts
const event = new Event();
const callback = () => {};

event.on(callback);
event.off(callback);
```

## Other Notes

This library leverages TypeScript's interfaces and generics very heavily to do
type checking at every point. If you plan to use this with regular JavaScript
most of this library's features are lost to you.

## Docs

All the functions are documented clearly using jsdoc style comments, so your
favorite IDE should pick up the documentation cleanly.

However, if you prefer external docs, they are available online here:
https://jacobfischer.github.io/ts-typed-events/
