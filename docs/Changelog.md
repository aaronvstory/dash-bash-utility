# Changelog

## v1.11.2 (January 2026)
- **Critical UX Fix**: Fixed balance input field not responding to keyboard input in Ready/USING categories. Users could only type one digit at a time. Root cause: DasherCard memoization wasn't checking `editingBalanceValue` prop.

## v1.11.1 (January 2026)
- **Bug Fix**: Balance editing now persists in all categories (Ready, USING, APPEALED, etc.), not just DASHERS. Fixed state synchronization issue.

## v1.11.0 (January 2026)
- **Performance Optimizations**: Search pre-caching (30-50% faster), background tab timer pause, statistics gating, Lucide icon optimization.
- **Custom Confirm Modal**: Replaced native browser confirm with accessible custom modal (WCAG compliant, Escape key support, backdrop dismiss).
- **Robustness**: Error handling in modal callbacks, IndexedDB failure handling, proper data persistence.
- **Bug Fixes**: Modal handler stale closures, requestPersist() in deleteDasherCategory.

## v1.10.0 (December 2025)
- Performance and stability improvements.
- Enhanced wiki documentation.

## v1.9.7 (December 2025)
- **Critical Persistence Fix**: Added `visibilitychange`, `beforeunload`, and `pagehide` handlers.
- **IndexedDB Backup**: Implemented dual-write strategy for redundancy.
- **Visual Feedback**: Added "Last Saved" indicator.

## v1.9.6 (October 2025)
- **GitHub Pages-Safe Release**: Eliminated CDN dependencies.
- **JSX Precompilation**: 98.4% reduction in HTML size.

## v1.8.6 (October 2025)
- Inline earnings and cash-out forms.
- Balance synchronization and clamping.

## v1.6.2 (January 2025)
- **Accessibility**: WCAG AA compliance.
- **Schema Migration**: Version 3 → 5 upgrade logic.

## v1.2.0 (January 2025)
- **UI Persistence**: Added expand/collapse state saving for all categories.
- **Address Book Enhancements**: Open/Closed status tracking.

## v1.0.0 (August 2025)
- Initial release with Target Calculator, Messages, Address Book, Notes, and Dashers.
