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

console.log(
  `Updated version ${oldVersion} -> ${newVersion} across ${updatedCount} file(s) plus package.json`,
);
