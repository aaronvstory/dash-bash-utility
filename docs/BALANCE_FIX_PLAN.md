# Plan: Fix Balance Editing in All Categories

**Task:** Fix balance editing bug so it works in ALL categories (not just DASHERS)
**Branch:** `fix/balance-editing-all-categories`
**Date:** 2026-01-11
**Status:** Ready for implementation

---

## Root Cause Analysis

### The Bug
`toggleEditDasher` (line 7219) calls `updateDasher()` which ONLY updates `dasherCategories` state. Non-DASHERS categories (APPEALED, USING, Ready, etc.) render from **separate bucket arrays** (`appealedDashers`, `readyDashers`, etc.) which never get updated.

### Why DASHERS Works
DASHERS renders dashers directly from `dasherCategories`, so `updateDasher()` correctly updates the displayed data.

### Why Other Categories Fail
Other categories render from bucket arrays (e.g., `readyDashers`), but `updateDasher()` updates `dasherCategories` instead. The UI state is never updated, so balance appears to revert.

---

## The Fix

### Single Line Change

**File:** `F:\claude\dash-bash\dash-bash-component.jsx`
**Line:** 7219

```javascript
// BEFORE:
updateDasher(categoryId, dasherId, "balance", editingBalanceValue);

// AFTER:
updateDasherEverywhere(dasherId, { balance: editingBalanceValue });
```

### Why This Works
`updateDasherEverywhere` (lines 7298-7406) updates:
- `dasherCategories` (DASHERS and subcategories)
- ALL bucket arrays: `readyDashers`, `currentlyUsingDashers`, `appealedDashers`, `reverifDashers`, `lockedDashers`, `appliedPendingDashers`, `deactivatedDashers`, `archivedDashers`
- Also handles balance parsing, delta calculation, and `earningsHistory`
- Calls `requestPersist()` for save queuing

---

## Implementation Steps

### Step 1: Make the Fix
Edit line 7219 in `dash-bash-component.jsx`:
- Find: `updateDasher(categoryId, dasherId, "balance", editingBalanceValue);`
- Replace with: `updateDasherEverywhere(dasherId, { balance: editingBalanceValue });`

### Step 2: Build
```bash
cd F:\claude\dash-bash
npm run build
```

### Step 3: Test All Categories
```bash
python serve-pwa.py
# Open http://localhost:8443
```

**Test each category:**
| Category | Action | Expected |
|----------|--------|----------|
| DASHERS (regression) | Edit balance $0 → $50 | Shows $50.00, persists |
| Ready | Edit balance $0 → $30 | Shows $30.00, persists |
| USING | Edit balance $0 → $25 | Shows $25.00, persists |
| APPEALED | Edit balance $0 → $40 | Shows $40.00, persists |
| Applied/Pending | Edit balance | Persists |
| Reverif | Edit balance | Persists |
| Locked | Edit balance | Persists |
| Deactivated | Edit balance | Persists |
| Archived | Edit balance | Persists |

### Step 4: Test Persistence
1. Edit balance in APPEALED to $100
2. Close browser tab immediately
3. Reopen - verify $100.00 persisted

### Step 5: Version Update & Deploy
```bash
npm run version:update -- 1.11.2
npm run deploy
```

---

## Files to Modify

1. **`dash-bash-component.jsx`** - Line 7219 (THE FIX)
2. **`CHANGELOG.md`** - Document the fix
3. **`docs/UI_NAVIGATION_TESTING_GUIDE.md`** - Update bug status to "Fixed"

---

## Verification Checklist

- [ ] Line 7219 changed to use `updateDasherEverywhere`
- [ ] `npm run build` succeeds
- [ ] DASHERS balance editing still works (regression)
- [ ] Ready category balance editing works
- [ ] APPEALED category balance editing works
- [ ] All other categories work
- [ ] Balance persists after page reload
- [ ] Title updates with new balance
- [ ] No console errors

---

## Related Documentation

- **`docs/CATEGORY_ARCHITECTURE_ANALYSIS.md`** - Deep dive into the dual-state architecture
- **`docs/UI_NAVIGATION_TESTING_GUIDE.md`** - Complete UI testing procedures

---

## Next Task After This Fix

The following features require the architectural refactoring documented in `CATEGORY_ARCHITECTURE_ANALYSIS.md`:

1. **Add custom top-level categories** (like DASHERS, APPEALED, etc.)
2. **Enable drag-drop in other categories**
3. **Enable subcategories in other categories**

These are tracked separately and will build on the unified category registry pattern described in the analysis document.
