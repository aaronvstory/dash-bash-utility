# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dash Bash Utility is a React-based Progressive Web App (PWA) designed for delivery service drivers (primarily DoorDash). Uses **precompiled JSX** with Babel CLI for optimal performance.

**Current Version**: 1.9.1 (October 2025) - JSX Precompilation Release

**Core Features:**
- **Target Calculator**: Calculates optimal quantities to reach target dollar amounts ($99/$120/custom)
- **Quick Messages**: Customer service templates with drag-and-drop reordering
- **Address Book**: Store locations with hours tracking and real-time open/closed status
- **Notes**: Multi-category note-taking with drag-and-drop organization and resizable textareas
- **Dashers**: Driver management with 24-hour countdown timers, inline editing, earnings tracking
  - Status flags: Crimson, FastPay, Red Card, Appealed
  - Cash-out history with auto-populated notes
  - Inline earnings and cash-out forms with accessibility support
- **Statistics**: Real-time analytics showing dasher counts and balance breakdowns

## Commands

### Running the Application
```bash
# Quick start (Windows)
serve-pwa.bat

# Python server (all platforms)
python serve-pwa.py

# Access at: http://localhost:8443/index.html
```

**Build Process**: Uses Babel CLI to precompile JSX offline. Run `npm run build` before deploying changes.

### Testing PWA Features
```bash
# Start HTTPS server with proper MIME types
python serve-pwa.py

# Open browser to http://localhost:8443
# Check DevTools > Application > Service Workers
# Install via browser prompt or DevTools > Application > Install
```

### Testing Specific Features
The main app includes all features. Historical test files are archived in `archives/test-files/`.

To test specific functionality:
1. Start server: `python serve-pwa.py`
2. Open `http://localhost:8443/index.html`
3. Use browser DevTools to inspect state in localStorage (`dashBashState`)
4. Check service worker status in DevTools > Application > Service Workers

### Deployment to GitHub Pages

⚠️ **CRITICAL**: Always run `npm run build` before deploying!

```bash
# Automated deployment (recommended)
npm run deploy

# Manual deployment
npm run build  # Extract JSX and compile to dash-bash-compiled.js
git add index.html dash-bash-compiled.js dash-bash-component.jsx
git commit -m "Your descriptive message"
git push origin main
git checkout gh-pages
git merge main --no-edit
git push origin gh-pages
git checkout main

# The site will update at: https://aaronvstory.github.io/dash-bash-utility/
# Note: GitHub Pages may take 1-2 minutes to reflect changes
```

**Build Process**:
1. `npm run extract-jsx` - Extracts JSX from index.html to dash-bash-component.jsx
2. `npm run compile` - Compiles JSX to optimized JavaScript (dash-bash-compiled.js)
3. `npm run build` - Runs both extract and compile steps
4. `npm run deploy` - Builds and deploys to gh-pages automatically

**Regular Commit Practice**: Commit frequently to avoid losing work and maintain version history. Each feature or fix should be its own commit.

## Architecture

### Core Design Pattern
React application using functional components and hooks with **precompiled JSX** for optimal performance.

**Architecture** (v1.9.1+):
- **Source**: `dash-bash-component.jsx` (extracted from index.html)
- **Compiled**: `dash-bash-compiled.js` (optimized, minified JavaScript)
- **Served**: `index.html` (11.5 KB) + `dash-bash-compiled.js` (303 KB)
- **CDN**: React, ReactDOM, Tailwind CSS, Lucide Icons

**Performance Gains** (vs v1.9.0):
- 98.4% reduction in HTML size (720 KB → 11.5 KB)
- No browser-side Babel compilation
- Optimized, minified JavaScript
- 80-95% faster page loads

### Development Workflow

**Making Changes**:
1. Edit `dash-bash-component.jsx` (React component source)
2. Run `npm run build` to compile JSX → JavaScript
3. Test locally: `python serve-pwa.py` → `http://localhost:8443`
4. Verify changes in browser DevTools
5. Deploy: `npm run deploy` (automated) or manual git workflow

**Why Precompilation?**:
- Babel refused to optimize >500KB inline scripts (v1.9.0 was 703KB)
- Browser-side compilation caused 9.8s LCP and 100-330ms React handler times
- Precompiled JS eliminates runtime overhead and enables full optimization
5. Check browser console for any errors

