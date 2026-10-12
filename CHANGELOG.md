# Changelog

All notable changes to this project are documented here.

## 2.0.0

### Breaking changes

- **New authentication model.** Device registration and login now live in the `ARTSOFT API` credential (`preAuthentication`). Devices registered by earlier versions (stored in `~/.n8n/artsoft/devices.json`) are **not migrated**: delete them in ARTSOFT and let the credential register again.
- The `ARTSOFT_CONFIG_DIR` environment variable is no longer used.
- All user-facing text is now in English. Parameter names and option values are unchanged, so saved workflows keep working.
- Resource and operation labels follow the n8n conventions (Get, Create, Update, Delete, Get Many).

### Changed

- Requests go through n8n's HTTP helpers instead of a custom HTTP client.
- `fast-xml-parser` and `xmlbuilder2` were replaced by a dependency-free XML helper with identical output (covered by parity tests).
- Error messages were reworded and carry the item index when raised by the node.
- The Workflow *Delete* operation description now matches what it does.

### Removed

- Debug `console.log` output that printed request bodies.
- Runtime dependencies, file system and environment access (required for n8n verification).

### Added

- `Device Name` credential field, sent as `Name` when the device is registered.
- The credential test only validates the required settings and never registers a device. The device is registered when a workflow runs for the first time.
- README, MIT license file, CI workflow and a publish workflow with npm provenance.
- `npm test`: XML parity tests (fixed cases and seeded fuzzing).

## 1.3.0

Last release before the verification-oriented rewrite.
