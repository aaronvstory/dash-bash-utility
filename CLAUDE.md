# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dash Bash Utility is a React-based PWA for delivery service drivers. Uses **precompiled JSX** with Babel CLI.

**Current Version**: 1.11.0 | **Live**: <https://aaronvstory.github.io/dash-bash-utility/>

**Core Features**: Target Calculator, Quick Messages, Address Book with hours tracking, Notes, Dashers with 24h countdown timers, Statistics.

## Commands

```bash
# Development
python serve-pwa.py              # Start server → http://localhost:8443
npm run build                    # Build CSS + compile JSX (REQUIRED before deploy)
npm run deploy                   # Build + commit + push to gh-pages

# Individual build steps
npm run build:css                # Tailwind CSS
npm run extract-jsx              # Extract JSX from index.html
npm run compile                  # Babel compile JSX → JS
npm run vendor:prepare           # Download/update vendor files
```

## Architecture

### Build Pipeline
```
dash-bash-component.jsx  →  npm run build  →  dash-bash-compiled.js
        (source)                                    (served)
```

**Key Files**:
- `dash-bash-component.jsx` - React source (~3000 lines, edit this)
- `dash-bash-compiled.js` - Compiled output (303 KB, committed)
- `index.html` - Shell that loads compiled JS (11.5 KB)
- `vendor/` - Local React, ReactDOM, Lucide (no CDN dependencies)

**Why Precompilation?**: Browser-side Babel caused 9.8s LCP on 700KB inline scripts. Precompiled JS eliminates runtime overhead.

### State Architecture

Single `dashBashState` localStorage key containing all app data:
- Core data: `dasherCategories`, `messages`, `categories`, `noteCategories`
- UI state: `collapsed*` objects for all collapsible sections
- Metadata: `timestamp`, `schemaVersion` (currently 5)

**Persistence System** (v1.9.7+):
- **Dual-write**: localStorage (fast) + IndexedDB (reliable backup)
- **Emergency handlers**: `visibilitychange` (primary), `beforeunload`, `pagehide`
- **Auto-save**: 500ms debounced, watches all critical state
- **Multi-tab**: `storage` event listener for cross-tab awareness
- **Coordination**: `coordinatedSave` prevents race conditions

### Component Structure

Single `EnhancedCalculator` component with:
- State management layer (collapse states, editing states, drag states)
- Sections: Calculator, Messages, Address Book, Notes, Dashers, Statistics
- All sections use consistent patterns: collapsible headers, inline editing, drag-and-drop

## Version Update Process

Preferred: run `npm run version:update -- X.Y.Z` to sync mechanical version fields.
Optional: `npm run release -- X.Y.Z` to sync + build in one step.
Then update release notes manually (README + changelogs).

Automated by `npm run version:update -- X.Y.Z`:
1. `service-worker.js`: `const APP_VERSION = "X.Y.Z"`
2. `index.html`: `app-version` meta, `APP_VERSION` constant, `data-style-version`, console log string, and all `?v=X.Y.Z` cache-busting query params
3. `manifest.json`: `app_version` and the icon `src` query param
4. `package.json`: `version`
5. `README.md` (Current Version line)
6. `CLAUDE.md` (Current Version line)

Manual release notes: update `CHANGELOG.md` and `docs/Changelog.md`.

## Key Patterns

### Icon Implementation
```javascript
// Icons use Lucide via React.createElement wrapper
const Copy = (props) => React.createElement(lucide.Copy, props);
// Usage: <Copy size={16} className="text-blue-400" />
```

### Inline Editing (no popups)
```javascript
const [editingCategory, setEditingCategory] = useState(-1);
// Render: editingCategory === id ? <input .../> : <span>...</span>
```

### Drag-and-Drop
All draggable sections use: `draggedItem` state → `onDragStart/Over/Drop` handlers → reorder array → auto-save.

### Copy to Clipboard
```javascript
await navigator.clipboard.writeText(text);
setCopyNotification(`✓ Copied: ${text.substring(0, 30)}...`);
```

## Critical Rules

### CSS Cascade Bug Prevention
**Never set text color on parent elements** - child spans lose their individual colors:
```javascript
// ❌ WRONG: <h5 className="text-purple-300">{dasherTitle}</h5>
// ✅ CORRECT: <h5 className="font-medium">{dasherTitle}</h5>  // children define colors
```

### High Contrast Colors (dark backgrounds)
Use brightest Tailwind variants: `text-purple-200`, `text-blue-200`, `text-green-300`, `text-red-400`

### Padding Consistency
Input fields and display text both use `px-2 py-0.5` to prevent layout jumps on edit mode toggle.

## Debugging

- **localStorage**: DevTools → Application → Storage → `dashBashState`
- **Service Worker**: DevTools → Application → Service Workers
- **IndexedDB**: DevTools → Application → IndexedDB → `DashBashDB`
- **State not persisting?**: Check quota, verify emergency handlers, check console for save errors

## Testing

```bash
python serve-pwa.py  # Start server
# Open http://localhost:8443/index.html
# Test: make change → close tab immediately → reopen → verify persistence
```

Key verifications: inline editing works, timers update every second, drag-and-drop functions, export/import preserves all data.

## Related Documentation

- `STYLE_GUIDE.md` - CSS architecture, component classes, theming
- `GITHUB_PAGES_DEPLOYMENT.md` - Full deployment guide
- `VERSION_UPDATE_GUIDE.md` - Detailed version update instructions
- `tasks/` - Active development tasks and plans
