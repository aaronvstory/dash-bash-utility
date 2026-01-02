# Handoff: Dash Bash Performance Fix

**Date:** 2026-01-02
**Branch:** `fix/performance-optimizations`
**Status:** Ready for implementation

---

## Quick Start for New Session

```bash
cd /path/to/dash-bash
# Windows example:
# cd C:\claude\dash-bash
git checkout fix/performance-optimizations
```

Then read:
1. `docs/PERFORMANCE_FIX_PLAN.md` - Implementation details
2. `docs/PERFORMANCE_ANALYSIS_2026-01-02.md` - Diagnostic data

---

## Problem Summary

The Dash Bash Utility app (a React PWA for delivery drivers) became extremely slow:
- **6.5 GB+ RAM per tab** (11GB with two tabs open)
- **~50% CPU per tab** constantly
- **20 second search** times
- Takes seconds to open/close sections

---

## Root Cause (Confirmed)

### React re-render cascade during state changes

| Metric | Value |
|--------|-------|
| DOM mutations during expand | **13,080/sec** |
| DOM mutations when idle | 30/sec |
| Component size | 17,072 lines |
| React hooks | 220 |
| Lucide icons | 930 |

The 17K-line monolithic component triggers massive re-renders on any state change. Memory compounds with repeated interactions and doesn't fully GC.

---

## Agreed Fix Priority

| # | Fix | Risk | Effort | Impact |
|---|-----|:----:|:------:|:------:|
| **2** | Pause work in background tabs | Very Low | Low | HIGH |
| **3** | Gate stats behind isStatisticsOpen | Very Low | Low | MEDIUM |
| **1** | Lazy-mount closed sections | Low | Medium | HUGE |
| **4** | Rework Lucide icon rendering | Low-Med | Medium | MED-HIGH |
| **5** | Cache store search text | Very Low | Low-Med | HIGH |

**Start with #2 and #3** - they're quick wins with minimal risk.

---

## Key Implementation Notes

### Fix #2: Background Tab Pause
- Add `visibilitychange` listener
- Pass `isTabVisible` to DasherCard
- Update timer useEffect at line ~492 to check `!isTabVisible`
- **IMPORTANT:** Timers should KEEP running when collapsed, only pause when TAB IS HIDDEN

### Fix #3: Gate Statistics
- Lines 5530-5650 have stats useMemos
- Add `if (!isStatisticsOpen) return [];` early returns
- Add `isStatisticsOpen` to dependency arrays

### Fix #4: Lucide Icons
- Line 17-39: Icon component calls `lucide.createIcons()` on every render
- This processes ALL 930 icons in the document
- Fix: Use `{ root: iconRef.current }` to only process the specific icon

---

## Diagnostic Data Collected

Via Chrome automation on live GitHub Pages:

```text
localStorage: 49.28 KB
JSON.parse: 0.20 ms
JSON.stringify: 0.50 ms
Total dashers: 54
Stores: 34
Notes: 19
Messages: 31

Collapsed state:
  - DOM nodes: 3,878
  - Heap: 63 MB

Expanded state:
  - DOM nodes: 7,457
  - Heap: 124 MB (grew to 170+ during testing)

During expand:
  - DOM mutations: 13,080/sec
```

---

## Testing Checklist

After each fix:
- [ ] App loads without errors
- [ ] Sections expand/collapse correctly
- [ ] Timers count down (when cards visible AND tab active)
- [ ] Search filters correctly
- [ ] Data persists after reload
- [ ] Check Task Manager for memory/CPU improvement

---

## Files Reference

| What | Location |
|------|----------|
| Main component | `dash-bash-component.jsx` (17,072 lines) |
| Icon component | Lines 17-39 |
| DasherCard timer | Line 492 |
| Stats useMemos | Lines 5530-5650 |
| Store search | Lines 969-1025 |
| Save debounce | Line 2445 |
| Search debounce | Line 843 |

---

## Context from Discussion

### Codex CLI Insights (Cross-Referenced)
- Timer counting was unreliable (hook installed post-mount)
- Lucide test also unreliable for same reason
- Confirmed expand = explosion pattern
- Suggested visibility gating as top priority

### User Constraints
- Cannot do full modular refactor (too large a job)
- Must be careful with 17K line file
- Timers must keep running when collapsed (countdown feature)
- Only pause work when TAB is in background

---

## Commands

```bash
# Development
python serve-pwa.py              # Start server at http://localhost:8443
npm run build                    # Build CSS + compile JSX

# Build steps
npm run build:css                # Tailwind CSS
npm run compile                  # Babel compile JSX → JS
```

---

## Next Steps

1. Checkout branch `fix/performance-optimizations`
2. Implement Fix #2 (background tab pause) - ~15 min
3. Test: Open two tabs, verify only active tab uses CPU
4. Implement Fix #3 (gate stats) - ~10 min
5. Test: Verify stats only compute when section open
6. Build and test on localhost
7. If successful, continue with Fix #1 and #4
