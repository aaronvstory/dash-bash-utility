# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dash Bash Utility is a React-based Progressive Web App (PWA) designed for delivery service drivers (primarily DoorDash). It's a single-file application that runs directly in the browser without any build process required.

**Core Features:**
- **Target Calculator**: Calculates optimal quantities to reach target dollar amounts ($99/$120/custom)
- **Quick Messages**: Customer service templates with drag-and-drop reordering  
- **Address Book**: Store locations with hours tracking and real-time open/closed status
- **Notes**: Multi-category note-taking with drag-and-drop organization
- **Dashers**: Driver management with 24-hour countdown timers and inline editing

## Commands

### Running the Application
```bash
# Quick start (Windows)
serve-pwa.bat

# Python server (all platforms)  
python serve-pwa.py

# Access at: http://localhost:8443/index.html
```

### Testing PWA Features
```bash
# Start HTTPS server with proper MIME types
python serve-pwa.py

# Open browser to http://localhost:8443
# Check DevTools > Application > Service Workers
# Install via browser prompt or DevTools > Application > Install
```

### Deployment to GitHub Pages

⚠️ **IMPORTANT**: Always ensure changes are compiled from TSX to index.html before deploying!

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

### Development Integration (Optional)
```bash
# Option 1: Create React App
npx create-react-app dash-bash --template typescript
cp enhanced-calculator-addressbook.tsx src/App.tsx
npm install lucide-react
npm start

# Option 2: Vite
npm create vite@latest dash-bash -- --template react-ts
cp enhanced-calculator-addressbook.tsx src/App.tsx  
npm install lucide-react
npm run dev

# Option 3: Next.js
npx create-next-app@latest dash-bash --typescript --tailwind
cp enhanced-calculator-addressbook.tsx app/page.tsx
npm install lucide-react
npm run dev
```

## Architecture

### Core Design Pattern
Single-file React application using functional components and hooks. No build process required - runs directly in browser with CDN dependencies. The TSX component (`enhanced-calculator-addressbook.tsx`) is compiled to inline JavaScript in `index.html` for standalone use.

### ⚠️ CRITICAL: TSX to HTML Compilation
**IMPORTANT**: Changes made to `enhanced-calculator-addressbook.tsx` are NOT automatically reflected in the app. The TSX file is the source component, but `index.html` contains the actual served inline JavaScript that runs in the browser.

**When modifying the application:**
1. Make changes to `enhanced-calculator-addressbook.tsx` (source component)
2. **MUST manually update** corresponding code in `index.html` (served file)
3. The JavaScript in `index.html` is between `<script type="text/babel">` tags
4. Lucide icons are defined as: `const IconName = (props) => React.createElement(Icon, { ...props, name: 'icon-name' });`
5. Test locally with `launch.bat` or `python serve-pwa.py` before deploying

### State Management
- **Unified State**: Single `dashBashState` key in localStorage containing all app data
- **Hook-based**: useState for local state, useEffect for persistence
- **Auto-save**: Critical data saved on change, manual save for address book
- **Import/Export**: Full state backup/restore via JSON files

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
│   └── Real-time hours calculation
├── Notes Section (right column middle-bottom)
│   ├── Multi-category with inline renaming
│   └── Copy buttons for all fields
└── Dashers Section (right column bottom)
    ├── 24-hour countdown timers (updates every second)
    ├── Inline category renaming
    └── Drag-and-drop between categories
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

## localStorage Structure

**Single unified key**: `dashBashState` contains all application data as JSON:
```json
{
  "target": "99",
  "targetPreset": "99",  // "99", "120", or "custom"
  "messages": [...],
  "categories": [...],        // Address book
  "noteCategories": [...],    // Notes sections  
  "dasherCategories": [...]   // Dashers with timers
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
    className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
    onBlur={() => setEditingCategory(-1)}
    onKeyPress={(e) => e.key === 'Enter' && setEditingCategory(-1)}
    onClick={(e) => e.stopPropagation()}
    autoFocus
  />
) : (
  <h4 className="font-medium text-blue-300">{category.name}</h4>
)}
```

## PWA Configuration

