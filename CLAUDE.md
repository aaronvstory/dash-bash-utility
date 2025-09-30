# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dash Bash Utility is a React-based Progressive Web App (PWA) designed for delivery service drivers (primarily DoorDash). It's a **single-file application** that runs directly in the browser without any build process required.

**Core Features:**
- **Target Calculator**: Calculates optimal quantities to reach target dollar amounts ($99/$120/custom)
- **Quick Messages**: Customer service templates with drag-and-drop reordering
- **Address Book**: Store locations with hours tracking and real-time open/closed status
- **Notes**: Multi-category note-taking with drag-and-drop organization
- **Dashers**: Driver management with 24-hour countdown timers, inline editing, Red Card tracking
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

**Note**: This project has NO build process or package dependencies. It's a standalone HTML file that runs directly in the browser using CDN resources for React, Babel, and Tailwind CSS.

### Testing PWA Features
```bash
# Start HTTPS server with proper MIME types
python serve-pwa.py

# Open browser to http://localhost:8443
# Check DevTools > Application > Service Workers
# Install via browser prompt or DevTools > Application > Install
```

### Testing Specific Features
```bash
# Start server
python serve-pwa.py

# Navigate to test files
http://localhost:8443/test-redcard.html          # Red Card feature
http://localhost:8443/test-dashers-enhancement.html  # Dasher enhancements
http://localhost:8443/test-collapsible-dashers.html  # Collapsible UI
```

### Deployment to GitHub Pages

⚠️ **CRITICAL**: Always ensure changes are compiled from TSX to index.html before deploying!

```bash
# Step 1: Verify changes are in index.html
# Check that your TSX changes are reflected in index.html

# Step 2: Stage specific files (avoid Windows reserved files like 'nul')
git add enhanced-calculator-addressbook.tsx index.html
# Or if no reserved files: git add -A

# Step 3: Commit with descriptive message
git commit -m "Your descriptive message"

# Step 4: Push to main branch
git push origin main

# Step 5: Deploy to GitHub Pages (gh-pages branch)
git checkout gh-pages
git merge main --no-edit
git push origin gh-pages
git checkout main

# The site will update at: https://aaronvstory.github.io/dash-bash-utility/
# Note: GitHub Pages may take 1-2 minutes to reflect changes
```

**Regular Commit Practice**: Commit frequently to avoid losing work and maintain version history. Each feature or fix should be its own commit.

## Architecture

### Core Design Pattern
Single-file React application using functional components and hooks. No build process required - runs directly in browser with CDN dependencies. The TSX component (`enhanced-calculator-addressbook.tsx`) is compiled to inline JavaScript in `index.html` for standalone use.

### ⚠️ CRITICAL: TSX to HTML Compilation
**IMPORTANT**: Changes made to `enhanced-calculator-addressbook.tsx` are NOT automatically reflected in the app. The TSX file is the source component, but `index.html` contains the actual served inline JavaScript that runs in the browser.

**When modifying the application:**
1. Make changes to `enhanced-calculator-addressbook.tsx` (source component)
2. **MUST manually update** corresponding code in `index.html` (served file)
3. The JavaScript in `index.html` is between `<script type="text/babel">` tags
4. Test locally with `python serve-pwa.py` before deploying

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
Dynamic title generation with color coding (v1.4.0+):
- Name: Purple (default text color)
- Email: Blue (`text-blue-400`)
- Crimson indicator: "C" between email and balance (red when active, gray when not)
- Red Card indicator: "R" after Crimson indicator (red when active, gray when not)
- Balance: Green if $0 (`text-green-400`), Red otherwise (`text-red-500`)
- Format: "Name - Email - C - R - Balance"
- Returns JSX/React.Fragment with styled spans

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
  "dasherCategories": [...],  // Dashers with timers
  "collapsedCategories": {...},     // Address book collapse states
  "collapsedStores": {...},         // Individual store collapse states
  "collapsedDashers": {...},        // Individual dasher collapse states  
  "collapsedDasherCategories": {...}, // Dasher category collapse states
  "collapsedNoteCategories": {...},   // Note category collapse states
  "timestamp": "2025-01-01T00:00:00.000Z"
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

### Padding Consistency (v1.1.5+)
- Input fields: `px-2 py-0.5` (not `py-1`)
- Display text: `px-2 py-0.5` (matching padding)
- Prevents layout jumps when switching between view/edit modes

## Version Management & Cache Busting

### Version Update Process
When releasing a new version, update the version number in **4 locations**:

1. **service-worker.js** (Line 2):
   ```javascript
   const CACHE_NAME = 'dashbash-v2'; // Update version in cache name
   ```

2. **index.html - Meta tag** (Line 9):
   ```html
   <meta name="app-version" content="1.4.0">
   ```

3. **index.html - JavaScript constant** (Line 48):
   ```javascript
   const APP_VERSION = '1.4.0'; // Update this with each release
   ```

4. **index.html - App title display** (around Line 1808):
   ```html
   <span className="text-lg text-gray-400">v1.4.0</span>
   ```

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
The application now uses a comprehensive external stylesheet (`styles.css`) designed for maintainability and future theming. The stylesheet is version-controlled and loaded with cache-busting parameters.

**Key Features:**
- **CSS Variables**: All colors, spacing, typography, and animations defined as variables
- **Theming Ready**: Support for dark/light themes via `data-theme` attribute
- **Component Classes**: Reusable classes for buttons, cards, inputs, and UI patterns
- **Responsive Utilities**: Mobile-first breakpoints (sm, md, lg, xl)
- **Accessibility**: Focus styles, screen reader support, reduced motion
- **Print Styles**: Clean printing with appropriate element hiding

**File Location**: `styles.css?v=1.2.0` (update version on changes)

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

### Test Files
The repository includes test HTML files for validating specific features:
- `test-redcard.html` - Tests Red Card checkbox feature
- `test-dashers-enhancement.html` - Tests dasher enhancements
- `test-collapsible-dashers.html` - Tests collapsible UI

### Running Tests
```bash
# Open test files directly in browser
python serve-pwa.py
# Then navigate to http://localhost:8443/test-redcard.html
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
- [ ] Text areas support vertical resizing
- [ ] Print styles hide appropriate elements