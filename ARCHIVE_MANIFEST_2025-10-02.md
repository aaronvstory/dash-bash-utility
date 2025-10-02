# Archive Organization Manifest
**Date:** 2025-10-02  
**Purpose:** Organize unused files with full reversibility

## Files to Archive

### 1. Checkpoint Files → `archives/old-checkpoints/`
- `CHECKPOINT-2025-09-04-DASHERS.md`
- `CHECKPOINT-2025-09-04.md`
- `CHECKPOINT-COLLAPSIBLE-DASHERS.md`

### 2. Test Files → `archives/test-files/`
- `test-collapsible-dashers.html`
- `test-dashers-enhancement.html`

### 3. Old Versions → `archives/versions/`
- `index.html.broken-20250930`
- `styles2.css` (duplicate of styles.css)

### 4. Configuration Files → `archives/temp-files/`
- `_config.yml` (Jekyll config, not needed for React PWA)
- `launch.ps1` (duplicate launcher, launch.bat already archived)

### 5. Export Files → Stay in `exports/` (already organized)
- `dashbash-export-2025-09-30T07-40-30.json`
- `dashbash-export-2025-10-02T07-02-28.json`

## Files NOT Archived (Critical)
- `.yoyo/` - NEVER TOUCH (crucial snapshots per CLAUDE.md)
- `CLAUDE.md`, `README.md`, `STYLE_GUIDE.md`, `VERSION_UPDATE_GUIDE.md` - Documentation
- `index.html`, `enhanced-calculator-addressbook.tsx` - Main app
- `manifest.json`, `service-worker.js`, `favicon.svg` - PWA essentials
