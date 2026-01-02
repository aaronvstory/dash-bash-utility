# Dash Bash Performance Fix Plan

**Created:** 2026-01-02
**Branch:** `fix/performance-optimizations`
**Status:** Ready for implementation

---

## Problem Statement

App became extremely slow with ~20-30 dashers, notes, and store info:
- Takes several seconds to open anything
- Search takes ~20 seconds
- Uses **6.5 GB+ RAM per tab** (11GB with two tabs)
- ~50% CPU per tab constantly
- Overall very sluggish

---

## Root Cause Analysis

### Confirmed via Chrome Automation Diagnostics

| Metric | Value | Significance |
|--------|-------|--------------|
| localStorage size | 49 KB | NOT the issue |
| JSON.parse time | 0.20 ms | NOT the issue |
| Total dashers | 54 | Moderate load |
| DOM nodes (expanded) | 7,457 | Significant |
| **DOM mutations during expand** | **13,080/sec** | 🔥 THE ISSUE |
| Lucide icons | 930 | Potential multiplier |

### The Core Problem

```text
User action (expand/search/type)
    ↓
setState() called
    ↓
17K-line monolithic component re-renders
    ↓
220 hooks re-evaluate dependencies
    ↓
930 Lucide icons potentially re-process
    ↓
13,000+ DOM mutations per second
    ↓
Memory allocated, not fully released
    ↓
Repeat × interactions = GB of RAM
```

### Key Insights from Analysis

1. **Raw JS operations are fast** (< 1ms) - not the bottleneck
2. **React re-render cascade** is the real issue (13K DOM mutations/sec)
3. **Memory compounds** with repeated expand/collapse/search cycles
4. **Two tabs = double everything** (confirmed via Task Manager)
5. **Idle state is stable** (~30 mutations/sec) - problem is during state changes

---

## Implementation Plan

### Phase 1: Quick Wins (Very Low Risk)

#### Fix #2: Pause Work in Background Tabs
**Risk:** Very Low | **Effort:** Low | **Impact:** High

**What:** Stop timers and heavy computation when tab is hidden

**Implementation:**
```javascript
// Add near top of EnhancedCalculator component
const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

useEffect(() => {
  const handleVisibilityChange = () => {
    setIsTabVisible(!document.hidden);
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);

// Then in DasherCard's timer useEffect (line ~492):
useEffect(() => {
  if (isCollapsed || !isTabVisible) return; // ADD: !isTabVisible check
  const id = setInterval(() => setLocalTick(t => t + 1), 1000);
  return () => clearInterval(id);
}, [isCollapsed, isTabVisible]); // ADD: isTabVisible to deps
```

**Files to modify:** `dash-bash-component.jsx`
- Add visibility state near other state declarations (~line 800)
- Pass `isTabVisible` to DasherCard component
- Update DasherCard timer logic (~line 492)

---

#### Fix #3: Gate Stats Behind isStatisticsOpen
**Risk:** Very Low | **Effort:** Low | **Impact:** Medium

**What:** Only compute stats when Statistics section is open

**Location:** Lines 5530-5650

**Implementation:**
```javascript
// Change dashersMeta from always computing to conditional
const dashersMeta = useMemo(() => {
  if (!isStatisticsOpen) return []; // ADD: early return

  const meta = [];
  // ... existing logic ...
  return meta;
}, [isStatisticsOpen, dasherCategories, readyDashers, ...]); // ADD: isStatisticsOpen

// Same pattern for earningEntries, cashOutEntries, etc.
const earningEntries = useMemo(() => {
  if (!isStatisticsOpen) return [];
  return collectDasherEvents(dashersMeta, "earningsHistory", ...);
}, [isStatisticsOpen, dashersMeta]);
```

**Files to modify:** `dash-bash-component.jsx`
- Lines 5530-5650: Add `isStatisticsOpen` guards to useMemo hooks

---

### Phase 2: High Impact (Low-Medium Risk)

#### Fix #1: Lazy-Mount Closed Sections
**Risk:** Low | **Effort:** Medium | **Impact:** HUGE

**What:** Don't render section contents until opened

**Current pattern:**
```javascript
{isDashersOpen && dashersRenderReady && (
  <div>{/* all dasher cards rendered */}</div>
)}
```

**Problem:** Cards are mounted but may not be fully unmounted on collapse

**Solution:** Ensure clean unmount pattern:
```javascript
// Option A: Simple conditional (verify unmount works)
{isDashersOpen ? (
  <DasherSection ... />
) : null}

// Option B: Use key to force remount
<div key={isDashersOpen ? 'open' : 'closed'}>
  {isDashersOpen && <DasherSection ... />}
</div>
```

**Files to modify:** `dash-bash-component.jsx`
- All section render conditionals (search for `renderReady`)
- Verify cleanup in useEffect return functions

---

#### Fix #4: Rework Lucide Icon Rendering
**Risk:** Low-Medium | **Effort:** Medium | **Impact:** Medium-High

**What:** Stop calling `lucide.createIcons()` on every Icon render