**Common Mistake**: Editing only the TSX file and expecting changes to appear. The browser only reads `index.html`!

### Icon Implementation Pattern
The app uses Lucide icons via CDN with a custom wrapper pattern:

```javascript
// In index.html, icons are defined using React.createElement
const ChevronDown = (props) => React.createElement(lucide.ChevronDown, props);
const ChevronUp = (props) => React.createElement(lucide.ChevronUp, props);
const Copy = (props) => React.createElement(lucide.Copy, props);
// ... etc for all icons

// Usage in JSX
<ChevronDown size={20} />
<Copy className="text-blue-400" size={16} />
```

**When adding new icons:**
1. Find icon name from [Lucide Icons](https://lucide.dev/icons/)
2. Add definition: `const IconName = (props) => React.createElement(lucide.IconName, props);`
3. Use PascalCase for component name
4. Place definition at top of script block with other icon definitions

### State Management
- **Unified State**: Single `dashBashState` key in localStorage containing all app data
- **Hook-based**: useState for local state, useEffect for persistence
- **Auto-save**: Critical data saved on change with 100ms debounce
- **Import/Export**: Full state backup/restore via JSON files (v2.1 format)
- **Collapse States**: All UI collapse states persisted across sessions

### Component Structure
```
EnhancedCalculator (main component)
├── State Management Layer
│   ├── Collapsible states (isCalculatorOpen, isMessagesOpen, etc.)
│   ├── Editing states (editingCategory, editingDasherCategory, editingNoteCategory)
│   └── Drag states (draggedIndex, draggedCategory, draggedDasher, etc.)
├── Calculator Section (left column) 
│   ├── Target preset selector ($99/$120/custom)
│   └── Quantity calculation algorithm
├── Messages Section (right column top)
│   └── Drag-and-drop with inline editing
├── Address Book (right column middle)
│   ├── Store categories with inline renaming
│   ├── Real-time hours calculation
│   └── Expand/Collapse all buttons (v1.2.0+)
├── Notes Section (right column middle-bottom)
│   ├── Multi-category with inline renaming
│   └── Copy buttons for all fields
├── Dashers Section (right column bottom)
│   ├── 24-hour countdown timers (updates every second)
│   ├── Inline category renaming
│   ├── Drag-and-drop between categories
│   ├── Red Card checkbox tracking
│   └── Expand/Collapse all buttons (v1.2.0+)
└── Statistics Section (right column bottom)
    ├── Dasher counts per category
    └── Balance breakdowns (active, Crimson, Red Card)
```

## Key Algorithms

### Quantity Calculation (`calculateQuantities`)
Determines all valid quantity combinations for reaching target amount:
- Calculates max quantity within budget
- Returns sorted options by proximity to target
- Prioritizes smallest difference, then lowest quantity
- Color codes based on difference ranges (green=optimal, red=far)

### Time Status Calculation (`calculateTimeStatus`)
Real-time store hours tracking:
- Parses 24-hour format times ("1630" = 4:30 PM)
- Calculates minutes until close with day rollover support
- Returns open/closed status with time remaining
- Color codes: red (<60min), yellow (<120min), green (>120min)

### Dasher Timer System (`calculateDasherTimeStatus`)
24-hour countdown tracking with second precision:
- Monitors time since `lastUsed` timestamp
- Shows countdown for < 24 hours (HH:mm:ss format)
- Shows elapsed time for > 24 hours
- Full date/time display with day of week
- Color codes: red (< 24hrs), orange (≤ 1hr), green (> 24hrs)
- Timer icon color: purple (distinct from blue copy buttons)
- Uses `timerTick` counter updating every 1000ms for efficient re-renders

### Dasher Title Display (`getDasherTitle`)
Dynamic title generation with high-contrast color coding (v1.5.0+):
- Name: Bright Purple (`text-purple-200`) for excellent visibility
- Email: Bright Blue (`text-blue-200`) for clear distinction
- Balance: Bright Green if $0 (`text-green-300`), Bright Red otherwise (`text-red-400`)
- Format: "Name - Email - Balance"
- Status indicators shown as separate pill badges (see Flag Badges section)
- Returns JSX/React.Fragment with styled spans

### Earnings & Cash-out System (v1.8.x+)
Inline forms for recording earnings and cash-outs:
- **Inline Earning Form**: Add earnings with amount, optional notes, validation
- **Inline Cash-out Form**: Record cash-outs with amount, method (Crimson/FastPay/other), bucket selection, notes
- **Cash-out History**: Read-only table showing Amount/Method/Notes/Time
  - Auto-populates notes from selected cash-out (method + source bucket info)
  - Toggleable visibility with collapse state persistence
- **Balance Synchronization**: Automatic balance updates with clamping/normalization
- **Accessibility**: Aria-labels for all buttons, aria-live announcements for success/error
- **Data Integrity**: Memoized dasher descriptor maps, deduplication of history entries

### Flag Badge System (v1.5.0+, enhanced v1.8.x)
Status indicators displayed as modern pill badges with unique colors:
- **Crimson (CRIMSON)**: Bright red background (#ef4444) with white text when active
- **FastPay (FastPay)**: White text label with tooltip, positioned after Crimson
- **Red Card (RED CARD)**: Bright orange background (#f97316) with white text when active
- **Appealed (APPEALED)**: Bright yellow background (#eab308) with dark text when active
- **Inactive state**: Gray background (#4b5563) with 60% opacity for visibility
- All pills have excellent contrast ratios for accessibility (WCAG AA compliant)
- Positioned as inline badges after dasher name/email/balance
- Selected badge shows glow effect (2px white ring + soft blur)

## localStorage Structure

**Single unified key**: `dashBashState` contains all application data as JSON:
```json
{
  "target": "99",
  "targetPreset": "99",  // "99", "120", or "custom"
  "prices": [...],
  "messages": [...],
  "categories": [...],        // Address book
  "noteCategories": [...],    // Notes sections
  "dasherCategories": [...],  // Dashers with timers, earnings, cash-out history
  "collapsedCategories": {...},     // Address book collapse states
  "collapsedStores": {...},         // Individual store collapse states
  "collapsedDashers": {...},        // Individual dasher collapse states
  "collapsedDasherCategories": {...}, // Dasher category collapse states
  "collapsedNoteCategories": {...},   // Note category collapse states
  "collapsedNotesInStores": {...},    // Per-store notes collapse states (v1.8.x+)
  "collapsedNotesInDashers": {...},   // Per-dasher notes collapse states (v1.8.x+)
  "collapsedCashOutHistory": {...},   // Cash-out history collapse states (v1.8.x+)
  "timestamp": "2025-01-01T00:00:00.000Z",
  "schemaVersion": 3           // Schema version for data migration (v1.6.2+)
}
```

## Inline Editing Pattern

All sections use consistent inline editing (no popup prompts):

### Implementation Pattern
```javascript
// State for tracking which item is being edited
const [editingCategory, setEditingCategory] = useState(-1);
const [editingDasherCategory, setEditingDasherCategory] = useState(-1);
const [editingNoteCategory, setEditingNoteCategory] = useState(-1);

// Conditional rendering in JSX
{editingCategory === category.id ? (
  <input
    type="text"
    value={category.name}
    onChange={(e) => updateCategory(category.id, e.target.value)}
    className="bg-gray-600 border border-gray-500 rounded px-2 py-0.5 text-sm"
    onBlur={() => setEditingCategory(-1)}
    onKeyPress={(e) => e.key === 'Enter' && setEditingCategory(-1)}
    onClick={(e) => e.stopPropagation()}
    autoFocus
  />
) : (
  <h4 className="font-medium text-blue-300">{category.name}</h4>
)}
```

### Padding Consistency
- Input fields: `px-2 py-0.5` (not `py-1`)
- Display text: `px-2 py-0.5` (matching padding)
- Dasher card headers: `p-4` (v1.5.0+, increased from `p-3` for better spacing)
- Prevents layout jumps when switching between view/edit modes

## Version Management & Cache Busting

### Version Update Process
When releasing a new version, update the version number in **3 locations**:

1. **service-worker.js** (Line 2):
   ```javascript
   const APP_VERSION = "1.8.9"; // Update this version
   ```

2. **index.html - Meta tag** (Line 9):
   ```html
   <meta name="app-version" content="1.8.9">
   ```

3. **index.html - JavaScript constant** (Line 55):
   ```javascript
   const APP_VERSION = '1.8.9'; // Update this with each release
   ```

**Important**: Update all resource version parameters in index.html:
- `favicon.svg?v=1.8.9`
- `manifest.json?v=1.8.9`
- `styles.css?v=1.8.9`

### Cache Busting Implementation
The application implements several cache-busting strategies to ensure users always get the latest version:

- **Version-based cache names**: Service worker uses `dashbash-v${VERSION}` format
- **Query parameters**: All resources loaded with `?v=1.2.0` parameter
- **Network-first for HTML**: Always fetches fresh HTML when online
- **Cache-first for assets**: Static resources cached with background updates
- **Auto-update notifications**: Users see a green banner when new version available
- **Cache control meta tags**: Prevents aggressive browser caching

### How It Works
1. **On Version Update**:
   - Service worker cache name changes automatically
   - Old caches are deleted on activation
   - Resources fetched with new version parameters

2. **User Experience**:
   - Fresh content loads on next visit (network-first for HTML)
   - Update notification appears if app is already open
   - "Update Now" button for immediate refresh
   - Auto-reload when service worker updates
   - Checks for updates every hour automatically
   - Version check on tab visibility change

## PWA Configuration

### Service Worker
- **Cache Strategy**: Network-first for HTML, cache-first with background updates for assets
- **Offline Support**: All resources cached for offline use  
- **Cache Name**: Version-based `dashbash-v${VERSION}` with automatic cleanup
- **Resources Cached**: HTML, JS (React/Babel), CSS (Tailwind), icons (Lucide)
- **Update Detection**: Automatic with user notification

### Manifest
- **Display**: Standalone for app-like experience
- **Theme**: Dark theme with gray-900 background
- **Icons**: Multiple sizes for different devices
- **Start URL**: index.html

## Stylesheet Architecture

### External Stylesheet (styles.css)
The application uses a comprehensive external stylesheet (`styles.css`) designed for maintainability and future theming. The stylesheet is version-controlled and loaded with cache-busting parameters.

**Key Features:**
- **Modern Typography**: Inter font family (Google Fonts) for professional sans-serif appearance
- **CSS Variables**: All colors, spacing, typography, and animations defined as variables
- **High Contrast**: Optimized color palette for excellent legibility (v1.5.0+)
- **Theming Ready**: Support for dark/light themes via `data-theme` attribute
- **Component Classes**: Reusable classes for buttons, cards, inputs, and UI patterns
- **Responsive Utilities**: Mobile-first breakpoints (sm, md, lg, xl)
- **Accessibility**: Focus styles, screen reader support, reduced motion
- **Print Styles**: Clean printing with appropriate element hiding

**File Location**: `styles.css?v=1.5.0` (update version on changes)

### CSS Variable System
The stylesheet uses CSS custom properties for easy theming:
```css
--color-primary-*: Blue palette for primary actions
--color-gray-*: Gray scale for backgrounds and borders
--color-success/warning/error: Semantic colors
--color-calculator/messages/address/notes/dashers: Section colors
--bg-primary/secondary/tertiary: Background hierarchy
--text-primary/secondary/tertiary: Text color hierarchy
--spacing-xs/sm/md/lg/xl: Consistent spacing scale
--radius-sm/md/lg/xl/full: Border radius scale
--transition-fast/base/slow: Animation timing
```

### Updating Styles
When modifying styles:
1. Update `styles.css` with new styles/variables
2. Increment version in `index.html` link tag
3. Test all themes and responsive breakpoints
4. Document significant changes in this file

## UI Patterns & Components

### Chevron Expand/Collapse Pattern
The application uses a consistent chevron pattern for collapsible sections:

**Implementation:**
```javascript
// Icon definitions
const ChevronDown = (props) => React.createElement(Icon, { ...props, name: 'chevron-down' });
const ChevronUp = (props) => React.createElement(Icon, { ...props, name: 'chevron-up' });

// Usage in component
{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
```

**Chevron Locations:**
- **Main Sections**: Calculator, Messages, Address Book, Notes, Dashers, State Management
- **Categories**: Each category header within Address Book, Notes, and Dashers
- **Individual Items**: Stores within categories, Dashers within categories

**Behavior Patterns:**
- Click header to toggle section/category/item
- Chevron rotates on state change (down=collapsed, up=expanded)
- State persisted in localStorage
- Smooth transition animations (200ms)

### Expand/Collapse All Buttons
Per-category bulk operations for better UX:

**Implementation Pattern:**
```javascript
// Expand all items in a category
const expandAllStoresInCategory = (categoryId) => {
    const newCollapsed = { ...collapsedStores };
    categories.find(c => c.id === categoryId)?.stores?.forEach(store => {
        delete newCollapsed[store.id];
    });
    setCollapsedStores(newCollapsed);
};

// Collapse all items in a category
const collapseAllStoresInCategory = (categoryId) => {
    const newCollapsed = { ...collapsedStores };
    categories.find(c => c.id === categoryId)?.stores?.forEach(store => {
        newCollapsed[store.id] = true;
    });
    setCollapsedStores(newCollapsed);
};
```

**Button Locations:**
- Address Book categories: Expand/collapse all stores
- Dasher categories: Expand/collapse all dashers
- Positioned inline with category edit button
- Small size with hover effects

### Collapsible State Management
All collapse states are tracked and persisted:

**State Structure:**
```javascript
collapsedCategories: { [categoryId]: boolean }      // Address book categories
collapsedStores: { [storeId]: boolean }            // Individual stores
collapsedDashers: { [dasherId]: boolean }           // Individual dashers
collapsedDasherCategories: { [categoryId]: boolean } // Dasher categories
collapsedNoteCategories: { [categoryId]: boolean }  // Note categories
```

**Persistence:**
- Saved to localStorage on every change
- Included in JSON export/import
- Restored on app load

### Component Class Reference
From `styles.css`, use these classes for consistent UI:

**Buttons:**
- `.btn` - Base button styles
- `.btn-primary` - Primary action buttons
- `.btn-secondary` - Secondary buttons
- `.btn-success` - Success state buttons
- `.btn-danger` - Danger/delete buttons
- `.btn-sm` - Small variant
- `.btn-lg` - Large variant

**Cards & Sections:**
- `.card` - Card container with border and padding
- `.section-header` - Collapsible section headers
- `.collapsible-header` - Category/item headers
- `.collapsible-content` - Animated content areas

**Chevron Components:**
- `.chevron-icon` - Base chevron styling
- `.chevron-rotate` - 180deg rotation for state
- `.expand-all-btn` - Expand all button
- `.collapse-all-btn` - Collapse all button

**Utilities:**
- `.text-calculator/messages/address/notes/dashers` - Section colors
- `.animate-pulse` - Pulsing animation
- `.draggable` - Drag-and-drop items
- `.copy-btn` - Copy to clipboard buttons

## Accessibility Guidelines (WCAG AA - v1.8.x+)

### Aria-live Announcements
All user actions should provide screen reader feedback:
- **Success messages**: Use shared aria-live region with `role="status"`, `aria-live="polite"`
- **Error messages**: Use assertive announcements for validation errors
- **State changes**: Announce copy actions, save confirmations, export/import results

### Aria-labels for Icon Buttons
All icon-only buttons require descriptive aria-labels:
```javascript
<button aria-label="Copy name to clipboard">
  <Copy size={16} />
</button>
<button aria-label="Show cash-out history">
  <ChevronDown size={16} />
</button>
```

### Collapsible Sections
Use `aria-expanded` attribute on all collapsible headers:
```javascript
<div
  onClick={toggle}
  aria-expanded={isOpen}
  role="button"
  tabIndex={0}
>
  {isOpen ? <ChevronUp /> : <ChevronDown />}
</div>
```

### Focus Management
- All interactive elements must be keyboard accessible
- Inline edit inputs should auto-focus when entering edit mode
- Tab order should follow visual layout
- Focus indicators must be visible (outline styles)

## UI/UX Design Guidelines

### Critical CSS Cascade Rules
**NEVER override child element colors with parent classes**. This was the root cause of major legibility issues in v1.4.x:

**❌ WRONG - Parent color overrides all children:**
```html
<h5 className="text-purple-300">
  {dasherTitle}  <!-- All child spans become purple-300, losing their individual colors -->
</h5>
```

**✅ CORRECT - No parent color, children define their own:**
```html
<h5 className="font-medium text-sm">
  {dasherTitle}  <!-- Child spans maintain their individual colors -->
</h5>
```

### High Contrast Color Requirements
For dark backgrounds, use the BRIGHTEST versions of Tailwind colors:
- **Names/Labels**: `text-purple-200`, `text-blue-200` (NOT -300 or -400)
- **Balances/Values**: `text-red-400`, `text-green-300` (NOT -500 or darker)
- **Pills/Badges**: Solid bright backgrounds (#ef4444, #f97316) with white/dark text
- **Inactive States**: Visible gray (#4b5563) with reduced opacity (60-80%)

### Typography Best Practices
- **Font Family**: Inter (Google Fonts) for modern sans-serif appearance
- **Line Height**: Adequate spacing for readability
- **Letter Spacing**: Slight tracking for better legibility at small sizes
- **Font Weights**: Use 400 (normal), 500 (medium), 600 (semibold) strategically

### Spacing Consistency
- **Card Headers**: `p-4` (adequate breathing room)
- **Form Inputs**: `px-2 py-0.5` (compact but functional)
- **Between Sections**: `space-y-4` (consistent vertical rhythm)
- **Inline Elements**: `gap-2` or `gap-3` (appropriate for context)

## Development Patterns

### Adding New Sections
Follow the established collapsible pattern:
```javascript
const [isSectionOpen, setIsSectionOpen] = useState(false);
// Collapsible header with ChevronDown/ChevronUp
// Content area with consistent spacing (space-y-4)
// Follow STYLE_GUIDE.md for colors and components
```

### Drag-and-Drop Implementation
All draggable sections use the same pattern:
1. `draggedItem` state to track dragged element
2. `onDragStart`, `onDragOver`, `onDrop` handlers
3. Visual feedback with opacity changes
4. Reorder arrays and persist to localStorage
5. Auto-save after drop with 100ms delay

### Copy to Clipboard Pattern
```javascript
const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
  setCopyNotification(`✓ Copied: ${text.substring(0, 30)}...`);
  setTimeout(() => setCopyNotification(''), 2000);
};
```

### Expand/Collapse All Pattern (v1.2.0+)
```javascript
const expandAllCategories = () => {
  setCollapsedCategories({});
  setTimeout(() => saveAllToLocalStorage(), 100);
};

const collapseAllCategories = () => {
  const allCollapsed = {};
  categories.forEach(cat => {
    allCollapsed[cat.id] = true;
  });
  setCollapsedCategories(allCollapsed);
  setTimeout(() => saveAllToLocalStorage(), 100);
};
```

### Auto-save Pattern
All state modifications trigger auto-save:
```javascript
setTimeout(() => {
  saveAllToLocalStorage();
}, 100); // 100ms debounce
```

### Performance Optimizations
- **Timer Updates**: Use `timerTick` counter (1000ms interval) for seconds display
- **Debounced Saves**: Auto-save with 100ms delay after changes
- **Lazy State Init**: Heavy computations only on mount
- **Event Delegation**: Single handlers for repeated elements

## Data Export/Import Format

The application uses a unified JSON format (v2.1) for state export/import:

```json
{
  "version": "2.1",
  "exportDate": "2025-01-15T10:30:00.000Z",
  "target": "99",
  "targetPreset": "99",
  "prices": [...],
  "messages": [...],
  "categories": [...],
  "noteCategories": [...],
  "dasherCategories": [...],
  "collapsedCategories": {...},
  "collapsedStores": {...},
  "collapsedDashers": {...},
  "collapsedDasherCategories": {...},
  "collapsedNoteCategories": {...}
}
```

**Import Compatibility:**
- Supports v1.0 (basic state)
- Supports v2.0 (with collapse states)
- Current format v2.1 (includes all features)

## Recent Updates

### v1.8.9 (October 2025)
- **Accessibility**: Unified aria-live announcements for copy, save, export, import actions
- **Version Management**: Bumped app version ahead of gh-pages release
- **Bug Fixes**: Improved cache-busting consistency across resources

### v1.8.7 (October 2025)
- **Accessibility**: Shared aria-live announcer for earnings and cash-out success messages
- **Bug Fixes**: Fixed crash from undefined `safeFieldSegment` by hoisting helper to shared scope
- **Cache Management**: Unified version parameters across all resources

### v1.8.6 (October 2025)
- **Earnings & Cash-out**: Inline forms with validation and accessibility semantics
- **Data Integrity**: Memoized dasher descriptor maps, balance synchronization with clamping
- **UX**: Actionable feedback for missing records instead of silent fallbacks

### v1.8.x Series (September-October 2025)
- **Cash-out History**: Read-only tables with Amount/Method/Notes/Time, auto-populated from selected cash-out
- **Notes UX**: Resizable textareas, per-item show/collapse toggles, persistent state
- **FastPay Integration**: FastPay flag with tooltips, reordered status badges
- **UI Polish**: Selected badge glow effects, improved visual hierarchy

### v1.6.2 (January 2025) - Phase 8: Accessibility & Performance
- Comprehensive WCAG AA compliance with aria-labels
- Schema versioning system (`schemaVersion: 3`) with migration logic
- Balance validation with clamping (-1,000,000 to 1,000,000)

### v1.5.0 (January 2025)
- **Modern Typography**: Added Inter font family via Google Fonts for professional appearance
- **High Contrast Colors**: Dramatically improved text legibility
  - Name: `text-purple-200` (brighter purple)
  - Email: `text-blue-200` (brighter blue)
  - Balance: `text-green-300` (zero) / `text-red-400` (non-zero)
- **Unique Pill Colors**: Distinct active state colors for excellent visibility
  - Crimson: Bright red (#ef4444) with white text
  - Red Card: Bright orange (#f97316) with white text
  - Appealed: Bright yellow (#eab308) with dark text
  - Inactive: Visible gray (#4b5563) with 60% opacity
- **Improved Spacing**: Increased padding in dasher card headers (p-3 → p-4)
- **Card Consistency**: All sections now use identical card styling

### v1.4.0 (January 2025)
- Added Red Card checkbox feature for dashers
- Red Card indicator "R" in dasher titles (similar to Crimson "C")
- Statistics section with dasher counts and balance breakdowns
- Red Card balance tracking in Statistics
- Vertical resize support for all text areas
- Real-time analytics for active, Crimson, and Red Card dashers
- Balance distribution visualization

### v1.3.0 (January 2025)
- Reordered chevron buttons: collapse (up) on left, expand (down) on right
- Improved button layout consistency across all sections

### v1.2.0 (January 2025)
- Added "Expand All" and "Collapse All" buttons for Store Address Book
- Added "Expand All" and "Collapse All" buttons for Dashers section
- All collapse states persist in localStorage and JSON export/import
- Auto-save triggers after bulk operations
- External stylesheet (styles.css) with CSS variables for theming

### v1.1.x series
- Color-coded dasher titles (name=purple, email=blue, balance=green/red)
- Crimson indicator "C" positioned between email and balance
- Fixed padding consistency to prevent layout jumps (py-0.5)
- Timer reset with TimerOff icon (orange color)
- Drag handle isolation to prevent accidental dragging
- JSON export version updated to 2.1
- All UI collapse states included in export/import

## GitHub Pages Deployment

The app deploys automatically via GitHub Actions:
1. Push to `main` branch for development
2. Merge to `gh-pages` branch for deployment
3. GitHub Actions builds and deploys
4. Live at: https://aaronvstory.github.io/dash-bash-utility/

### Branch Structure
- `main`: Development branch
- `gh-pages`: Production deployment branch
- Archives folder: Contains old versions and helper scripts

## File Structure
```
dash-bash-utility/
├── index.html                          # Main application (standalone HTML/React)
├── styles.css                          # External stylesheet with theming support
├── enhanced-calculator-addressbook.tsx # React component source
├── CLAUDE.md                           # This file - AI assistance guide
├── VERSION_UPDATE_GUIDE.md             # Version update instructions
├── STYLE_GUIDE.md                      # Comprehensive style documentation
├── README.md                           # User documentation
├── manifest.json                       # PWA manifest
├── service-worker.js                   # Offline functionality with cache busting
├── favicon.svg                         # App icon
├── serve-pwa.py                        # Local HTTPS server
├── serve-pwa.bat                       # Windows launcher
├── .claude/                            # Claude Code configuration
│   └── research/                       # Research notes from development
├── archives/                           # Old versions and scripts
│   ├── launch.bat                     # Archived launcher
│   └── versions/                      # Version history
└── exports/                            # User data backups
```

## Stylesheet Maintenance Guidelines

### When to Update styles.css
- **Adding New Components**: Define component classes with appropriate variants
- **Theme Changes**: Update CSS variables in `:root` and theme selectors
- **Responsive Updates**: Add/modify breakpoint-specific styles
- **Animation Changes**: Define new keyframes and animation classes
- **Accessibility Improvements**: Update focus styles and ARIA support

### Version Control for Styles
1. **Update styles.css**: Make your CSS changes
2. **Increment version**: Update `?v=1.2.0` in index.html link tag
3. **Update service worker**: Change VERSION constant if major update
4. **Document changes**: Note significant style changes in this file
5. **Test thoroughly**: Check all breakpoints and themes

### CSS Architecture Best Practices
- **Use CSS Variables**: All colors, spacing, and sizing via custom properties
- **Component-Based**: Create reusable component classes
- **Utility Classes**: Use utility classes for common patterns
- **Mobile-First**: Start with mobile styles, add breakpoints for larger screens
- **Semantic Naming**: Use descriptive class names that indicate purpose
- **Avoid !important**: Use specificity properly instead
- **Document Complex Styles**: Add comments for non-obvious implementations

### Theme Development
To add new themes:
1. Create new `[data-theme="theme-name"]` selector
2. Override CSS variables within theme selector
3. Test all components with new theme
4. Add theme toggle functionality in React component
5. Update documentation with theme details

## Debugging Tips

### Browser DevTools Inspection
- **localStorage**: DevTools > Application > Storage > Local Storage > `dashBashState`
- **Service Worker**: DevTools > Application > Service Workers (check registration, version, cache)
- **Console**: Watch for React warnings, state update logs, auto-save notifications
- **Network**: Verify CDN resources load (React, Babel, Tailwind, Lucide)

### Common Issues
1. **State not persisting**: Check localStorage quota, verify `saveAllToLocalStorage()` calls
2. **Version not updating**: Clear service worker, check cache name in service-worker.js
3. **Timers not updating**: Verify `timerTick` state updates every 1000ms
4. **Drag-and-drop not working**: Check `draggedItem` state, verify event handlers
5. **Copy buttons failing**: Check clipboard permissions, verify navigator.clipboard API

## Testing

### Current Test Files
Test files in root directory (as of v1.8.9):
- `test-simple.js` - Basic smoke test script
- `test-smoke.js` - Smoke test for core functionality
- `test-console.html` - Console-based testing interface

Historical test files are in `archives/test-files/`:
- `test-redcard.html` - Red Card checkbox feature
- `test-dashers-enhancement.html` - Dasher enhancements
- `test-collapsible-dashers.html` - Collapsible UI

### Running Tests
```bash
# Start development server
python serve-pwa.py

# Open main app
http://localhost:8443/index.html

# Run smoke tests (if implemented)
node test-simple.js
node test-smoke.js
```

### Testing Checklist

When making changes, verify:
- [ ] All sections have inline editing (no popups)
- [ ] Timers show seconds and update every second
- [ ] Copy buttons work for all fields
- [ ] Drag-and-drop works within and between categories
- [ ] localStorage saves/loads correctly
- [ ] JSON export/import includes all data and collapse states
- [ ] Red Card checkboxes save and restore properly
- [ ] Statistics section updates in real-time
- [ ] PWA installs and works offline
- [ ] Mobile responsive layout maintained
- [ ] Focus indicators present for accessibility
- [ ] Toast notifications appear/dismiss properly
- [ ] Expand/Collapse All buttons function correctly
- [ ] No layout jumping when switching edit/view modes
- [ ] Version numbers updated in all 4 locations
- [ ] Service worker cache busting works (check DevTools > Application)
- [ ] Update notification appears when new version deployed
- [ ] Chevron icons rotate smoothly on expand/collapse
- [ ] External stylesheet loads with version parameter
- [ ] CSS variables apply correctly to all components
- [ ] Text areas support vertical resizing (all notes fields)
- [ ] Print styles hide appropriate elements
- [ ] Earnings and cash-out forms validate input correctly
- [ ] Cash-out history auto-populates notes from selection
- [ ] Balance synchronization works after earnings/cash-outs
- [ ] Aria-live announcements work for success/error messages
- [ ] FastPay badge shows tooltip on hover
- [ ] Per-item notes collapse states persist in localStorage