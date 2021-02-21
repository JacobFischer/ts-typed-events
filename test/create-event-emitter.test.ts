import { createEventEmitter } from '../src';

describe('createEventEmitter()', () => {
  it('should emit via the event and emit', () => {
    let emitting: string | number = 1;
    const { event, emit } = createEventEmitter<string | number>();

    const callback = jest.fn((emitted) => {
      expect(emitted).toStrictEqual(emitting);
    });
    event.on(callback);

    expect(emit(emitting)).toBeTruthy();
    emitting = 'test string';
    expect(event.emit(emitting)).toBeTruthy();

    expect(callback).toBeCalledTimes(2);
  });
});
