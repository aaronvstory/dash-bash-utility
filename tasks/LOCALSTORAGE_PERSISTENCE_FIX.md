# LocalStorage Persistence Fix Plan

**Branch:** `fix/localstorage-persistence`
**Priority:** Critical
**Estimated Effort:** Medium
**Last Updated:** 2025-12-28

---

## AI Review Summary (Gemini + Codex)

### Pre-Implementation Review (2025-12-28)
> **Report:** `.claude/research/dualcheck/2025-12-28_054751.md`
> **Issues Identified:** 15 total (1 CRITICAL, 6 HIGH, 6 MEDIUM, 2 LOW)
> **All issues addressed in v1.9.7 implementation**

### Post-Implementation Review (2025-12-28 06:11)
> **Report:** `.claude/research/dualcheck/2025-12-28_061116.md`
> **Result: PASS** ✅
> **Issues Found:** 2 LOW (advisory only, no action required)
> **Codex:** Unavailable (model restrictions)

#### Gemini Assessment:
> "This persistence fix implementation for the Dash Bash Utility PWA is exceptionally robust and adheres very well to modern best practices for browser storage in 2025."

#### Advisory Notes (LOW - No Action Required):
1. **IndexedDB Schema Versioning** - `IDB_VERSION` vs `CURRENT_SCHEMA_VERSION` distinction is intentional
2. **Client-Side Storage** - App data (messages, addresses, dashers) is appropriate for localStorage/IDB

---

### Original Issues (All Resolved):
1. ~~**[CRITICAL]** beforeunload is unreliable~~ → ✅ `visibilitychange` is now PRIMARY
2. ~~**[HIGH]** Add save coordination layer~~ → ✅ `coordinatedSave` implemented
3. ~~**[HIGH]** Memoize `buildStateObject`~~ → ✅ `useCallback` applied
4. ~~**[HIGH]** Use singleton pattern for IndexedDB~~ → ✅ Singleton with connection pooling
5. ~~**[HIGH]** Increase debounce to 500ms~~ → ✅ 500ms debounce
6. ~~**[MEDIUM]** Add `storage` event listener~~ → ✅ Multi-tab awareness
7. ~~**[MEDIUM]** Add schema version validation~~ → ✅ `CURRENT_SCHEMA_VERSION = 5`
8. ~~**[MEDIUM]** `QuotaExceededError` handling~~ → ✅ IDB fallback mode
9. ~~**[LOW]** Stabilize callbacks with `useCallback`~~ → ✅ All handlers memoized

---

## Problem Statement

Users report that changes made in the app are lost when closing and reopening the browser. The same data works correctly when imported on the GitHub Pages hosted version. Auto-save appears to be configured but is not reliable.

## Root Cause Analysis

### Current Implementation (dash-bash-component.jsx)

1. **`saveAllToLocalStorage()`** (line ~1959)
   - Manual save function that serializes state to `dashBashState` key
   - Called throughout codebase after user actions
   - Has try/catch for quota errors

2. **`requestPersist()`** (line ~2032)
   - Debounced save using `requestIdleCallback` with 500ms timeout
   - Falls back to `setTimeout(250ms)` if `requestIdleCallback` unavailable

3. **Auto-save useEffect** (line ~2056-2060)
   - Only ONE useEffect exists for auto-saving
   - Only watches `collapsedDashers` state
   - Core data (dasherCategories, messages, etc.) has NO auto-save useEffect

### Critical Gaps Identified

| Gap | Impact | Severity |
|-----|--------|----------|
| No `beforeunload` handler | Page close loses pending saves | **CRITICAL** |
| No `visibilitychange` handler | Tab switch doesn't trigger save | **HIGH** |
| No `pagehide` handler | Mobile Safari loses data | **HIGH** |
| Only 1 auto-save useEffect | Most state changes don't auto-save | **CRITICAL** |
| Debounced saves (500ms) | User can close before save fires | **MEDIUM** |
| No save confirmation UI | User unaware if save failed | **LOW** |
| No multi-tab awareness | Tabs can overwrite each other's data | **MEDIUM** |

### Why It Works on GitHub Pages

The hosted version may have:
- Different caching behavior
- User habits (longer sessions, manual exports)
- Coincidental timing (saves complete before close)

The core bug exists in both but manifests more on local due to development patterns (frequent refreshes).

---

## Solution Design

### Phase 0: Save Coordination Layer (NEW - addresses race conditions)

Add a centralized save manager to prevent concurrent writes.

