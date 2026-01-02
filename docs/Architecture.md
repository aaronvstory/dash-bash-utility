# Technical Architecture

Dash Bash is built as a single-page React application with a focus on extreme performance and reliability in mobile environments.

## Core Stack
- **Framework**: React 18 (Functional Components, Hooks).
- **Styling**: Tailwind CSS 4 (Post-CSS based).
- **Icons**: Lucide (bundled locally).
- **Build Tools**: Babel CLI, Tailwind CLI.
- **Runtime**: Service Worker (PWA capabilities).

## Performance Optimization: The JSX Pipeline
One of the most significant architectural decisions in Dash Bash was moving away from browser-side compilation.
1. **The Problem**: Inline JSX in a large (700KB+) script tag caused massive "Time to Interactive" delays on mobile devices.
2. **The Solution**: A custom build pipeline:
   - `extract-jsx.js`: Pulls the React component out of the HTML file.
   - `Babel CLI`: Compiles JSX to pure JavaScript.
   - `dash-bash-compiled.js`: The final optimized output loaded by the browser.
3. **The Result**: 
   - **LCP**: Reduced from ~10 seconds to under 200ms.
   - **React Handlers**: Execution time reduced from 300ms to <1ms.

## Component Structure
The application is primarily contained within `dash-bash-component.jsx`, which manages several major state sub-trees:
- `appState`: The global configuration and user data.
- `collapseStates`: Persistence for UI visibility (which categories are open/closed).
- `earningsHistory`: Immutable log of financial transactions.

## Vendor Management
To ensure reliability and prevent "white-screen" errors due to CDN outages, all dependencies are bundled locally in the `vendor/` directory:
- `react.production.min.js`
- `react-dom.production.min.js`
- `lucide.min.js`

## CSS Strategy
Styles are managed via `src/input.css` and compiled into `tailwind.css`. This allows for:
- Full Tailwind 4 utility class support.
- Custom CSS variables for theme consistency.
- Minified output for production.
