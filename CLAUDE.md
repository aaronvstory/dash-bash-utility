# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dash Bash Utility is a React-based utility application that provides three main collapsible tools for delivery service management (likely DoorDash operations):

- **Target Calculator**: Calculates optimal quantities of items to reach a target dollar amount
- **Quick Copy Messages**: Pre-configured messages for common customer service scenarios  
- **Store Address Book**: Store locations with hours and notes, organized by category with localStorage persistence

The application features a fully collapsible interface where each main section and subsection can be collapsed for better organization.

## Architecture

### File Structure
- **enhanced-calculator-addressbook.tsx**: Main React component with all functionality
- **index.html**: Standalone HTML version that can be opened directly in a browser or saved as a PWA (formerly dash-bash-utility.html)
- **manifest.json**: PWA manifest for installable app configuration
- **service-worker.js**: Offline caching for PWA functionality
- **serve-pwa.py** / **serve-pwa.bat**: Local HTTPS server for PWA testing
- **favicon.svg**: Application favicon featuring a dollar sign with dash marks on a dark background
- **exports/**: Directory for exported/imported state backups

### Single Component Application
The entire application is contained in a single React functional component using hooks for state management. Available in both TSX format for development and HTML format for direct browser use.

### Key Features

#### Target Calculator (Left Column)
- Calculates how many items at given prices can fit within a target dollar amount
- Color-coded results based on how close they are to the target
- Automatic best option highlighting (green for optimal choice)
- Real-time calculation as prices are added/removed

#### Quick Messages System (Right Column Top)
- Drag-and-drop reordering of messages
- In-line editing with save/cancel
- Copy to clipboard with visual confirmation
- Pre-populated with customer service response templates

#### Address Book (Right Column Bottom)
- Categorized store locations (e.g., Dollar General, Tractor Supply Co.)
- Store hours tracking with enhanced time status display (open/closed indicators)
- Real-time clock display updating every minute
- Notes field for each location
- Copy address to clipboard functionality
- Automatic city/state extraction from addresses for better display
- localStorage persistence with save button
- Edit mode toggle for each store with inline editing

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
- `target`: Target dollar amount (default: '120')
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

### State Management Features
- `isStateManagementOpen`: Toggle for state management panel
- `availableExports`: List of saved state backups in exports directory
- `importNotification`: Toast notification for import operations
- Export/Import functionality for complete application state
- Drag-and-drop support for store reordering within and between categories

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
- `addressBookCategories`: Stores the complete categories array with all store data
- Loaded on component mount, saved manually via Save button
- Handles JSON parse errors gracefully

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

## Common Tasks

### Testing PWA Features
```bash
# Start local server with proper MIME types
python serve-pwa.py
# Open http://localhost:8443/index.html
# Check DevTools > Application > Service Workers
```

### Deploying the App
The HTML file is self-contained and can be:
- Hosted on any static web server
- Opened directly from file system
- Installed as a PWA from HTTPS origin
- Served locally with the included Python server

### Adding New Quick Messages
Messages are stored in the `messages` state array. The UI provides add/edit/delete functionality.

### Adding Store Categories
Categories are managed through the UI with the "Add New Store Category" button.

### Managing Store Data
- Toggle edit mode per store using the edit button (changes to save icon when editing)
- In edit mode: All fields become editable inputs
- In read mode: Shows formatted, read-only display with proper empty state handling
- Save address book data using the green Save button in the header
- Drag stores between categories or reorder within categories

### State Backup and Recovery
- Export current state to JSON file in exports directory
- Import previous state from saved backups
- State management panel shows available backups
- Automatic filename generation with timestamps

### Modifying Calculator Logic
The calculation logic is in `calculateQuantities` and `findBestOption` functions. Modify these to change how optimal quantities are determined.

### Styling Changes
All styling uses Tailwind CSS classes. The app uses a dark theme with gray-900 background and various gray shades for components.