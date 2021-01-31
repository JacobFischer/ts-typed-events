# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog]
and this project adheres to [Semantic Versioning].

## [3.0.0] - 2021-??-??
### Added
- `PublicEvent`: Same as <= v2 `Event`.
  - This can be used as a drop in replacement for the previous `Event` class
    when upgrading with no additional work.
- `createEventEmitter()` is the new "main" method going forward to handle most
  events. See docs for use.
  - See [#14].
- `createPublicEventEmitter()` also added a matching API, but with
  `PublicEvent` events instead.

### Changes
- `events` fully removed.
  - See [#8] for discussion and alternatives when upgrading.
- `Event` replaced with `PublicEvent` and `Event` listed above.
  - This is intended to be the "main" event class going forward, but never
    created directly.
  - `emit` removed, use `PublicEvent` as a drop-in replacement.
  - Constructing via `new` is no longer supported, and marked as such in the TS
    definitions.
- Exports changed to the new functions/classes/types.

### Fixed
- Circular imports are no longer encountered during module loading [#12].
- The `any` type should be correctly handled for emitter functions [#13].

## [2.0.1] - 2021-01-24
### Changes
- `events` helper functions depreciated. See [#8].
- This is a maintenance release to fix the npm versions before v3.0 release.

## [2.0.0] - 2020-05-18
### Changes
- Rename TypeScript interfaces `IEvents` and `IEventsFunction` to `Events` and `EventsFunction` respectively.
- `Signal` class removed. Instead you can now use `Event` without a generic which is now functionally identical to the old `Signal`.
- Requires TypeScript >= 3.0 for newer features in the included definition files.

# Fixed
- Source maps no longer point to missing files. Instead source maps are inlined in the source. Thanks [#6].

## [1.1.1] - 2018-01-05
### Changes
- Update package dependencies to resolve marked v0.3.6 security vulnerability
- Correct the names of some tests with poor grammar/spelling

## [1.1.0] - 2017-12-31
### Added
- This changelog to track changes easily
- `events.offAll` helper function to remove all event listeners from an events object
- `Signal` helper class that is a simple `Event<undefined>` instance and does not require data to be emitted

### Changes
- Removed strict node engine version in package.json
- Now targets ES5 by default for output js files
- The IEvents interface now may be undefined to better represent arbitrary indexing of an events object
- Some README and jsdoc grammar/spelling tweaks

## 1.0.1 - 2017-09-21
### Fixed
- Corrected some examples in the README.md

## 1.0.0 - 2017-09-20
### Added
- Initial release of Event and events

[Keep a Changelog]: http://keepachangelog.com/en/1.0.0/
[Semantic Versioning]: http://semver.org/spec/v2.0.0.html
[1.0.1]: https://github.com/JacobFischer/ts-typed-events/releases/tag/v1.0.1
[1.1.0]: https://github.com/JacobFischer/ts-typed-events/releases/tag/v1.1.0
[1.1.1]: https://github.com/JacobFischer/ts-typed-events/releases/tag/v1.1.1
[2.0.0]: https://github.com/JacobFischer/ts-typed-events/releases/tag/v2.0.0
[2.0.1]: https://github.com/JacobFischer/ts-typed-events/releases/tag/v2.0.1
[3.0.0]: https://github.com/JacobFischer/ts-typed-events/releases/tag/v3.0.0
[#6]: https://github.com/JacobFischer/ts-typed-events/issues/6
[#8]: https://github.com/JacobFischer/ts-typed-events/issues/8
[#12]: https://github.com/JacobFischer/ts-typed-events/issues/12
[#13]: https://github.com/JacobFischer/ts-typed-events/pull/13
[#14]: https://github.com/JacobFischer/ts-typed-events/pull/14
[#6]: https://github.com/JacobFischer/ts-typed-events/issues/6
[#8]: https://github.com/JacobFischer/ts-typed-events/issues/8
