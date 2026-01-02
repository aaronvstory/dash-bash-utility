# Data Persistence Strategy

Reliability is the #1 priority for Dash Bash. Delivery drivers cannot afford to lose their earnings data or timers during a busy shift.

## Dual-Write Architecture
Dash Bash employs a redundant storage system to protect against browser crashes and storage limits.

1. **LocalStorage (Primary)**: 
   - Used for immediate synchronous access.
   - Best for small, frequently changing values like timers and collapse states.
2. **IndexedDB (Secondary/Backup)**:
   - Used for the full application state.
   - Provides much larger storage capacity (up to 80% of disk).
   - Serves as a recovery mechanism if `localStorage` is cleared or corrupted.

## Emergency Save Handlers
The app listens for multiple browser signals to ensure data is saved even if the user closes the tab abruptly:
- `visibilitychange`: Fires when the user switches tabs or minimizes the browser (the most reliable hook).
- `beforeunload`: Backup hook for desktop browsers.
- `pagehide`: Specialized hook for mobile browsers (iOS/Android) when the app is put in the background.

## Coordination & Debouncing
- **Coordinated Save**: A wrapper function (`coordinatedSave`) ensures that writes to both storage engines happen atomically.
- **Debounced Auto-Save**: Changes to state trigger a 500ms debounced save process, preventing excessive disk I/O while ensuring data is captured quickly.

## Data Schema Versioning
As the app evolves, the data schema is automatically migrated.
- Current Schema Version: **5**
- Migration Path: The app includes logic to upgrade older JSON exports (v1, v2) to the current format automatically during import.

## State Management Features
- **Cross-Tab Sync**: Uses the `storage` event to notify other open tabs when data changes.
- **Export/Import**: Full state can be exported to a JSON file for backup or transferring between devices.
- **Last Saved Indicator**: Provides visual confirmation of the last successful write operation.
