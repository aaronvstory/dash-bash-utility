# Dash Bash Utility

A Progressive Web App (PWA) for delivery service drivers, featuring a target calculator and address book management system.

🔗 **[Use the App](https://aaronvstory.github.io/dash-bash-utility/)**

## Features

### 🎯 Target Calculator
- Calculate optimal quantities of items to reach a target dollar amount
- Color-coded results based on proximity to target
- Automatic best option highlighting
- Real-time calculation as prices are added/removed

### 📝 Quick Messages
- Pre-configured customer service message templates
- Drag-and-drop reordering
- In-line editing with save/cancel
- One-click copy to clipboard with visual confirmation

### 📍 Address Book
- Store locations with hours and notes
- Categorized organization (Dollar General, Tractor Supply Co., etc.)
- Real-time open/closed status with time remaining
- Drag-and-drop store reordering within categories
- Inline category renaming for seamless editing
- Automatic city/state extraction from addresses
- One-click copy for addresses to clipboard
- Persistent storage using browser localStorage

### 📝 Notes
- Multi-category note organization
- Drag-and-drop notes between categories
- Inline category renaming (no popups!)
- One-click copy for all note fields
- Add/delete categories on the fly
- Color-coded visual hierarchy

### 👥 Dashers
- Track active delivery dashers with contact info
- 24-hour countdown timers with seconds display
- Shows full date/time with day of week for "last used"
- Drag-and-drop category reordering
- Inline category renaming for consistency
- Copy buttons for all fields (name, email, notes)
- Custom categories (Main, Currently Using, Deactivated, etc.)
- Visual timer indicators (red < 24hrs, green > 24hrs)

### 💾 State Management
- Export/import complete application state
- Automatic backups to exports directory
- JSON format for easy data portability
- All sections fully integrated with persistence

## Installation

### As a PWA (Recommended)
1. Visit [the app](https://aaronvstory.github.io/dash-bash-utility/)
2. Click the install icon in your browser's address bar
3. Or use menu → Apps → Install this site as an app
4. The app will work offline once installed

### Local Development
```bash
# Clone the repository
git clone https://github.com/aaronvstory/dash-bash-utility.git
cd dash-bash-utility

# Run local server (Python required)
python serve-pwa.py
# Or on Windows
serve-pwa.bat

# Open http://localhost:8443/index.html
```

## Tech Stack
- React 18 with Hooks
- Tailwind CSS for styling
- Lucide icons
- Service Worker for offline functionality
- No build process required - runs directly in browser

## File Structure
```
dash-bash-utility/
├── index.html                # Main application (standalone HTML/React)
├── enhanced-calculator-addressbook.tsx  # React component source
├── manifest.json             # PWA manifest
├── service-worker.js         # Offline functionality
├── favicon.svg               # App icon
├── serve-pwa.py             # Local development server
├── serve-pwa.bat            # Windows batch launcher
└── exports/                  # State backup directory
```

## Browser Support
- Chrome/Edge (Recommended)
- Firefox
- Safari
- Any modern browser with JavaScript enabled

## Privacy
All data is stored locally in your browser. No server-side storage or tracking.

## License
MIT License - Feel free to use and modify as needed.

## Contributing
Pull requests welcome! Please feel free to submit improvements or bug fixes.

## Author
Created for DoorDash and delivery service drivers to optimize their workflow.