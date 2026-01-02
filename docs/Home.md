# Dash Bash Wiki

Welcome to the official documentation for **Dash Bash Utility**, a high-performance Progressive Web App (PWA) designed specifically for delivery service drivers (primarily DoorDash) to optimize their workflow, track earnings, and manage delivery logistics.

## Project Overview

Dash Bash provides a unified interface for several critical driver tasks:
- **Financial Planning**: Real-time target calculators for daily goals.
- **Logistics**: An intelligent address book with operating hours tracking.
- **Communication**: Template-based quick messaging for customers.
- **Asset Management**: Tracking "Dashers" (accounts), balances, and timers.
- **Organization**: Categorized notes and data persistence.

## Key Documentation

### [Features](./Features.md)
Explore the core functionality of the application, including the Target Calculator, Address Book, and Dasher Management system.

### [Architecture](./Architecture.md)
Understand how the app is built using React 18, Tailwind CSS 4, and a precompiled JSX workflow for maximum performance.

### [Data & Persistence](./Persistence.md)
Learn about the dual-write persistence strategy using `localStorage` and `IndexedDB` to ensure driver data is never lost.

### [Development & Build](./Development.md)
Instructions for setting up the local environment, building the CSS, and deploying to GitHub Pages.

### [Changelog](./Changelog.md)
A detailed history of versions and improvements.

---

## Technical Highlights
- **9.8s → 100ms LCP**: Dramatic performance improvement via JSX precompilation.
- **Offline First**: Fully functional without an internet connection once installed.
- **Privacy Focused**: 100% local storage; no data ever leaves the device.
- **Accessible**: WCAG AA compliant UI.
