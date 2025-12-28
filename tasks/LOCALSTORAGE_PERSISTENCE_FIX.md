# LocalStorage Persistence Fix Plan

**Branch:** `fix/localstorage-persistence`
**Priority:** Critical
**Estimated Effort:** Medium

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

### Why It Works on GitHub Pages

The hosted version may have:
- Different caching behavior
- User habits (longer sessions, manual exports)
- Coincidental timing (saves complete before close)

The core bug exists in both but manifests more on local due to development patterns (frequent refreshes).

---

## Solution Design

### Phase 1: Emergency Save Handlers (Critical)

Add event handlers to save data before page closes.

#### 1.1 Add `beforeunload` Handler

```javascript
// Add near other useEffects (around line 2060)
useEffect(() => {
  const handleBeforeUnload = (e) => {
    // Synchronous save - must complete before page closes
    try {
      const state = buildStateObject(); // Extract state building to reusable function
      localStorage.setItem("dashBashState", JSON.stringify(state));
    } catch (err) {
      console.error("Emergency save failed:", err);
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [/* all state dependencies */]);
```

#### 1.2 Add `visibilitychange` Handler

```javascript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      // Tab is being hidden - save immediately
      saveAllToLocalStorage();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [saveAllToLocalStorage]);
```

#### 1.3 Add `pagehide` Handler (Mobile Safari)

```javascript
useEffect(() => {
  const handlePageHide = (e) => {
    if (e.persisted) return; // Page is being cached, not closed
    saveAllToLocalStorage();
  };

  window.addEventListener("pagehide", handlePageHide);
  return () => window.removeEventListener("pagehide", handlePageHide);
}, [saveAllToLocalStorage]);
```

### Phase 2: Comprehensive Auto-Save

Add useEffect watchers for all critical state.

#### 2.1 Core Data Auto-Save

```javascript
// Auto-save when ANY critical data changes
useEffect(() => {
  // Skip initial mount and during imports
  if (isImporting) return;

  // Debounce to avoid excessive writes
  const timeoutId = setTimeout(() => {
    saveAllToLocalStorage();
  }, 100); // Short debounce - just prevents rapid-fire saves

  return () => clearTimeout(timeoutId);
}, [
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
  // Collapse states (already partially handled)
  collapsedDashers,
  collapsedDasherCategories,
  // ... other collapse states
]);
```

### Phase 3: IndexedDB Backup Storage (Redundancy)

Add a secondary storage mechanism for reliability.

#### 3.1 IndexedDB Wrapper

Create new file `indexeddb-storage.js`:

```javascript
const DB_NAME = 'DashBashDB';
const STORE_NAME = 'appState';
const DB_VERSION = 1;

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveToIDB(key, value) {
  try {
    const db = await openDB();
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

export async function loadFromIDB(key) {
  try {
    const db = await openDB();
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

#### 3.2 Dual-Write Strategy

Modify `saveAllToLocalStorage` to write to both:

```javascript
const saveAllToLocalStorage = async () => {
  if (isImporting) return;

  try {
    const state = {
      // ... existing state object
      timestamp: new Date().toISOString(),
      schemaVersion: 5,
    };

    // Primary: localStorage (synchronous, fast)
    localStorage.setItem("dashBashState", JSON.stringify(state));

    // Secondary: IndexedDB (async, reliable backup)
    saveToIDB("dashBashState", state).catch(err => {
      console.warn("IndexedDB backup failed:", err);
    });

    // Update last saved indicator
    setLastSavedAt(new Date());

  } catch (e) {
    setSaveNotification("Failed to save data");
    announceFailure("Failed to save data");
  }
};
```

#### 3.3 Smart Load on Startup

```javascript
// In initialization useEffect
useEffect(() => {
  const loadState = async () => {
    const localData = localStorage.getItem("dashBashState");
    const idbData = await loadFromIDB("dashBashState");

    // Compare timestamps, use most recent
    const localTime = localData ? new Date(JSON.parse(localData).timestamp) : new Date(0);
    const idbTime = idbData?.timestamp ? new Date(idbData.timestamp) : new Date(0);

    const state = idbTime > localTime ? idbData : JSON.parse(localData);

    if (state) {
      // Apply state...
    }
  };

  loadState();
}, []);
```

### Phase 4: Visual Feedback

#### 4.1 Last Saved Indicator

Add state and display:

```javascript
const [lastSavedAt, setLastSavedAt] = useState(null);

// In UI (near the State Management section header):
{lastSavedAt && (
  <span className="text-xs text-gray-500">
    Last saved: {formatRelativeTime(lastSavedAt)}
  </span>
)}
```

#### 4.2 Unsaved Changes Warning

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

### Phase 1: Emergency Handlers (Do First)
- [ ] Extract state building to reusable `buildStateObject()` function
- [ ] Add `beforeunload` event handler with synchronous save
- [ ] Add `visibilitychange` event handler
- [ ] Add `pagehide` event handler for mobile
- [ ] Test: close tab immediately after making change
- [ ] Test: switch tabs and return

### Phase 2: Auto-Save
- [ ] Add comprehensive useEffect watching all critical state
- [ ] Reduce debounce time from 500ms to 100ms
- [ ] Add console logging for debugging saves
- [ ] Test: make change, wait, refresh without manual save

### Phase 3: IndexedDB
- [ ] Create IndexedDB wrapper (inline in JSX or separate file bundled)
- [ ] Modify `saveAllToLocalStorage` to dual-write
- [ ] Modify initialization to load from best source
- [ ] Test: clear localStorage, verify IDB recovery
- [ ] Test: quota exceeded scenarios

### Phase 4: Visual Feedback
- [ ] Add `lastSavedAt` state
- [ ] Add relative time display in UI
- [ ] Add unsaved changes warning on close
- [ ] Add manual "Save Now" button (optional)

---

## Files to Modify

| File | Changes |
|------|---------|
| `dash-bash-component.jsx` | Add event handlers, auto-save useEffects, IndexedDB integration |
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