### Service Worker
- **Cache Strategy**: Cache-first with network fallback
- **Offline Support**: All resources cached for offline use
- **Cache Name**: `dashbash-v1` with automatic cleanup
- **Resources Cached**: HTML, JS (React/Babel), CSS (Tailwind), icons (Lucide)

### Manifest
- **Display**: Standalone for app-like experience
- **Theme**: Dark theme with gray-900 background
- **Icons**: Multiple sizes for different devices
- **Start URL**: index.html

## Style Guide (STYLE_GUIDE.md)

### Color Hierarchy
- **Backgrounds**: gray-900 → gray-800 → gray-700 → gray-600
- **Text**: gray-100 (primary) → gray-300 → gray-400 → gray-500
- **Actions**: blue (copy), green (save), yellow (edit), red (delete), purple (special)
- **Section Icons**: blue-400 (calculator), green-400 (messages), amber-400 (address), purple-400 (notes), indigo-400 (dashers)

### Component Patterns
- **Collapsible headers**: ChevronDown/ChevronUp with item counts
- **Inline editing**: Focus rings matching section colors
- **Drag handles**: GripVertical icon with cursor-move
- **Copy buttons**: Blue with hover state
- **Toast notifications**: Fixed positioning with auto-dismiss

### Spacing Convention
- **Container padding**: `p-4` (1rem)
- **Section spacing**: `space-y-4` (1rem gaps)
- **Inline spacing**: `space-x-2` (0.5rem gaps)
- **Grid gaps**: `gap-4` for sections

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

### Copy to Clipboard Pattern
```javascript
const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
  setCopyNotification(`✓ Copied: ${text.substring(0, 30)}...`);
  setTimeout(() => setCopyNotification(''), 2000);
};
```

### Performance Optimizations
- **Timer Updates**: Use `timerTick` counter (1000ms interval) for seconds display
- **Debounced Saves**: Auto-save with 100ms delay after changes
- **Lazy State Init**: Heavy computations only on mount
- **Event Delegation**: Single handlers for repeated elements

## Recent Updates (September 2025)

### UI Consistency Improvements
- Replaced ALL popup prompts with inline editing
- Dashers and Notes sections now use same pattern as Address Book
- Consistent focus ring colors matching section themes
- Professional, cohesive interface throughout

### Timer Enhancements
- Added seconds display to 24-hour countdown
- Full date/time with day of week display
- Purple timer icon (distinct from blue copy buttons)
- 1000ms update interval for real-time accuracy
- Added TimerOff icon for timer reset (orange color for visual distinction)

### Feature Additions
- Copy buttons for ALL fields (Dashers name/email/notes, Notes content)
- Drag-and-drop category reordering for Dashers
- Category deletion with trash icons
- "Add New Category" buttons for dynamic organization
- Target Calculator collapsed by default (better mobile UX)

### Bug Fixes (Latest)
- **Fixed dasher drag-and-drop**: Individual dashers now only draggable by their drag handle (GripVertical icon), preventing accidental category dragging
- **Improved timer reset icon**: Replaced Trash2 with TimerOff icon for better UX clarity
- **Drag handle isolation**: Drag operations now properly isolated to prevent event bubbling

### State Management Updates
- Added `editingDasherCategory` and `editingNoteCategory` states
- Full localStorage integration for all new features
- JSON export/import supports all sections
- Backward compatibility maintained

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
├── enhanced-calculator-addressbook.tsx # React component source
├── CLAUDE.md                           # This file - AI assistance guide
├── STYLE_GUIDE.md                      # Comprehensive style documentation
├── README.md                           # User documentation
├── manifest.json                       # PWA manifest
├── service-worker.js                   # Offline functionality
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

## Testing Checklist

When making changes, verify:
- [ ] All sections have inline editing (no popups)
- [ ] Timers show seconds and update every second
- [ ] Copy buttons work for all fields
- [ ] Drag-and-drop works within and between categories
- [ ] localStorage saves/loads correctly
- [ ] JSON export/import includes all data
- [ ] PWA installs and works offline
- [ ] Mobile responsive layout maintained
- [ ] Focus indicators present for accessibility
- [ ] Toast notifications appear/dismiss properly