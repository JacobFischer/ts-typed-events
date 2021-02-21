import { BaseEvent, SealedEvent } from '../src';

describe('abstract class', () =>
  [BaseEvent, SealedEvent].forEach((EventClass) =>
    describe(`${EventClass.name}`, () => {
      it('should not allow TS constructor or emit', () => {
        // @ts-expect-error constructor should not be exposed
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const event: SealedEvent = new EventClass();

        // @ts-expect-error emit should not be exposed;
        expect(event.emit).toBeUndefined();
        expect('emit' in event).toBe(false);
      });
    }),
  ));
