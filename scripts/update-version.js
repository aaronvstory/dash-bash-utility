#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const newVersion = process.argv[2];
if (!newVersion) {
  console.error("Usage: node scripts/update-version.js X.Y.Z");
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error("Version must be in X.Y.Z format");
  process.exit(1);
}

const root = path.resolve(__dirname, "..");
const pkgPath = path.join(root, "package.json");
const pkgRaw = fs.readFileSync(pkgPath, "utf8");
const pkg = JSON.parse(pkgRaw);
const oldVersion = pkg.version;

if (!oldVersion || typeof oldVersion !== "string") {
  console.error("package.json version is missing or invalid");
  process.exit(1);
}

if (oldVersion === newVersion) {
  console.log(`Version already set to ${newVersion}`);
  process.exit(0);
}

const filesToUpdate = [
  "service-worker.js",
  "index.html",
  "manifest.json",
  "README.md",
  "CLAUDE.md",
  "dash-bash-component.jsx", // State Management section version
];

let updatedCount = 0;
for (const relativePath of filesToUpdate) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`[warn] ${relativePath}: file not found, skipping`);
    continue;
  }
  const content = fs.readFileSync(filePath, "utf8");
  if (!content.includes(oldVersion)) {
    console.warn(`[warn] ${relativePath}: ${oldVersion} not found`);
    continue;
  }
  const updated = content.split(oldVersion).join(newVersion);
  fs.writeFileSync(filePath, updated, "utf8");
  updatedCount += 1;
}

pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");

// Special handling: JSX fallback pattern (safety net if fallback version drifts)
// Matches: || "X.Y.Z"} used in State Management section
const jsxPath = path.join(root, "dash-bash-component.jsx");
if (fs.existsSync(jsxPath)) {
  let jsxContent = fs.readFileSync(jsxPath, "utf8");
  const fallbackPattern = /\|\| "(\d+\.\d+\.\d+)"\}/g;
  const matches = jsxContent.match(fallbackPattern);
  if (matches && matches.length > 0) {
    const beforeContent = jsxContent;
    jsxContent = jsxContent.replace(fallbackPattern, `|| "${newVersion}"}`);
    if (jsxContent !== beforeContent) {
      fs.writeFileSync(jsxPath, jsxContent, "utf8");
      console.log(`[jsx] Updated ${matches.length} fallback version pattern(s) in dash-bash-component.jsx`);
    }
  }
}

console.log(
  `Updated version ${oldVersion} -> ${newVersion} across ${updatedCount} file(s) plus package.json`,
);
