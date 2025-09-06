# Version Update Guide for Dash Bash Utility

## Quick Update Checklist

When releasing a new version, update the version number in these 3 places:

### 1. **service-worker.js** (Line 3)
```javascript
const VERSION = '1.2.0'; // Update this version number
```

### 2. **index.html** - Two locations:

#### Meta tag (Line 9)
```html
<meta name="app-version" content="1.2.0">
```

#### JavaScript constant (Line 72)
```javascript
const APP_VERSION = '1.2.0'; // Update this with each release
```

#### App title display (Line 1744)
```html
<span className="text-lg text-gray-400">v1.2.0</span>
```

## Cache Busting Implementation

The application now implements several cache-busting strategies:

1. **Version-based cache names** - Service worker uses versioned cache names
2. **Query parameters** - All resources loaded with `?v=1.2.0` parameter
3. **Network-first for HTML** - Always fetches fresh HTML when online
4. **Auto-update notifications** - Users see a banner when new version available
5. **Cache control meta tags** - Prevents aggressive browser caching

## How It Works

1. When you update the version numbers and deploy:
   - Service worker cache name changes
   - Old caches are automatically deleted
   - Resources are fetched with new version parameters
   
2. Users will:
   - Get fresh content on next visit (network-first for HTML)
   - See an update notification if app is already open
   - Can click "Update Now" to reload with new version
   - Or wait for auto-reload on next visit

## Testing Version Updates

1. Change version numbers in all 4 locations
2. Deploy to GitHub Pages or test server
3. Visit site - should load new version immediately
4. Check DevTools > Application > Service Workers to verify new version
5. Check Network tab to see resources loaded with new version parameters

## Troubleshooting

If users still see old version:
- They may need to close all tabs and reopen
- Clear browser cache manually (last resort)
- Check if service worker is properly registered in DevTools

## Notes

- Version numbers should follow semantic versioning (MAJOR.MINOR.PATCH)
- Always test locally before deploying
- Consider adding release notes for users