```javascript
// Save coordination - prevents race conditions
const saveInFlightRef = useRef(false);
const pendingSaveRef = useRef(false);
const saveVersionRef = useRef(0);

const coordinatedSave = useCallback(async () => {
  // If save is in flight, mark as pending and return
  if (saveInFlightRef.current) {
    pendingSaveRef.current = true;
    return;
  }

  saveInFlightRef.current = true;
  const currentVersion = ++saveVersionRef.current;

  try {
    await saveAllToLocalStorage();
  } finally {
    saveInFlightRef.current = false;

    // If another save was requested while we were saving, do it now
    if (pendingSaveRef.current) {
      pendingSaveRef.current = false;
      // Only proceed if no newer version was requested
      if (currentVersion === saveVersionRef.current) {
        coordinatedSave();
      }
    }
  }
}, [saveAllToLocalStorage]);
```

### Phase 1: Emergency Save Handlers (Critical)

Add event handlers to save data before page closes.

#### 1.1 Add `visibilitychange` Handler (PRIMARY emergency save)

> **AI Note:** This is now the PRIMARY emergency save - more reliable than beforeunload

```javascript
// Memoize the handler to prevent listener re-attachment
const handleVisibilityChange = useCallback(() => {
  if (document.visibilityState === "hidden") {
    // Tab is being hidden - save IMMEDIATELY (no debounce)
    try {
      const state = buildStateObject();
      localStorage.setItem("dashBashState", JSON.stringify(state));
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Emergency save on visibility change failed:", err);
    }
  }
}, [buildStateObject]);

useEffect(() => {
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [handleVisibilityChange]);
```

#### 1.2 Add `beforeunload` Handler (BACKUP - keep minimal)

> **AI Note:** Keep this minimal - browsers may block heavy operations

```javascript
const handleBeforeUnload = useCallback((e) => {
  // Synchronous save - must complete before page closes
  try {
    const state = buildStateObject();
    localStorage.setItem("dashBashState", JSON.stringify(state));
  } catch (err) {
    console.error("Emergency save failed:", err);
  }

  // Show warning if unsaved changes (increases save likelihood)
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = "You have unsaved changes.";
  }
}, [buildStateObject, hasUnsavedChanges]);

useEffect(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [handleBeforeUnload]);
```

#### 1.3 Add `pagehide` Handler (Mobile Safari)

```javascript
const handlePageHide = useCallback((e) => {
  if (e.persisted) return; // Page is being cached, not closed
  try {
    const state = buildStateObject();
    localStorage.setItem("dashBashState", JSON.stringify(state));
  } catch (err) {
    console.error("Emergency save on pagehide failed:", err);
  }
}, [buildStateObject]);

useEffect(() => {
  window.addEventListener("pagehide", handlePageHide);
  return () => window.removeEventListener("pagehide", handlePageHide);
}, [handlePageHide]);
```

### Phase 2: Comprehensive Auto-Save

#### 2.1 Memoized State Builder (NEW - addresses dependency explosion)

```javascript
// Memoize the state builder function
const buildStateObject = useCallback(() => {
  return {
    // Core data
    dasherCategories,
    archivedDashers,
    deactivatedDashers,
    readyDashers,
    currentlyUsingDashers,
    appealedDashers,
    lockedDashers,
    appliedPendingDashers,
    reverifDashers,
    // Other important data
    messages,
    categories,
    noteCategories,
    prices,
    target,
    targetPreset,
    // Collapse states
    collapsedDashers,
    collapsedDasherCategories,
    collapsedCategories,
    collapsedStores,
    collapsedNoteCategories,
    collapsedNotesInStores,
    collapsedNotesInDashers,
    collapsedCashOutHistory,
    // Metadata
    timestamp: new Date().toISOString(),
    schemaVersion: 5,
  };
}, [
  dasherCategories, archivedDashers, deactivatedDashers, readyDashers,
  currentlyUsingDashers, appealedDashers, lockedDashers, appliedPendingDashers,
  reverifDashers, messages, categories, noteCategories, prices, target,
  targetPreset, collapsedDashers, collapsedDasherCategories, collapsedCategories,
  collapsedStores, collapsedNoteCategories, collapsedNotesInStores,
  collapsedNotesInDashers, collapsedCashOutHistory
]);
```

#### 2.2 Core Data Auto-Save (with longer debounce)

> **AI Note:** Increased debounce to 500ms to reduce main thread blocking

```javascript
// Track if we have unsaved changes
useEffect(() => {
  setHasUnsavedChanges(true);
}, [buildStateObject]);

// Auto-save when state changes (debounced)
useEffect(() => {
  // Skip during imports
  if (isImporting) return;

  // 500ms debounce - balances responsiveness vs main thread blocking
  const timeoutId = setTimeout(() => {
    coordinatedSave();
    setHasUnsavedChanges(false);
  }, 500);

  return () => clearTimeout(timeoutId);
}, [buildStateObject, isImporting, coordinatedSave]);
```

