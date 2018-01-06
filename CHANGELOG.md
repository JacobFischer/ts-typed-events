# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2018-01-05
### Changes
- Update package dependencies to resolve marked v0.3.6 security vunerability
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

[1.0.1]: https://github.com/JacobFischer/ts-typed-events/releases/tag/v1.0.1
[1.1.0]: https://github.com/JacobFischer/ts-typed-events/releases/tag/v1.1.0
