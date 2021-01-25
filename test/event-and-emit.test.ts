import {
    createEventEmitter,
    createPublicEventEmitter,
    TypedEvent,
    PublicTypedEvent,
} from "../src/";

const createFunctions = [
    createEventEmitter,
    createPublicEventEmitter,
] as Array<typeof createEventEmitter>;

createFunctions.forEach((create) =>
    describe(`${create.name}()`, () => {
        it("should exist", () => {
            expect(create).toBeTruthy();
            expect(typeof create).toBe("function");
        });

        it("should return an EventAndEmit tuple", () => {
            const returned = create();
            expect(returned).toBeTruthy();
            expect(typeof returned).toBe("function");
            expect(returned.name).toBe("emit");

            expect(returned.event).toBeInstanceOf(TypedEvent);

            expect(typeof returned.emit).toBe("function");
            expect(returned).toStrictEqual(returned.emit);
        });

        it("should emit to listeners on the event", () => {
            const VAL = Symbol("emitTest");
            const { event, emit } = create<typeof VAL>();
            const fn = jest.fn((arg) => {
                expect(arg).toBe(VAL);
            });
            event.on(fn);
            expect(emit(VAL)).toBe(true);
            expect(fn).toBeCalled();
        });

        it("should return false without listeners", () => {
            const { emit } = create();
            expect(emit()).toBe(false);
        });

        it("should emit the correct type", () => {
            const stringValue = "Some string to test with";
            const { event, emit } = create<string>();
            event.on((arg) => {
                expect(arg).toEqual(stringValue);
                expect(typeof arg).toEqual("string");
            });
            expect(emit(stringValue)).toEqual(true);
        });

        it("should emit multiple times with on", () => {
            let i = 0;
            const { event, emit } = create<number>();

            const TIMES = 20;
            const callback = jest.fn((arg) => {
                expect(typeof arg).toEqual("number");
                expect(arg).toEqual(i);
            });
            event.on(callback);

            for (i = 0; i < TIMES; i++) {
                expect(emit(i)).toEqual(true);
            }

            expect(callback).toBeCalledTimes(TIMES);
        });

        it("should not mutate emitted values", () => {
            const complex = {
                foo: "bar",
                baz: [1, 2, 3],
            };

            const { event, emit } = create<typeof complex>();
            event.on((obj) => {
                expect(obj).toStrictEqual(complex);
            });
            emit(complex);
        });

        it("should only emit once via once()", () => {
            let i = 0;
            const { event, emit } = create<number>();
            const TIMES = 20;
            const callback = jest.fn((arg) => {
                expect(typeof arg).toEqual("number");
                expect(arg).toEqual(i);
            });

            event.once(callback);

            for (i = 0; i < TIMES; i++) {
                const returned = emit(i);
                // when true, the listener should be removed,
                // and thus it should return false for no listeners
                expect(returned).toEqual(i === 0);
            }

            expect(callback).toBeCalledTimes(1);
        });

        it("should only returns a promise with once", () => {
            const { event } = create();
            expect(event.once()).toBeInstanceOf(Promise);
        });

        it("should emit to callbacks once", async () => {
            const VAL = Symbol("onceTest");
            const { event, emit } = create<symbol | undefined>();

            setImmediate(() => {
                emit(VAL);
            }, 10);

            expect(await event.once()).toEqual(VAL);
            emit();
        });

        it("should be able to remove a listener", () => {
            const NUM = 1337;
            const { event, emit } = create<number>();
            const callback = () => {
                expect(NUM).toEqual(NUM);
            };

            event.on(callback);
            expect(emit(NUM)).toEqual(true);

            expect(event.off(callback)).toEqual(true);

            // now there should be no one to emit to
            expect(emit(NUM)).toEqual(false);
        });

        it("should be able to remove a listener promise", () => {
            const NUM = 1337;
            const { event, emit } = create<number>();
            const promise = event.once();
            expect(promise).toBeInstanceOf(Promise);

            const callback = jest.fn();
            void promise.then(callback);
            expect(callback).not.toBeCalled();

            expect(event.off(promise)).toEqual(true);

            // now there should be no one to emit to
            expect(emit(NUM)).toEqual(false);
            expect(callback).not.toBeCalled();
        });

        it("should tell when no listener is removed", () => {
            const { event } = create<number>();

            expect(event.off(() => null)).toEqual(false);
        });

        it("should remove all listeners", () => {
            const LISTENERS = 8;
            const { event } = create<number>();

            for (let i = 0; i < LISTENERS; i++) {
                event.on(() => true);
            }

            expect(event.offAll()).toEqual(LISTENERS);
        });

        it("should work within a class", () => {
            class Dog {
                // By keeping reference to the tuple, we have wrapped the emit function
                // in a private variable, and only exposed the public event.
                // This allows us to decide inside our class instances when we want to
                // emit events.
                private emitBarked = create();
                public barked = this.emitBarked.event;

                public bark() {
                    this.emitBarked();
                }
            }

            const fn = jest.fn((arg) => {
                expect(arg).toBeUndefined();
            });

            const dog = new Dog();
            dog.barked.on(fn);
            dog.bark();

            expect(fn).toBeCalled();
        });

        describe("TypeScript types", () => {
            it("should support default undefined type", () => {
                const { emit } = create();
                expect(emit()).toBe(false);
            });

            it("should support a simple type", () => {
                const { emit } = create<string>();
                expect(emit("some string")).toBe(false);
            });

            it("should support union types", () => {
                const VAL = "foo";
                const { emit } = create<"foo" | "bar" | "baz">();
                expect(emit(VAL)).toBe(false);
            });

            it("should support any as a type", () => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { event, emit } = create<any>();
                const callback = jest.fn();
                event.on(callback);

                expect(emit(1)).toBe(true);
                expect(emit()).toBe(true);
                expect(emit(undefined)).toBe(true);
                expect(emit("another weird type")).toBe(true);
                expect(emit(Symbol("completely unique"))).toBe(true);

                expect(callback).toBeCalledTimes(5);
            });

            it("should not require arguments of the undefined type", () => {
                const { emit } = create<number | undefined>();

                expect(emit()).toBe(false);
                expect(emit(1337)).toBe(false);
            });

            it("should allow events with no generic type (signals)", () => {
                const { event: signal, emit } = create();

                signal.on((arg) => {
                    expect(arg).toBeUndefined();
                });

                expect(emit()).toEqual(true); // emit with no data because this is a signal
            });

            it("should allow events with an union type including undefined", () => {
                const { event, emit } = create<
                    { key: string } | number | string | undefined
                >();

                // Test number
                const numListener = jest.fn((arg) => {
                    expect(arg).toEqual(100);
                });
                event.once(numListener);
                expect(emit(100)).toEqual(true);
                expect(numListener).toBeCalled();

                // Test string
                const strListener = jest.fn((arg) => {
                    expect(arg).toEqual("test");
                });
                event.once(strListener);
                expect(emit("test")).toEqual(true);
                expect(strListener).toBeCalled();

                // Test object
                const objListener = jest.fn((arg) => {
                    expect(arg).toEqual({ key: "test" });
                });
                event.once(objListener);
                expect(emit({ key: "test" })).toEqual(true);
                expect(objListener).toBeCalled();

                // Test undefined (signal)
                const undefinedListener = jest.fn((arg) => {
                    expect(arg).toBeUndefined();
                });
                event.once(undefinedListener);
                expect(emit()).toEqual(true);
                expect(undefinedListener).toBeCalled();
            });
        });
    }),
);

describe("createPublicEventAndEmit() specifics", () => {
    it("should return PublicEvents", () => {
        const returned = createPublicEventEmitter();
        expect(returned.event).toBeInstanceOf(PublicTypedEvent);
    });

    it("should emit via the event and emit", () => {
        let emitting: string | number = 1;
        const { event, emit } = createPublicEventEmitter<string | number>();

        const callback = jest.fn((emitted) => {
            expect(emitted).toStrictEqual(emitting);
        });
        event.on(callback);

        expect(emit(emitting)).toBeTruthy();
        emitting = "test string";
        expect(event.emit(emitting)).toBeTruthy();

        expect(callback).toBeCalledTimes(2);
    });
});
