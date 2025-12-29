# Dash Bash Utility

A Progressive Web App (PWA) for delivery service drivers, featuring a target calculator, dasher management with countdown timers, and comprehensive address book.

**[Use the App](https://aaronvstory.github.io/dash-bash-utility/)** | **Current Version: 1.10.0**

---

## Features

### Target Calculator
- Calculate optimal quantities to reach target dollar amounts ($99, $120, or custom)
- Color-coded results based on proximity to target (green = optimal, red = far)
- Real-time calculation as prices are added/removed
- Automatic best option highlighting

### Quick Messages
- Pre-configured customer service message templates
- Drag-and-drop reordering
- Inline editing (no popups)
- One-click copy to clipboard with visual confirmation

### Address Book
- Store locations with operating hours and notes
- Categorized organization with inline category renaming
- Real-time open/closed status with time remaining until close
- Color-coded time indicators: red (<60min), yellow (<120min), green (>120min)
- Drag-and-drop store reordering within categories
- One-click copy for addresses
- Expand/Collapse all buttons per category

### Notes
- Multi-category note organization
- Drag-and-drop notes between categories
- Resizable text areas
- One-click copy for all note fields
- Per-note collapse states persisted

### Dashers
- Track delivery dashers with contact info and balance
- **24-hour countdown timers** with second precision (HH:mm:ss format)
- Full date/time display with day of week for "last used"
- Status flags: Crimson, FastPay, Red Card, Appealed (color-coded pill badges)
- **Earnings tracking**: Inline forms for recording earnings
- **Cash-out history**: Full history with method, amount, notes, timestamp
- Drag-and-drop between categories
- Timer color codes: red (< 24hrs), orange (≤ 1hr), green (> 24hrs)

### Statistics
- Real-time dasher counts per category
- Balance breakdowns (active, Crimson, Red Card holders)
- Live updates as data changes

### State Management
- **Dual-write persistence**: localStorage + IndexedDB backup
- **Emergency save handlers**: visibilitychange, beforeunload, pagehide
- Export/import complete application state (JSON v2.1 format)
- Multi-tab awareness with cross-tab notifications
- All UI collapse states persisted across sessions

---

## Installation

### As a PWA (Recommended)
1. Visit [the app](https://aaronvstory.github.io/dash-bash-utility/)
2. Click the install icon in your browser's address bar
3. Or use menu → Apps → Install this site as an app
4. The app works offline once installed

### Local Development
```bash
# Clone the repository
git clone https://github.com/aaronvstory/dash-bash-utility.git
cd dash-bash-utility

# Install dependencies
npm install

# Start local server
python serve-pwa.py
# Or on Windows: serve-pwa.bat

# Open http://localhost:8443/index.html
```

---

## Development

### Build Commands
```bash
npm run build          # Full build: CSS + extract JSX + compile
npm run build:css      # Build Tailwind CSS only
npm run extract-jsx    # Extract JSX from index.html
npm run compile        # Babel compile JSX → JS
npm run vendor:prepare # Download/update vendor files
npm run deploy         # Build + commit + deploy to gh-pages
```

### Architecture
- **Source**: `dash-bash-component.jsx` (React component, edit this)
- **Compiled**: `dash-bash-compiled.js` (optimized output, committed)
- **Served**: `index.html` loads the compiled JS
- **Vendor**: Local copies of React, ReactDOM, Lucide (no CDN dependencies)

### Why Precompilation?
Browser-side Babel compilation on 700KB+ inline scripts caused 9.8s LCP and 100-330ms React handler times. Precompiled JS eliminates runtime overhead and enables full optimization (98.4% reduction in HTML size).

---

## Tech Stack

- **React 18** with functional components and hooks
- **Tailwind CSS 4** for styling
- **Lucide icons** (bundled locally)
- **Babel CLI** for JSX precompilation
- **Service Worker** for offline functionality and cache management
- **IndexedDB** for reliable backup storage

---

## Browser Support

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Any modern browser with JavaScript enabled

---

## Privacy

All data is stored locally in your browser (localStorage + IndexedDB). No server-side storage, tracking, or analytics.

---

## Changelog

### v1.9.7 (December 2025) - Critical Persistence Fix
- **Emergency Save Handlers**: Added `visibilitychange` (primary), `beforeunload` (backup), and `pagehide` (mobile) handlers
- **IndexedDB Backup**: Dual-write strategy with localStorage + IndexedDB for redundancy
- **Save Coordination**: Race condition prevention with `coordinatedSave` wrapper
- **Auto-Save**: Comprehensive 500ms debounced auto-save watching all critical state
- **Multi-Tab Awareness**: `storage` event listener for cross-tab notifications
- **Visual Feedback**: Last saved indicator in State Management section header
- **Quota Handling**: Graceful fallback to IndexedDB-only mode when localStorage is full

### v1.9.6 (October 2025) - GitHub Pages-Safe Release
- Local vendor files (React, ReactDOM, Lucide) - no CDN dependencies
- Precompiled JSX with Babel CLI for 80-95% faster page loads
- 98.4% reduction in HTML size (720 KB → 11.5 KB)

### v1.8.9 (October 2025)
- Unified aria-live announcements for copy, save, export, import actions
- Improved cache-busting consistency across resources

### v1.8.7 (October 2025)
- Shared aria-live announcer for earnings and cash-out success messages
- Fixed crash from undefined `safeFieldSegment` helper

### v1.8.6 (October 2025)
- Inline earnings and cash-out forms with validation
- Balance synchronization with clamping/normalization
- Memoized dasher descriptor maps for data integrity

### v1.8.x Series (September-October 2025)
- Cash-out history tables with auto-populated notes
- Resizable textareas for all notes fields
- FastPay flag with tooltips
- Selected badge glow effects

### v1.6.2 (January 2025)
- WCAG AA accessibility compliance
- Schema versioning system (schemaVersion: 3→5)
- Balance validation with clamping

### v1.5.0 (January 2025)
- Modern typography with Inter font family
- High contrast colors for dark backgrounds
- Unique pill badge colors for status flags
- Improved card spacing and consistency

### v1.4.0 (January 2025)
- Red Card checkbox feature
- Statistics section with balance breakdowns
- Real-time analytics

### v1.3.0 (January 2025)
- Reordered expand/collapse buttons
- Improved button layout consistency

### v1.2.0 (January 2025)
- Expand/Collapse All buttons for Address Book and Dashers
- External stylesheet with CSS variables
- Collapse states in export/import

### v1.1.x (January 2025)
- Color-coded dasher titles
- Crimson indicator
- Timer reset functionality
- Drag handle isolation

### v1.0.0 (August 2025)
- Initial release with Target Calculator, Messages, Address Book, Notes, Dashers

---

## Contributing

Pull requests welcome! Please:
1. Run `npm run build` before committing
2. Test persistence (make change → close tab → reopen → verify)
3. Follow existing code patterns

See `CLAUDE.md` for AI assistant guidance and `STYLE_GUIDE.md` for CSS conventions.

---

## License

MIT License - Feel free to use and modify as needed.

---

## Author

Created for DoorDash and delivery service drivers to optimize their workflow.
