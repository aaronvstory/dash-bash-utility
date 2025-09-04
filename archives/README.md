# Dash Bash Utility - Archives

This directory contains archived versions and temporary files from the Dash Bash Utility project development.

## Directory Structure

### `versions/2025-08/`
Contains historical versions of the main application files.

#### File Evolution Timeline:
1. **v1-dash-bash-utility-2025-08-26.html** (91KB)
   - Original version with 3 sections: Target Calculator, Quick Messages, Address Book
   - Basic functionality without Notes or Dashers sections
   - **Status**: ARCHIVED - GPT-5 reviewed this outdated version

2. **index.html** (Current: 124KB, Aug 30)
   - Intermediate version with 4 sections: Target Calculator, Quick Messages, Address Book, Notes
   - Added Notes section with drag-and-drop functionality
   - **Status**: ACTIVE - Standalone HTML version for direct browser use

3. **enhanced-calculator-addressbook.tsx** (Current: 80KB, Sep 2)
   - Latest version with 5 sections: Target Calculator, Quick Messages, Address Book, Notes, Dashers
   - Added Dashers section with 24-hour timer tracking
   - **Status**: ACTIVE - TypeScript React component for development

### `temp-files/`
Contains temporary session files and notes.

- **session-notes-2025-09-02.txt**: Development session notes from continuing previous work

## Current Active Files (Root Directory)

### Primary Application Files:
- **index.html** - Standalone HTML version (can run directly in browser)
- **enhanced-calculator-addressbook.tsx** - TypeScript React component (latest features)

### Supporting Files:
- **manifest.json** - PWA manifest
- **service-worker.js** - PWA offline functionality  
- **favicon.svg** - Application icon
- **serve-pwa.py** / **serve-pwa.bat** - Local HTTPS server for PWA testing
- **STYLE_GUIDE.md** - UI/UX styling conventions
- **CLAUDE.md** - Project documentation for Claude Code
- **README.md** - Project overview

### Directories:
- **exports/** - For state import/export functionality
- **.claude/** - Claude Code configuration and research
- **.git/** - Git repository
- **.vscode/** - VSCode settings

## Why Files Were Archived

### v1-dash-bash-utility-2025-08-26.html → ARCHIVED
- **Reason**: Outdated version missing Notes and Dashers sections
- **Issue**: GPT-5 reviewed this old version, causing confusion about current features
- **New Location**: `archives/versions/2025-08/v1-dash-bash-utility-2025-08-26.html`

### session-notes-2025-09-02.txt → ARCHIVED
- **Reason**: Temporary development notes, not part of core application
- **New Location**: `archives/temp-files/session-notes-2025-09-02.txt`

## Development Workflow

### For New Features:
1. Update **enhanced-calculator-addressbook.tsx** (React component)
2. Update **index.html** (standalone version) to match functionality
3. Test both versions to ensure feature parity

### For Deployment:
- **GitHub Pages**: Serves `index.html` directly
- **Development**: Use the TSX component with build systems (Vite, Next.js, etc.)

## Archive Maintenance

- Archive old versions when major features are added
- Keep session notes for 30 days, then remove
- Maintain version history for rollback capability
- Document feature evolution for development reference

---
*Archive created: 2025-09-03*
*Last updated: 2025-09-03*