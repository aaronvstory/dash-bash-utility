# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **📐 Style Guide**: All UI development must follow the patterns in `STYLE_GUIDE.md` for consistent design.

## Project Overview

Dash Bash Utility is a React-based Progressive Web App (PWA) designed for delivery service drivers (primarily DoorDash). A single-file application that runs directly in the browser without any build process required.

**Main Features:**
- **Target Calculator**: Calculates optimal quantities to reach target dollar amounts ($99/$120/custom)
- **Quick Messages**: Customer service templates with drag-and-drop reordering  
- **Address Book**: Store locations with hours tracking and real-time open/closed status
- **Notes**: Multi-category note-taking with drag-and-drop organization
- **Dashers**: Driver management with 24-hour countdown timers

## Commands

### Running the Application
```bash
# Quick start (Windows)
serve-pwa.bat

# Python server (all platforms)  
python serve-pwa.py

# Access at: http://localhost:8443/index.html
```

### PWA Testing
```bash
# Start HTTPS server with proper MIME types
python serve-pwa.py

# Open browser to http://localhost:8443
# Install via browser prompt or DevTools > Application > Install
```

### Development Integration
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

- **Unified State**: Single `dashBashState` key in localStorage containing all app data
- **Hook-based Management**: useState for local state, useEffect for persistence
- **Automatic Saves**: Critical data saved on change, manual save for address book
- **Import/Export**: Full state backup/restore via JSON files in `exports/` directory

### Component Structure
```
EnhancedCalculator (main component)
├── State Management Layer (hooks, localStorage)
├── Calculator Section (left column)
│   └── Quantity calculation algorithm
├── Messages Section (right column top)
│   └── Drag-and-drop reordering
├── Address Book (right column middle)
│   ├── Store categories with drag-and-drop
│   └── Real-time hours calculation
├── Notes Section (right column middle-bottom)  
│   └── Multi-category with drag-and-drop
└── Dashers Section (right column bottom)
    └── 24-hour timer tracking system
```

### Data Flow
1. **User Input** → React State → UI Update
2. **State Changes** → localStorage (auto or manual save)
3. **Page Load** → localStorage → React State initialization
4. **Export/Import** → JSON files → Full state replacement

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
24-hour countdown tracking:
- Monitors time since `lastUsed` timestamp
- Shows countdown for < 24 hours, elapsed time for > 24 hours
- Color codes: red (< 24hrs), orange (≤ 1hr), green (> 24hrs)
- Uses `timerTick` counter for efficient re-renders

## localStorage Structure

**Single unified key**: `dashBashState` contains all application data as JSON:
```json
{
  "target": "99",
  "targetPreset": "99",
  "messages": [...],
  "categories": [...],        // Address book
  "noteCategories": [...],    // Notes sections
  "dasherCategories": [...]   // Dashers with timers
}
```

## PWA Configuration

### Service Worker
- **Cache Strategy**: Cache-first with network fallback
- **Offline Support**: All resources cached for offline use
- **Cache Name**: `dashbash-v1` with automatic cleanup of old versions
- **Resources Cached**: HTML, JS (React/Babel), CSS (Tailwind), icons (Lucide)

### Deployment
**GitHub Pages**: https://aaronvstory.github.io/dash-bash-utility/
- Automatic deployment on push to main branch
- Service worker enables full offline functionality
- No build step required - serves index.html directly

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

### Performance Optimizations
- **Timer Updates**: Use `timerTick` counter instead of force re-renders
- **Debounced Saves**: Critical data saves immediately, others debounced
- **Lazy State Init**: Heavy computations only on mount
- **Event Delegation**: Single handlers for repeated elements

## Style Guide Reference

All UI must follow `STYLE_GUIDE.md`:
- **Dark Theme**: gray-900 background, gray-800/700/600 hierarchy
- **Colors**: Semantic colors for actions (blue=copy, green=save, red=delete)
- **Spacing**: Consistent p-4 padding, space-y-4 gaps
- **Components**: Reusable patterns for buttons, inputs, cards
- **Animations**: Subtle transitions with `transition-colors`