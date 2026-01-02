# Dash Bash Performance Analysis - January 2, 2026

## Problem Statement
App became extremely slow with ~20-30 dashers, notes, and store info:
- Takes several seconds to open anything
- Search takes ~20 seconds
- Uses 10GB+ RAM
- Overall very sluggish

## Key Metrics Found

| Metric | Count | Impact |
|--------|-------|--------|
| Component Size | 17,072 lines | Single monolith = full re-renders |
| React Hooks | 220 | Massive dependency comparisons |
| Array Iterations | 307 | Cascading recomputes on state change |
| Timers (setTimeout/setInterval) | 90+ | Memory + CPU overhead |
| JSON.parse on init | 8+ separate calls | Parses same huge blob 8x |
| react-window virtualization | LOADED BUT NEVER USED | Lists render ALL items |

## Root Causes Identified

### 1. Store Search Rebuilds Haystack Per Keystroke
**Location:** `dash-bash-component.jsx:969-1025`
- `buildStoreSearchText()` walks every field of every store on each keystroke
- O(total stores * total fields) per search
- Direct cause of 20s search time

### 2. Multiple JSON.parse on Initialization
**Location:** `dash-bash-component.jsx:1030-1315`
- Each `useState` initializer calls `JSON.parse(localStorage.getItem("dashBashState"))` separately
- With large state, parses the same huge JSON blob 8+ times
- Adds several seconds to cold start

### 3. Statistics Computed Even When Section Closed
**Location:** `dash-bash-component.jsx:5480-5645`
- `dashersMeta`, `collectDasherEvents`, and rolling summaries computed on every render
- These run regardless of whether Statistics section is open
- Wasted computation on every bucket change

### 4. Persistence on Every Change (500ms debounce)
**Location:** `dash-bash-component.jsx:2290-2570`
- Full app state JSON.stringified and written to storage on every change
- With large notes/store data, each save allocates huge strings
- Causes RAM/CPU spikes during typing

### 5. DasherCard Individual Timers
**Location:** `dash-bash-component.jsx:492`
- Each DasherCard has its own `setInterval` running every second
- With 30 dashers, that's 30 timers ticking constantly
- Contributes to RAM usage

### 6. react-window Loaded But Never Used
**Location:** `dash-bash-component.jsx:12-14`
- `react-window` is in vendor/ and loaded
- `getVirtualList()` is defined but never called anywhere
- All list items render even when off-screen

## Approved Optimization Plan (Low Risk)

### Phase 1 - Quick Wins

| # | Fix | Risk | Effort | Impact |
|---|-----|:----:|:------:|:------:|
| 1 | Cache store search text (build once, not per keystroke) | Low | Low | HIGH |
| 2 | Single JSON.parse on init | Low | Low | Medium |
| 3 | Gate stats behind isStatisticsOpen | Low | Low | HIGH |
| 4 | Increase save debounce to 1500-3000ms | Low | Low | Medium |
| 5 | Verify DasherCard timers work correctly | Low | Low | HIGH |

### Phase 2 - Medium Effort (Future)

| # | Fix | Risk | Effort | Impact |
|---|-----|:----:|:------:|:------:|
| 6 | Use react-window for lists | Medium | Medium | HIGH |

### Phase 3 - Large Refactor (Out of Scope)

| # | Fix | Risk | Effort | Impact |
|---|-----|:----:|:------:|:------:|
| 7 | Split persistence by entity type | High | High | HIGH |
| 8 | Split monolith into modules | High | High | HIGH |

## Important Notes

- **Timer behavior:** Timers stay accurate via timestamps; UI ticks can pause when cards are collapsed or tab is hidden
- **File size concern:** 17K line file requires careful changes
- **Modular refactor:** Explicitly out of scope for now

## Diagnostic Measurements (Live from GitHub Pages)

### Data Size
```text
dashBashState size: 49.28 KB
JSON.parse time:    0.20 ms
JSON.stringify time: 0.50 ms
```

### Item Counts
```text
Messages:           31
Store Categories:   12
Stores:             34
Note Categories:    9
Notes:              19
Dasher Categories:  15
Total Dashers:      54
  - In Categories:  10
  - Ready:          1
  - Using:          5
  - Appealed:       3
  - Locked:         1
  - Reverif:        1
  - Archived:       33
History Entries:    44 (cash-out + earnings)
```

### DOM/Memory Impact

| State | DOM Nodes | Inputs | JS Heap |
|-------|-----------|--------|---------|
| Collapsed | 3,878 | 539 | 63 MB |
| Expanded | 7,457 | 1,068 | 124 MB |


### Key Finding: Render Cascade During State Changes

**Raw JS operations are fast (< 1ms), but React re-render causes 13,000+ DOM mutations/sec during expand/search!**

| Phase | DOM Mutations/sec | Behavior |
|-------|-------------------|----------|
| Idle (collapsed) | 30 | Stable |
| **During expand** | **13,080** | EXPLOSIVE |
| After settled | ~0 | Stable |

### Root Cause of 6.5GB+ Per Tab

1. **Render cascade**: Each state change triggers 13,000+ DOM mutations
2. **930 Lucide icons**: All re-processed during re-renders
3. **Memory compounds**: Repeated expand/collapse/search cycles don't GC properly
4. **Two tabs = 2x**: User had two tabs open = 11GB total

### Why It Gets Worse Over Time
- Each interaction allocates memory
- Large component tree (17K lines) = expensive reconciliation
- Icons re-created on each render via `lucide.createIcons()`
- Statistics computed continuously even when section closed

---
*Analysis by Claude Code + Codex CLI cross-reference*
*Measured: 2026-01-02 via Chrome automation*