### Phase 3: IndexedDB Backup Storage (Redundancy)

#### 3.1 Singleton IndexedDB Connection (NEW - addresses connection leak)

> **AI Note:** Cache DB connection instead of opening on every save

```javascript
// IndexedDB singleton - inline in component or separate module
const DB_NAME = 'DashBashDB';
const STORE_NAME = 'appState';
const DB_VERSION = 1;

// Singleton connection
let dbInstance = null;
let dbPromise = null;

function getDB() {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
    request.onsuccess = () => {
      dbInstance = request.result;
      // Handle connection closing unexpectedly
      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };
      resolve(dbInstance);
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });

  return dbPromise;
}

async function saveToIDB(key, value) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed:', err);
    return false;
  }
}

async function loadFromIDB(key) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB load failed:', err);
    return null;
  }
}
```

#### 3.2 Dual-Write Strategy with QuotaExceededError Handling

> **AI Note:** Added explicit quota error handling and IDB fallback

```javascript
const [localStorageDisabled, setLocalStorageDisabled] = useState(false);

const saveAllToLocalStorage = useCallback(async () => {
  if (isImporting) return;

  try {
    const state = buildStateObject();
    const stateJson = JSON.stringify(state);

    // Primary: localStorage (synchronous, fast) - unless disabled
    if (!localStorageDisabled) {
      try {
        localStorage.setItem("dashBashState", stateJson);
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.warn("localStorage quota exceeded, switching to IndexedDB-only mode");
          setLocalStorageDisabled(true);
          setSaveNotification("Storage full - using backup storage");
        } else {
          throw e;
        }
      }
    }

    // Secondary: IndexedDB (async, reliable backup) - await with timeout
    try {
      await Promise.race([
        saveToIDB("dashBashState", state),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('IDB timeout')), 5000)
        )
      ]);
    } catch (err) {
      console.warn("IndexedDB backup failed:", err);
    }

    // Update last saved indicator
    setLastSavedAt(new Date());

  } catch (e) {
    console.error("Save failed:", e);
    setSaveNotification("Failed to save data");
    announceFailure("Failed to save data");
  }
}, [buildStateObject, isImporting, localStorageDisabled]);
```

#### 3.3 Smart Load on Startup with Schema Validation

> **AI Note:** Added schema version comparison before applying state

```javascript
const CURRENT_SCHEMA_VERSION = 5;

// In initialization useEffect
useEffect(() => {
  const loadState = async () => {
    let localData = null;
    let idbData = null;

    try {
      const localRaw = localStorage.getItem("dashBashState");
      if (localRaw) {
        localData = JSON.parse(localRaw);
      }
    } catch (err) {
      console.warn("localStorage parse failed (may be corrupted):", err);
    }

    try {
      idbData = await loadFromIDB("dashBashState");
    } catch (err) {
      console.warn("IndexedDB load failed:", err);
    }

    // Compare timestamps, use most recent
    const localTime = localData?.timestamp ? new Date(localData.timestamp) : new Date(0);
    const idbTime = idbData?.timestamp ? new Date(idbData.timestamp) : new Date(0);

    const state = idbTime > localTime ? idbData : localData;

    if (state) {
      // Schema version validation
      const stateVersion = state.schemaVersion || 1;

      if (stateVersion > CURRENT_SCHEMA_VERSION) {
        console.warn(`State has newer schema (${stateVersion} > ${CURRENT_SCHEMA_VERSION}). Loading may fail.`);
        setSaveNotification("Warning: Data from newer app version");
      }

      // Migrate older schemas if needed
      if (stateVersion < CURRENT_SCHEMA_VERSION) {
        migrateState(state, stateVersion, CURRENT_SCHEMA_VERSION);
      }

      // Apply state...
      applyLoadedState(state);
    }
  };

  loadState();
}, []);
```

### Phase 4: Multi-Tab Awareness (NEW)

> **AI Note:** Prevents tabs from overwriting each other's data

```javascript
useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === "dashBashState" && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue);
        const newTime = new Date(newState.timestamp);
        const currentTime = lastSavedAt || new Date(0);

        if (newTime > currentTime) {
          // Another tab has newer data
          setSaveNotification("Data updated from another tab");
          // Option 1: Auto-reload
          // applyLoadedState(newState);
          // Option 2: Notify user
          if (confirm("Another tab has updated the data. Reload to see changes?")) {
            window.location.reload();
          }
        }
      } catch (err) {
        console.warn("Failed to parse storage event:", err);
      }
    }
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, [lastSavedAt]);
```

