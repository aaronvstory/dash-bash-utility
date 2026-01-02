#!/usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");

const versionArg = process.argv[2];
if (!versionArg) {
  console.error("Usage: node scripts/release.js X.Y.Z");
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(versionArg)) {
  console.error(`Invalid version format: ${versionArg}. Expected X.Y.Z (e.g., 1.10.0)`);
  process.exit(1);
}

const update = spawnSync(
  "node",
  ["scripts/update-version.js", versionArg],
  { stdio: "inherit" },
);
if (update.status !== 0) {
  process.exit(update.status ?? 1);
}

const npmExec = process.env.npm_execpath;
if (!npmExec) {
  console.error("npm_execpath is not set; cannot run build.");
  process.exit(1);
}

const build = spawnSync(process.execPath, [npmExec, "run", "build"], {
  stdio: "inherit",
});
if (build.error) {
  console.error("Build failed:", build.error.message);
}
process.exit(build.status ?? 1);
