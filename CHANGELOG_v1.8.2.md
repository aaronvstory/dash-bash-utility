## v1.8.9 — 2025-10-07

### Changed
- Bumped application metadata, manifest, and service worker identifiers to version 1.8.9 ahead of the gh-pages release push.
- Routed copy, save, export, import, and validation error toasts through the assertive live region for consistent screen-reader announcements.

### Notes
- Final accessibility polish pass before adding automation for release smoke checks.

## v1.8.7 — 2025-10-07

### Changed
- Fixed a crash caused by referencing `safeFieldSegment` before definition by hoisting the helper to shared scope and removing duplicate local declarations.
- Added a shared aria-live announcer and success messages for inline earning and cash-out actions.
- Unified cache-busting version parameters across favicon, manifest, and apple-touch icon.
- Removed duplicate manifest link to avoid install/update inconsistencies.

### Notes
- v1.8.6 was an intermediary bump; superseded by 1.8.7.

## v1.8.6 — 2025-10-07

### Added
- Hardened dasher identity handling with memoized descriptor maps and shared helper access across earnings and cash-out flows.
- Improved inline cash-out entry with better validation, accessibility semantics, and focus management.

### Changed
- Balance synchronization now clamps/normalizes values and deduplicates history entries per identity.

### Fixed
- Cash-out submissions now provide actionable feedback instead of silent fallbacks when matching records are missing.
