## v1.8.6 — 2025-10-07

### Added
- Hardened dasher identity handling with memoized descriptor maps and shared helper access across earnings and cash-out flows.
- Improved inline cash-out entry with better validation, accessibility semantics, and focus management.

### Changed
- Balance synchronization now clamps/normalizes values and deduplicates history entries per identity.

### Fixed
- Cash-out submissions now provide actionable feedback instead of silent fallbacks when matching records are missing.
