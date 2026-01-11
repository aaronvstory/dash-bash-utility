# Category Architecture Analysis

**Purpose:** Deep analysis of how categories work in Dash Bash, documenting the dual-state architecture for future refactoring.
**Date:** 2026-01-11
**Status:** Analysis complete; informs future work on custom categories and drag-drop

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current Architecture](#current-architecture)
3. [DASHERS vs Other Categories](#dashers-vs-other-categories)
4. [State Management Deep Dive](#state-management-deep-dive)
5. [Key Functions](#key-functions)
6. [Future Work Requirements](#future-work-requirements)
7. [Recommended Refactoring Path](#recommended-refactoring-path)

---

## Executive Summary

The app uses a **dual-state architecture**:

1. **`dasherCategories`** - Array of category objects with nested dashers (used by DASHERS)
2. **Bucket Arrays** - Separate flat arrays for each top-level category (`readyDashers`, `appealedDashers`, etc.)

This creates several limitations:
- Adding new top-level categories requires adding new state variables
- Drag-drop only works in DASHERS (uses different data structure)
- Subcategories only exist in DASHERS
- Updates must sync across both systems via `updateDasherEverywhere`

---

## Current Architecture

### State Variables Overview

```javascript
// SYSTEM A: Nested categories (DASHERS uses this)
const [dasherCategories, setDasherCategories] = useState([
  { id: "main", name: "Main", dashers: [...] },
  { id: "currently-using", name: "Currently using", dashers: [...] },
  { id: "locked", name: "Locked", dashers: [...] },
  { id: "reverif", name: "Reverif", dashers: [...] },
  { id: "ready", name: "Ready", dashers: [...] },
  // User can add custom subcategories here
]);

// SYSTEM B: Flat bucket arrays (other top-level categories use these)
const [readyDashers, setReadyDashers] = useState([]);
const [currentlyUsingDashers, setCurrentlyUsingDashers] = useState([]);
const [appealedDashers, setAppealedDashers] = useState([]);
const [reverifDashers, setReverifDashers] = useState([]);
const [lockedDashers, setLockedDashers] = useState([]);
const [appliedPendingDashers, setAppliedPendingDashers] = useState([]);
const [deactivatedDashers, setDeactivatedDashers] = useState([]);
const [archivedDashers, setArchivedDashers] = useState([]);
```

### Persistence (buildStateObject)

Both systems are persisted together in localStorage:
```javascript
// Lines 2348-2410
const buildStateObject = () => ({
  dasherCategories,        // System A
  readyDashers,            // System B
  currentlyUsingDashers,   // System B
  appealedDashers,         // System B
  reverifDashers,          // System B
  lockedDashers,           // System B
  appliedPendingDashers,   // System B
  deactivatedDashers,      // System B
  archivedDashers,         // System B
  // ... other app state
});
```

---

## DASHERS vs Other Categories

### DASHERS Category (Special)

| Feature | Status | How It Works |
|---------|--------|--------------|
| Subcategories | ✅ Supported | Categories within `dasherCategories` array |
| Add custom subcategories | ✅ Supported | Push new object to `dasherCategories` |
| Drag-drop dashers | ✅ Supported | Between subcategories via category reordering |
| Balance editing | ✅ Works | `updateDasher` updates `dasherCategories` directly |
| Icon | Custom | Lucide `Users` icon |

**Rendering:** Lines 12867-13422
```javascript
{dasherCategories.map((category) => (
  // Each subcategory renders its dashers
  // Drag-drop handlers attached
))}
```

### Other Categories (Bucket-Based)

| Feature | Status | Why |
|---------|--------|-----|
| Subcategories | ❌ Not supported | Flat array structure |
| Add new categories | ❌ Hardcoded | Requires new state variable |
| Drag-drop dashers | ❌ Not supported | Different data structure |
| Balance editing | 🔧 Fixed in v1.11.2 | Now uses `updateDasherEverywhere` |
| Icons | Hardcoded | Each category has its own icon in UI code |

**Rendering (example: APPEALED):** Lines 13943-14255
```javascript
{appealedDashers.map((dasher) => (
  // Flat list, no subcategories
  // No drag-drop handlers
))}
```

---

## State Management Deep Dive

### The Synchronization Problem

When a dasher is edited, both systems need to be updated:

```
Edit in DASHERS    →  updateDasher()           →  Only updates dasherCategories ✓
Edit in APPEALED   →  updateDasher()           →  Only updates dasherCategories ✗
                                                   (but UI reads from appealedDashers!)
```

**The Fix (v1.11.2):** Use `updateDasherEverywhere()` which updates both:

```javascript
const updateDasherEverywhere = useCallback((dasherId, updates) => {
  // Update dasherCategories
  setDasherCategories(prev => /* find and update dasher */);

  // Update ALL bucket arrays
  updateBucketArray(readyDashers, setReadyDashers);
  updateBucketArray(currentlyUsingDashers, setCurrentlyUsingDashers);
  updateBucketArray(appealedDashers, setAppealedDashers);
  // ... all 8 bucket arrays

  requestPersist();
}, [dependencies]);
```

### Dasher Object Schema

```javascript
{
  id: "unique-id",
  name: "John Doe",
  email: "john@example.com",
  emailPassword: "password123",
  dasherPassword: "dasher456",
  phone: "555-1234",
  balance: "50.00",           // String or number
  crimson: false,
  redCard: true,
  appealed: true,             // Flags which categories it appears in
  fastPay: false,
  lastUsed: "2026-01-10T12:00:00Z",
  earningsHistory: [
    { amount: 25, at: "2026-01-09T15:30:00Z", source: "balance-edit" }
  ],
  notes: "Some notes",
  lastEditedAt: "2026-01-11T10:00:00Z"
}
```

---

## Key Functions

### `updateDasher` (Lines 6849-6963)
- Updates ONLY `dasherCategories`
- Works for DASHERS subcategories
- **Does NOT update bucket arrays**

### `updateDasherEverywhere` (Lines 7298-7406)
- Updates `dasherCategories` AND all bucket arrays
- Handles balance parsing and earningsHistory
- Calls `requestPersist()` for save

### `toggleEditDasher` (Lines 7210-7237)
- Entry/exit for edit mode
- Calls update function on exit (line 7219)
- **Fixed in v1.11.2 to use `updateDasherEverywhere`**

### Balance Parsing (Lines 4290-4301)
```javascript
function parseBalanceValue(raw) {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === "number") {
    return Math.max(-1000000, Math.min(1000000, raw));
  }
  const n = parseFloat(String(raw).replace(/[^0-9.\-]/g, ""));
  if (isNaN(n)) return 0;
  return Math.max(-1000000, Math.min(1000000, n));
}
```

---

## Future Work Requirements

### 1. Add Custom Top-Level Categories

**Current Limitation:** Categories are hardcoded as separate state variables.

**Requirement:**
- User clicks "Add Category" button
- Enters category name (e.g., "VIP")
- New category appears at same level as APPEALED, USING, etc.
- Dashers can be moved to/from new category
- Custom icon selection or auto-assignment

**Technical Challenge:**
- Need to refactor from hardcoded `appealedDashers`, etc. to dynamic registry
- OR add new state variables dynamically (not recommended in React)

### 2. Enable Drag-Drop in Other Categories

**Current Limitation:** Only DASHERS has drag-drop between subcategories.

**Requirement:**
- Drag dasher from APPEALED to USING
- Drag dasher from Ready to LOCKED
- Visual feedback during drag
- Automatic flag updates (e.g., set `appealed: false` when moved out)

**Technical Challenge:**
- Bucket arrays are flat; need to handle cross-array moves
- Flag management (which boolean flags to update)
- UI state synchronization

### 3. Enable Subcategories in Other Categories

**Current Limitation:** Only DASHERS has subcategories.

**Requirement:**
- Add subcategory within APPEALED (e.g., "Pending Review", "Approved")
- Drag dashers between subcategories within a top-level category
- Collapse/expand subcategories

**Technical Challenge:**
- Bucket arrays are flat; need nested structure
- OR use `dasherCategories` pattern for all top-level categories

---

## Recommended Refactoring Path

### Phase 1: Unified Category Registry (Foundation)

Replace dual-state with unified registry:

```javascript
const [categoryRegistry, setCategoryRegistry] = useState({
  dashers: {
    id: 'dashers',
    name: 'DASHERS',
    icon: 'Users',
    capabilities: {
      supportsSubcategories: true,
      supportsDasherDrag: true,
      supportsBalanceEdit: true,
      supportsTimers: true,
    },
    subcategories: [
      { id: 'main', name: 'Main', dashers: [...] },
      { id: 'locked', name: 'Locked', dashers: [...] },
    ],
    // OR for flat categories:
    dashers: [...],
  },
  appealed: {
    id: 'appealed',
    name: 'APPEALED',
    icon: 'AlertTriangle',
    capabilities: {
      supportsSubcategories: false,
      supportsDasherDrag: true,  // Enable after refactor
      supportsBalanceEdit: true,
      supportsTimers: true,
    },
    dashers: [...],
  },
  // ... other categories
  // Custom categories can be added here
});
```

### Phase 2: Dynamic Category Creation

```javascript
const addCategory = (name, icon, capabilities) => {
  const id = generateId();
  setCategoryRegistry(prev => ({
    ...prev,
    [id]: {
      id,
      name,
      icon,
      capabilities,
      dashers: [],
      isCustom: true,
    }
  }));
};
```

### Phase 3: Cross-Category Drag-Drop

```javascript
const moveDasher = (dasherId, fromCategoryId, toCategoryId) => {
  setCategoryRegistry(prev => {
    const dasher = findDasher(prev, fromCategoryId, dasherId);
    // Remove from source
    // Add to destination
    // Update boolean flags based on category type
    return newState;
  });
  requestPersist();
};
```

### Phase 4: Subcategories for All

Add `subcategories` array to any category that needs it:

```javascript
appealed: {
  capabilities: { supportsSubcategories: true },
  subcategories: [
    { id: 'pending', name: 'Pending Review', dashers: [...] },
    { id: 'approved', name: 'Approved', dashers: [...] },
  ],
}
```

---

## Line Number Reference

| What | File | Lines |
|------|------|-------|
| dasherCategories initialization | dash-bash-component.jsx | 1395-1449 |
| Bucket arrays initialization | dash-bash-component.jsx | 1232-1361 |
| updateDasher function | dash-bash-component.jsx | 6849-6963 |
| updateDasherEverywhere function | dash-bash-component.jsx | 7298-7406 |
| toggleEditDasher function | dash-bash-component.jsx | 7210-7237 |
| parseBalanceValue function | dash-bash-component.jsx | 4290-4301 |
| buildStateObject (persistence) | dash-bash-component.jsx | 2348-2410 |
| DASHERS rendering | dash-bash-component.jsx | 12867-13422 |
| APPEALED rendering | dash-bash-component.jsx | 13943-14255 |

---

## Summary

The current architecture evolved organically, with DASHERS getting special treatment (subcategories, drag-drop) while other categories remained flat bucket arrays. The v1.11.2 fix ensures balance editing works everywhere via `updateDasherEverywhere`, but deeper refactoring is needed for:

1. **Custom top-level categories** - Requires category registry pattern
2. **Cross-category drag-drop** - Requires unified data structure
3. **Subcategories everywhere** - Requires nested structure for all categories

The recommended approach is incremental: first unify the data model, then enable features one by one.
