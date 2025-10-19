# GitHub Pages Deployment Guide

## Overview
This guide explains how the Dash Bash app has been configured for GitHub Pages deployment with all dependencies bundled locally (no CDN dependencies).

## What Changed (Version 1.9.6)

### CDN Dependencies → Local Vendor Files
All external CDN dependencies have been replaced with local copies for reliable GitHub Pages deployment:

**Before:**
- React 18 (unpkg CDN)
- ReactDOM 18 (unpkg CDN)
- Tailwind CSS (cdn.tailwindcss.com)
- Lucide Icons (unpkg CDN)

**After:**
- `vendor/react.production.min.js` (11 KB)
- `vendor/react-dom.production.min.js` (129 KB)
- `vendor/react-window.js` (14 KB)
- `vendor/lucide.min.js` (366 KB)
- `tailwind.css` (31 KB, built locally)

**Note:** Google Fonts still loads from CDN as it's served with proper CORS headers and is designed for cross-origin use.

## File Structure
```
dash-bash-utility/
├── index.html                    # Updated to use local vendor files
├── tailwind.css                  # Built locally (commit this!)
├── tailwind.config.js            # Tailwind configuration
├── src/
│   └── input.css                # Tailwind source
├── vendor/                       # All vendor files (commit this!)
│   ├── react.production.min.js
│   ├── react-dom.production.min.js
│   ├── react-window.js
│   └── lucide.min.js
├── dash-bash-compiled.js         # Compiled JSX
└── dash-bash-component.jsx       # JSX source
```

## Build Process

### 1. One-time Setup (Already Done)
```bash
# Install Tailwind CSS
npm install -D tailwindcss

# Download vendor files (if needed)
npm run vendor:prepare
```

### 2. Regular Build Workflow
```bash
# Build everything (CSS + JSX compilation)
npm run build

# This runs:
# 1. npm run build:css     - Builds Tailwind CSS
# 2. npm run extract-jsx   - Extracts JSX from index.html
# 3. npm run compile       - Compiles JSX to JavaScript
```

### 3. Deploy to GitHub Pages
```bash
# Automated deployment (recommended)
npm run deploy

# This runs:
# 1. npm run build
# 2. git add index.html dash-bash-compiled.js tailwind.css
# 3. git commit -m 'build: precompiled JSX + local vendor files'
# 4. git push origin main
# 5. git checkout gh-pages
# 6. git merge main --no-edit
# 7. git push origin gh-pages
# 8. git checkout main
```

## Important: Files to Commit

Always commit these files:
- ✅ `vendor/` directory (all vendor files)
- ✅ `tailwind.css` (built CSS)
- ✅ `tailwind.config.js` (Tailwind config)
- ✅ `src/input.css` (Tailwind source)
- ✅ `dash-bash-compiled.js` (compiled JSX)
- ✅ `index.html` (main HTML file)

Do NOT commit:
- ❌ `node_modules/` (already in .gitignore)

## Updating Vendor Files

If you need to update React, ReactDOM, or Lucide versions:

1. Update the URLs in the `vendor:prepare` script in `package.json`
2. Run `npm run vendor:prepare` to download new versions
3. Test locally with `python serve-pwa.py`
4. Commit the updated vendor files

## Updating Tailwind CSS

When you modify styles in `src/input.css` or add new Tailwind classes:

```bash
# Rebuild CSS
npm run build:css

# Or run full build
npm run build
```

## Testing Locally

```bash
# Start local server
python serve-pwa.py

# Or on Windows
serve-pwa.bat

# Open browser
http://localhost:8443/index.html
```

## Verifying GitHub Pages Deployment

After deploying, check your live site at:
```
https://aaronvstory.github.io/dash-bash-utility/
```

**In browser DevTools:**
1. Open Console - should see no CORS errors
2. Check `window.React` - should return an object
3. Check `window.ReactDOM` - should return an object
4. Check `window.lucide` - should return an object
5. Check `window.ReactWindow` - should return an object
6. Network tab - all resources should load from your domain (no unpkg/cdn.tailwindcss)

## Troubleshooting

### CORS Errors
If you see CORS errors after deployment:
- Verify all vendor files are committed and pushed
- Check that index.html uses relative paths (`./vendor/...`)
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### CSS Not Updating
```bash
# Rebuild CSS
npm run build:css

# Verify it generated
ls -lh tailwind.css

# Commit and deploy
git add tailwind.css
npm run deploy
```

### Vendor Files Missing
```bash
# Re-download all vendor files
npm run vendor:prepare

# Verify they exist
ls -lh vendor/

# Commit and deploy
git add vendor/
npm run deploy
```

## NPM Scripts Reference

```bash
npm run test:dom         # Run DOM smoke tests
npm run extract-jsx      # Extract JSX from index.html
npm run compile          # Compile JSX to JavaScript
npm run build:css        # Build Tailwind CSS
npm run build            # Full build (CSS + JSX)
npm run vendor:prepare   # Download all vendor files
npm run deploy           # Build and deploy to gh-pages
```

## Performance Benefits

With local vendor files:
- ✅ No CDN dependencies or CORS issues
- ✅ Reliable loading on GitHub Pages
- ✅ Works offline with service worker
- ✅ Faster load times (no external requests)
- ✅ Version locked (no surprise updates)
- ✅ Production-ready build (minified)

## Migration Checklist

- [x] Download React and ReactDOM to vendor/
- [x] Download Lucide icons to vendor/
- [x] Install and configure Tailwind CSS
- [x] Build Tailwind CSS locally
- [x] Update index.html to use local paths
- [x] Add vendor:prepare script
- [x] Update build script to include CSS
- [x] Update deploy script to commit CSS
- [x] Test locally
- [ ] Deploy to GitHub Pages
- [ ] Verify live deployment

## Next Steps

1. Test the app locally at http://localhost:8443/
2. Verify all features work correctly
3. Run `npm run deploy` to deploy to GitHub Pages
4. Check live site for any issues
5. Celebrate 🎉 - Your app is now GitHub Pages-safe!
