# Version Update Guide for Dash Bash Utility

## Quick Update Checklist

Preferred: run `npm run version:update -- X.Y.Z` to sync mechanical version fields.
Optional: `npm run release -- X.Y.Z` to sync + build in one step.
Then update release notes manually (see below).

When releasing a new version, update the version string in these files:

### 1. `service-worker.js`
```javascript
const APP_VERSION = "X.Y.Z";
```

### 2. `index.html` (multiple spots)
- `<meta name="app-version" content="X.Y.Z" />`
- `<body ... data-style-version="X.Y.Z">`
- `const APP_VERSION = "X.Y.Z";`
- Console log string that prints the version
- All cache-busting query params `?v=X.Y.Z` (favicon, manifest, CSS, compiled JS)

Example snippets:
```html
<meta name="app-version" content="X.Y.Z" />
<link rel="icon" href="favicon.svg?v=X.Y.Z" />
<link rel="manifest" href="manifest.json?v=X.Y.Z" />
<link rel="stylesheet" href="tailwind.css?v=X.Y.Z" />
<link rel="stylesheet" href="styles.css?v=X.Y.Z" />
<script src="dash-bash-compiled.js?v=X.Y.Z"></script>
```

### 3. `manifest.json`
```json
"app_version": "X.Y.Z",
"src": "favicon.svg?v=X.Y.Z"
```

### 4. `package.json`
```json
"version": "X.Y.Z"
```

## Release Notes (recommended)
- `README.md`: update the Current Version line
- `CHANGELOG.md` and `docs/Changelog.md`: add the new release entry

## Cache Busting Implementation
1. Version-based cache names (service worker uses versioned cache names)
2. Query parameters on static assets (`?v=X.Y.Z`)
3. Network-first for HTML
4. Auto-update notifications when a new version is available
5. Cache control meta tags in `index.html`

## Testing Version Updates
1. Update the version string in every location listed above
2. Run `npm run build`
3. Serve locally (`python serve-pwa.py`)
4. Load the app and confirm the console shows the new version
5. DevTools > Application > Service Workers shows the new version
6. Network tab shows assets loaded with the new `?v=X.Y.Z`

## Troubleshooting
If users still see the old version:
- Close all tabs and reopen
- Clear cache manually (last resort)
- Verify service worker registration in DevTools

## Notes
- Version numbers should follow semantic versioning (MAJOR.MINOR.PATCH)
- Always test locally before deploying