### Phase 5: Visual Feedback

#### 5.1 Last Saved Indicator

```javascript
const [lastSavedAt, setLastSavedAt] = useState(null);

// In UI (near the State Management section header):
{lastSavedAt && (
  <span className="text-xs text-gray-500">
    Last saved: {formatRelativeTime(lastSavedAt)}
  </span>
)}
```

#### 5.2 Unsaved Changes Warning

```javascript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

// In beforeunload handler:
if (hasUnsavedChanges) {
  e.preventDefault();
  e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
}
```

---

## Implementation Checklist

### Phase 0: Save Coordination (NEW - Do First)
- [x] Add `saveInFlightRef`, `pendingSaveRef`, `saveVersionRef` refs
- [x] Create `coordinatedSave` wrapper function
- [x] Replace direct `saveAllToLocalStorage` calls with `coordinatedSave` (via requestPersist)

### Phase 1: Emergency Handlers
- [x] Memoize `buildStateObject` with `useCallback`
- [x] Add `visibilitychange` handler (PRIMARY emergency save)
- [x] Add `beforeunload` handler (BACKUP, minimal)
- [x] Add `pagehide` handler for mobile
- [x] Stabilize all handlers with `useCallback`
- [ ] Test: close tab immediately after making change
- [ ] Test: switch tabs and return

### Phase 2: Auto-Save
- [x] Add comprehensive auto-save watching `buildStateObject`
- [x] Use 500ms debounce (not 100ms)
- [x] Track `hasUnsavedChanges` state
- [x] Add console logging for debugging saves
- [ ] Test: make change, wait, refresh without manual save

### Phase 3: IndexedDB
- [x] Implement singleton pattern for IDB connection
- [x] Add `QuotaExceededError` handling with IDB fallback
- [x] Add schema version validation on load
- [x] Add IDB write timeout (5s)
- [ ] Test: clear localStorage, verify IDB recovery
- [ ] Test: quota exceeded scenarios (simulate with small quota)

### Phase 4: Multi-Tab Awareness (NEW)
- [x] Add `storage` event listener
- [x] Handle newer data from other tabs
- [ ] Test: open two tabs, make changes in one, verify notification

### Phase 5: Visual Feedback
- [x] Add `lastSavedAt` state
- [x] Add relative time display in UI (State Management section header)
- [x] Add unsaved changes warning on close
- [N/A] Add manual "Save Now" button (optional) - already exists

---

## Files to Modify

| File | Changes |
|------|---------|
| `dash-bash-component.jsx` | Add save coordination, event handlers, auto-save useEffects, IndexedDB integration, multi-tab handling |
| `dash-bash-compiled.js` | Rebuild after JSX changes |

---

## Testing Plan

1. **Basic Save Test**
   - Make a change (add a dasher)
   - Close browser immediately
   - Reopen - verify change persists

2. **Tab Switch Test**
   - Make a change
   - Switch to another tab
   - Close browser from other tab
   - Reopen - verify change persists

3. **Mobile Test**
   - Make a change on mobile
   - Switch apps / lock phone
   - Return to app - verify change persists

4. **Stress Test**
   - Make rapid changes
   - Close immediately
   - Verify all changes saved

5. **Recovery Test**
   - Clear localStorage manually
   - Verify IndexedDB backup restores data

6. **Multi-Tab Test** (NEW)
   - Open two tabs
   - Make changes in tab A
   - Verify tab B gets notified
   - Make changes in tab B, close tab A
   - Verify tab B data persists

7. **Quota Test** (NEW)
   - Simulate localStorage full (fill with dummy data)
   - Make app changes
   - Verify IndexedDB fallback works

8. **Background Tab Test** (NEW)
   - Make change
   - Leave tab in background for 2+ minutes
   - Close browser
   - Verify data persisted (timers clamped in background)

9. **Corruption Recovery Test** (NEW)
   - Manually corrupt localStorage JSON
   - Reload app
   - Verify IDB backup restores or graceful degradation

---

## Rollback Plan

If issues arise:
1. Revert to main branch
2. All changes are in single commit on this branch
3. No database migrations needed (additive changes only)

---

## Notes

- IndexedDB requires HTTPS or localhost (already satisfied)
- Private browsing may disable IndexedDB - localStorage fallback handles this
- Estimated localStorage size for typical user: ~100KB-500KB (well under 5MB limit)
- Background tabs have timers clamped to 1s+ by browsers - rely on visibilitychange for saves
- visibilitychange is more reliable than beforeunload for emergency saves
