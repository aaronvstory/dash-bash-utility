# Changelog

All notable changes to Dash Bash Utility will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.11.2] - 2026-01-11

### Fixed
- **Balance input field UX bug** - Fixed critical bug where balance input field was not writable in categories using DasherCard (Ready, USING, etc.). Users could only type one digit at a time and had to edit other fields first. Root cause: DasherCard memoization wasn't checking `editingBalanceValue` prop, preventing re-renders during typing. Added `editingBalanceValue` to memo comparison at line 705.

## [1.11.1] - 2026-01-11

### Fixed
- **Balance editing in all categories** - Fixed bug where balance edits only persisted in DASHERS category. Changed `toggleEditDasher` to use `updateDasherEverywhere()` which updates both `dasherCategories` and all bucket arrays (Ready, USING, APPEALED, Reverif, Locked, Applied/Pending, Deactivated, Archived). Balance edits now persist correctly in all categories.

## [1.11.0] - 2026-01-11

### Performance
- **Search optimization** - Pre-compute `_searchText` when categories change instead of rebuilding on every keystroke (30-50% faster search response)
- **Background tab efficiency** - Timer ticks pause when tabs are collapsed or app is backgrounded
- **Statistics gating** - Expensive stat computations only run when Statistics section is open
- **Lucide icon optimization** - Direct icon rendering without wrapper overhead

### Added
- **Custom confirm modal** - Replaced native browser `confirm()` with accessible custom modal infrastructure
  - Full WCAG compliance (alertdialog role, aria labels, keyboard navigation)
  - Escape key support for dismissal
  - Backdrop click to cancel
  - Customizable title, message, and button text
- **Error resilience** - Modal callbacks wrapped in try/catch to prevent UI lock on errors
- **IndexedDB failure handling** - Added onerror/onblocked handlers for edge cases

### Fixed
- **Modal handler stale closures** - Use functional state updates to prevent stale captures
- **Data persistence** - Added `requestPersist()` to `deleteDasherCategory` for immediate save
- **IndexedDB cleanup** - `clearAllData()` now properly deletes IndexedDB to prevent rehydration

### Changed
- Removed unused `closeConfirmModal` function (dead code cleanup)

## [1.10.0] - 2025-12-28

### Fixed
- **Critical: Data corruption prevention** - Emergency save handlers now check `isImporting` flag before saving to prevent partial state corruption when closing tab during data import
- **Critical: White screen crashes** - Added React Error Boundary component to catch errors and provide recovery options instead of blank screen
- **Memo comparator reliability** - Simplified DasherCard memo comparator to use object reference checks instead of brittle hardcoded property list that could miss new properties

### Changed
- Synced all version numbers across files (package.json, manifest.json, service-worker.js, index.html)
- Updated cache-busting query parameters to match version

### Added
- Error Boundary component with "Try Again", "Reload", and "Clear Data" recovery options
- CHANGELOG.md for tracking changes

## [1.9.8] - 2025-12-XX

### Fixed
- Bucket collapse toggle now works on first click (#3)
- Dasher collapse/expand state persistence

## [1.9.7] - 2025-12-XX

### Fixed
- Critical localStorage persistence fix with dual-write system (localStorage + IndexedDB)
- Documentation overhaul

## [1.9.6] - 2025-XX-XX

### Fixed
- JSON import infinite spinner hang
- Dasher edit form inconsistency across categories

### Added
- CSV export functionality for dashers

## [1.9.5] - 2025-XX-XX

### Changed
- Enhanced auto-save functionality
- Updated collapse/expand logic

## [1.9.4] - 2025-XX-XX

### Changed
- Refactored code structure for improved readability and maintainability
- Extracted shared updateDasherBalance helper function

### Fixed
- ReferenceError for updateListField in toggleEditDasher
- Improved dasher prop comparison and null checks

## [1.9.3] - 2025-XX-XX

### Added
- UMD bundles for react-window and react production build
- Performance optimization proposal for Dash Bash app

### Fixed
- Clear button now immediately clears dasher search filter
- Prevent decimal forcing in balance input during typing

### Changed
- Converted arrow functions to function declarations for time formatting