**Current code (lines 17-39):**
```javascript
const Icon = ({ name, size = 20, className = "" }) => {
  const iconRef = useRef(null);
  useEffect(() => {
    if (iconRef.current && window.lucide) {
      iconRef.current.innerHTML = "";
      const iconElement = document.createElement("i");
      iconElement.setAttribute("data-lucide", name);
      // ...
      iconRef.current.appendChild(iconElement);
      window.lucide.createIcons(); // THIS PROCESSES ALL 930 ICONS!
    }
  }, [name, size, className]);
  return React.createElement("span", { ref: iconRef });
};
```

**Problem:** `createIcons()` scans entire document, processes all icons

**Solution options:**
1. Pass `{ root: iconRef.current }` to only process this icon
2. Use Lucide React components directly (if available)
3. Memoize icons more aggressively

**Recommended fix:**
```javascript
const Icon = ({ name, size = 20, className = "" }) => {
  const iconRef = useRef(null);
  useEffect(() => {
    if (iconRef.current && window.lucide) {
      iconRef.current.innerHTML = "";
      const iconElement = document.createElement("i");
      iconElement.setAttribute("data-lucide", name);
      iconElement.className = className;
      if (size) {
        iconElement.setAttribute("width", size);
        iconElement.setAttribute("height", size);
      }
      iconRef.current.appendChild(iconElement);
      // Only process THIS icon, not all 930
      window.lucide.createIcons({ root: iconRef.current });
    }
  }, [name, size, className]);
  return React.createElement("span", { ref: iconRef });
};
```

**Files to modify:** `dash-bash-component.jsx`
- Lines 17-39: Update Icon component

---

#### Fix #5: Cache Store Search Text
**Risk:** Very Low | **Effort:** Low-Medium | **Impact:** High

**What:** Pre-compute search text when stores change, not on every keystroke

**Location:** Lines 969-1025 (`buildStoreSearchText`)

**Implementation:**
```javascript
// Add cached search text to store objects
const categoriesWithSearchText = useMemo(() => {
  return categories.map(category => ({
    ...category,
    stores: (category.stores || []).map(store => ({
      ...store,
      _searchText: buildStoreSearchText(category, store) // Pre-compute
    }))
  }));
}, [categories]); // Only recompute when categories change

// Then in filteredStoreCategories, use _searchText instead of rebuilding
const filteredStoreCategories = useMemo(() => {
  if (!storeSearchActive) return categoriesWithSearchText;
  return categoriesWithSearchText
    .map(category => {
      const stores = category.stores.filter(store =>
        store._searchText.includes(storeQueryDebounced) // Use cached
      );
      if (stores.length === 0) return null;
      return { ...category, stores };
    })
    .filter(Boolean);
}, [categoriesWithSearchText, storeSearchActive, storeQueryDebounced]);
```

**Files to modify:** `dash-bash-component.jsx`
- Lines 969-1025: Add search text caching

---

### Phase 3: Additional Optimizations (Lower Priority)

#### Fix #6: Single JSON.parse on Init
**Risk:** Very Low | **Effort:** Low | **Impact:** Low-Medium

**What:** Parse localStorage once, feed to all useState initializers

**Files to modify:** `dash-bash-component.jsx`
- Lines 1030-1315: Refactor useState initializers

#### Fix #7: Increase Debounce Times
**Risk:** Very Low | **Effort:** Very Low | **Impact:** Medium

**What:** Change search debounce from 150ms to 300-500ms, save from 500ms to 2000ms

**Files to modify:** `dash-bash-component.jsx`
- Line 843: Search debounce
- Line 2445: Save debounce

---

## Testing Checklist

Before each fix, verify:
- [ ] App loads without errors
- [ ] All sections expand/collapse correctly
- [ ] Timers continue counting down when cards visible
- [ ] Search filters dashers correctly
- [ ] Data persists after reload
- [ ] Export/import works

After each fix, measure:
- [ ] DOM mutations during expand (should decrease)
- [ ] Memory usage in Task Manager
- [ ] CPU usage in Task Manager
- [ ] Search responsiveness

---

## Important Notes

1. **Timer behavior:** Timers should KEEP running when cards are collapsed (countdown must continue) - only pause in BACKGROUND TABS
2. **File size:** 17K line file requires careful, targeted changes
3. **No refactoring:** Modular split is out of scope
4. **Test incrementally:** One fix at a time, verify before next

---

## File Locations Quick Reference

| What | Line(s) |
|------|---------|
| Icon component | 17-39 |
| DasherCard timer | 492 |
| useState initializers | 1030-1315 |
| buildStoreSearchText | 969-1025 |
| Stats useMemos | 5530-5650 |
| Save debounce | 2445 |
| Search debounce | 843 |

---

## Session Continuation

When resuming:
1. Read this plan (`docs/PERFORMANCE_FIX_PLAN.md`)
2. Read analysis (`docs/PERFORMANCE_ANALYSIS_2026-01-02.md`)
3. Checkout branch `fix/performance-optimizations`
4. Start with Phase 1 fixes (#2 and #3)
5. Test after each change
