import { BaseEvent, Event } from '../src/';

describe('Event class', () => {
  it('should be able to be constructed', () => {
    expect(() => new Event()).not.toThrow();
  });

  it('should be an Event', () => {
    const event = new Event();
    expect(event).toBeInstanceOf(BaseEvent);
    expect(event).toBeInstanceOf(Event);
  });

  it('should have an emit member function', () => {
    const event = new Event();
    expect('emit' in event).toBe(true);
    expect(typeof event.emit).toBe('function');
  });

  it('should be able to emit via the event', () => {
    const testing = Symbol('test string');
    const event = new Event<symbol>();
    const callback = jest.fn((emitted) => {
      expect(emitted).toBe(testing);
    });

    event.on(callback);
    event.emit(testing);

    expect(callback).toBeCalled();
  });

  it('should allow types to be optional', () => {
    const event = new Event();
    expect(() => event.emit()).not.toThrow();
  });
});
