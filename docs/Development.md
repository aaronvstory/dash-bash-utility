# Development & Operations

This guide covers the local setup and deployment workflow for Dash Bash.

## Local Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/aaronvstory/dash-bash-utility.git
   cd dash-bash-utility
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Prepare vendor files**:
   ```bash
   npm run vendor:prepare
   ```

## Running Locally
To test PWA features and local storage correctly, use the provided server scripts:
- **Windows**: Run `serve-pwa.bat`
- **Any Platform (Python)**: `python serve-pwa.py`
- Access the app at `http://localhost:8443`

## Build Pipeline
The build process consists of three main steps:
1. **CSS Build**: Compiles Tailwind CSS.
2. **JSX Extraction**: Extracts the React code from the main file.
3. **Compilation**: Compiles JSX to optimized JS using Babel.

Run the full build with:
```bash
npm run build
```

## Deployment
Dash Bash is hosted on GitHub Pages. The `npm run deploy` command automates the entire process:
1. Runs the full build.
2. Commits the compiled artifacts.
3. Pushes to `main`.
4. Merges `main` into `gh-pages`.
5. Pushes `gh-pages` to trigger the GitHub Action.

```bash
npm run deploy
```

## Contribution Guidelines
- **Always build before committing**: Ensure `dash-bash-compiled.js` and `tailwind.css` are up to date.
- **Test Persistence**: Make a change, close the tab, and reopen it to ensure the data persists.
- **Check Service Worker**: If you change the version number, ensure the service worker cache is updated.
