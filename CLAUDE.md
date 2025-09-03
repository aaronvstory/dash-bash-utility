# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **📐 Style Guide**: All UI development must follow the patterns in `STYLE_GUIDE.md` for consistent design.

## Project Overview

Dash Bash Utility is a React-based Progressive Web App (PWA) designed for delivery service drivers (primarily DoorDash). It provides four main collapsible tools:

- **Target Calculator**: Calculates optimal quantities of items to reach a target dollar amount with quick-select between $99/$120/custom
- **Quick Messages**: Pre-configured customer service message templates with drag-and-drop reordering  
- **Address Book**: Store locations with hours tracking, real-time open/closed status, organized by category
- **Notes**: Multi-category note-taking system with drag-and-drop organization and persistent storage

The application is a single-file solution that runs directly in the browser without any build process required.

## Architecture

### File Structure
- **enhanced-calculator-addressbook.tsx**: Main React component with all functionality
- **index.html**: Standalone HTML version that can be opened directly in a browser or saved as a PWA (formerly dash-bash-utility.html)
- **manifest.json**: PWA manifest for installable app configuration
- **service-worker.js**: Offline caching for PWA functionality
- **serve-pwa.py** / **serve-pwa.bat**: Local HTTPS server for PWA testing
- **favicon.svg**: Application favicon featuring a dollar sign with dash marks on a dark background
- **STYLE_GUIDE.md**: Comprehensive styling conventions and component patterns
- **exports/**: Directory for exported/imported state backups

### Single Component Application
The entire application is contained in a single React functional component using hooks for state management. Available in both TSX format for development and HTML format for direct browser use.

### Key Features

#### Target Calculator (Left Column)
- Quick-select target amounts: $99, $120, or custom value
- Calculates all valid quantity combinations for each price
- Color-coded results: Green (optimal), Yellow (close), Orange (moderate), Red (far)
- Automatic best option highlighting based on proximity to target
- Real-time calculation with Enter key navigation

#### Quick Messages System (Right Column Top)
- Pre-configured customer service templates (refunds, tips, agent requests)
- Drag-and-drop reordering with visual feedback
- In-line editing with explicit save/cancel
- One-click copy to clipboard with toast notification
- Persistent message order and content

#### Address Book (Right Column Middle)
- Categorized store locations (Dollar General, Tractor Supply Co., etc.)
- Store hours tracking with real-time open/closed status
- Time-until-close calculations with color warnings
- Automatic city/state extraction from addresses
- Drag-and-drop stores between/within categories
- Edit mode toggle per store with inline field editing
- Manual save to localStorage

#### Notes Section (Right Column Bottom)
- Multi-category note organization
- Drag-and-drop notes between categories
- In-line note editing with save/cancel
- Category management (add/delete)
- Automatic localStorage persistence
- Collapsible categories for space management

## Development

### Running the Application

#### Direct Browser Use (No Build Required)
The simplest way to use the application:
```bash
# Windows
serve-pwa.bat

# Or directly with Python
python serve-pwa.py
```
Then open http://localhost:8443/index.html

The HTML file can also be opened directly in any browser without a server.

#### PWA Installation
The app supports Progressive Web App installation:
1. Serve the app using `serve-pwa.py` (provides proper MIME types)
2. Open http://localhost:8443/index.html
3. Look for install icon in address bar (Chrome/Edge)
4. Or use menu → Apps → Install this site as an app

#### Development with Build System
For development with hot reload, integrate the TSX component:

1. **Option 1 - Create React App**:
```bash
npx create-react-app dash-bash --template typescript
cp enhanced-calculator-addressbook.tsx src/App.tsx
npm install lucide-react
npm start
```

2. **Option 2 - Vite**:
```bash
npm create vite@latest dash-bash -- --template react-ts
cp enhanced-calculator-addressbook.tsx src/App.tsx
npm install lucide-react
npm run dev
```

3. **Option 3 - Next.js**:
```bash
npx create-next-app@latest dash-bash --typescript --tailwind
cp enhanced-calculator-addressbook.tsx app/page.tsx
npm install lucide-react
npm run dev
```

### Dependencies
- React 18+ with hooks (useState, useEffect, useRef)
- lucide-react for icons
- Tailwind CSS for styling (dark theme with gray-900 background)
- All dependencies are loaded from CDN in the HTML version (no npm install needed)

## State Management

The component uses React hooks for all state management:

### Calculator State
- `target`: Target dollar amount (default: '99')
- `targetPreset`: Selected preset ('99', '120', or 'custom')
- `prices`: Array of product prices
- `currentPrice`: Current price being entered

### Messages State
- `messages`: Array of quick copy messages
- `editingIndex`: Currently editing message index
- `draggedIndex`: Index for drag-and-drop operations
- `copyNotification`: Toast notification for clipboard operations

### Address Book State
- `categories`: Array of store categories with nested stores (persisted to localStorage)
- `currentTime`: Real-time clock updates every minute
- `editingStore`: Tracks which store is in edit mode
- `saveNotification`: Toast notification for save operations
- Store properties: address, openTime, closeTime, notes

### Notes State
- `noteCategories`: Array of note categories with nested notes
- `editingNote`: Tracks which note is being edited {categoryId, noteIndex}
- `draggedNote`: Tracks note being dragged for reordering
- `collapsedNoteCategories`: Tracks collapsed state of each category
- Automatic persistence to localStorage

### State Management Features
- `isStateManagementOpen`: Toggle for state management panel
- `availableExports`: List of saved state backups in exports directory
- `importNotification`: Toast notification for import operations
- Export/Import functionality for complete application state
- Unified state persistence to `dashBashState` in localStorage

## Key Algorithms

### Quantity Calculation
The `calculateQuantities` function determines all valid quantity options for a given price:
- Calculates maximum quantity that fits within target
- Returns all valid options sorted by difference from target
- Best option prioritizes smallest difference, then lowest quantity

### Time Status Calculation
The `calculateTimeStatus` function (replacing `calculateMinutesUntilClose`):
- Parses 24-hour format times (e.g., "1630" for 4:30 PM, "2100" for 9:00 PM)
- Returns comprehensive status object with open/closed state
- Calculates hours and minutes remaining until close
- Handles day rollover for stores closing after midnight
- Assumes 6:00 AM opening time for closed status determination
- Color codes: red (closed or <60min), yellow (<120min), green (>120min)

### City/State Extraction
The `extractCityState` function:
- Parses full addresses to extract city and state
- Handles multiple address formats (comma-separated)
- Returns formatted "City, State" string for display

## UI/UX Patterns

### Color Coding
- **Calculator Results**: Green (optimal), Lime (very close), Yellow (close), Amber (moderate), Orange (far), Red (very far/too expensive)
- **Time Warnings**: Red (closing soon), Yellow (closing in 1-2 hours), Green (plenty of time)
- **Actions**: Blue (copy), Yellow (edit), Red (delete), Green (save/add)

### Interaction Patterns
- Enter key navigation between inputs for speed
- Auto-focus on price input for rapid entry
- Drag-and-drop with visual feedback
- Inline editing with explicit save/cancel
- Toast notifications for clipboard and save operations
- Toggle edit mode for store details (non-edit shows read-only formatted view)
- Save button persists address book to localStorage

## Data Persistence

### localStorage Keys
- `dashBashState`: Unified state storage containing all application data
  - `target`: Current target amount
  - `targetPreset`: Selected preset ('99', '120', or 'custom')
  - `messages`: Quick messages array
  - `categories`: Address book categories with stores
  - `noteCategories`: Notes categories with notes
- `addressBookCategories`: Legacy key for backward compatibility
- Loaded on component mount, saved automatically or manually
- Handles JSON parse errors gracefully with fallback to defaults

## PWA Features

### Service Worker
The service worker (service-worker.js) provides:
- Offline functionality through aggressive caching
- Cache-first strategy for all app resources
- Automatic cache updates on new deployments
- Network fallback for dynamic content

### Installation
The app can be installed as a PWA on desktop and mobile:
- Manifest includes app icons, theme colors, and display mode
- Standalone display mode for app-like experience
- Launch handler for single-instance behavior

## Common Development Tasks

### Running Locally
```bash
# Windows - Quick start
serve-pwa.bat

# Python direct (all platforms)
python serve-pwa.py

# Access at http://localhost:8443/index.html
```

### Testing PWA Installation
```bash
# Start server with MIME types
python serve-pwa.py

# Open http://localhost:8443
# Check DevTools > Application > Manifest
# Install via browser prompt or DevTools
```

### Deploying to GitHub Pages
The app is deployed at: https://aaronvstory.github.io/dash-bash-utility/
- Push changes to main branch
- GitHub Pages serves index.html automatically
- Service worker enables offline functionality

### Key Code Modifications

#### Adding New Features
New sections follow the collapsible pattern:
```javascript
const [isSectionOpen, setIsSectionOpen] = useState(false);
// Add section UI with ChevronDown/ChevronUp toggle
```

#### Modifying Target Presets
Update the target selector logic in the calculator section:
- Modify `targetPreset` state values ('99', '120', 'custom')
- Update button click handlers for preset selection

#### Changing Color Schemes
- Calculator results: Modify `getColorForDifference()` function
- Time warnings: Update `calculateTimeStatus()` color logic
- UI elements: Adjust Tailwind classes (gray-XXX, blue-XXX, etc.)

#### Adding New Store Categories
Categories are created via UI, but default categories can be added in the initial `categories` state array.

#### Customizing Quick Messages
Default messages are in the initial `messages` state array. Modify to change startup templates.

### State Management

#### Export/Import Format
State exports create JSON files with timestamp:
```json
{
  "target": "99",
  "targetPreset": "99",
  "messages": [...],
  "categories": [...],
  "noteCategories": [...]
}
```

#### localStorage Structure
All data stored under `dashBashState` key as stringified JSON. Legacy `addressBookCategories` supported for backward compatibility.

### Performance Considerations
- React 18 with hooks for efficient re-renders
- Virtual scrolling not needed (typical data size <100 items)
- Service worker caches all resources for instant load
- Minimal external dependencies (React, Tailwind, Lucide icons)

## Style Guide

**IMPORTANT**: See `STYLE_GUIDE.md` for comprehensive styling conventions. All new features and modifications must follow the established design patterns documented there, including:
- Color palette (dark theme with gray-900 base)
- Component patterns (collapsible sections, buttons, inputs)
- Layout structure and spacing conventions
- Interactive states and animations
- Icon usage and sizing guidelines
- Template for adding new sections