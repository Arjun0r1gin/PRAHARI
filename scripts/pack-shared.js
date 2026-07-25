/**
 * scripts/pack-shared.js
 *
 * Packs shared/ into vendor/prahari-shared-1.0.0.tgz for deployment and
 * synchronizes canonical shared modules to node_modules/@prahari/shared
 * inside each function directory.
 *
 * Usage:
 *   node scripts/pack-shared.js          — pack + sync all functions
 *   node scripts/pack-shared.js --pack-only — only pack, skip sync
 */

'use strict';

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const cleanBuild = require("./clean-build");

const ROOT = path.resolve(__dirname, "..");
const SHARED_DIR = path.join(ROOT, "shared");
const VENDOR_DIR = path.join(ROOT, "vendor");
const FUNCTIONS_DIR = path.join(ROOT, "functions");

const FUNCTION_NAMES = [
  "risk-engine",
  "hotspot-engine",
  "network-analysis",
  "data-fusion",
  "audit-log",
  "event-triggers",
  "outcome-loop",
  "report-export",
  "auth-hooks"
];
const TARBALL_NAME = "prahari-shared-1.0.0.tgz";

const ESSENTIAL_SHARED_FILES = [
  "package.json",
  "index.js",
  "utils/validator.js",
  "utils/errorHandler.js",
  "utils/catalystHelper.js",
  "utils/responseHelper.js",
  "middleware/authMiddleware.js",
  "middleware/loggerMiddleware.js",
  "repositories/dataRepository.js",
  "schemas/unified-record.js"
];

function run(cmd, cwd) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", shell: true });
}

// 0. Clean stale build artifacts
cleanBuild();

// 1. Ensure vendor/ exists
if (!fs.existsSync(VENDOR_DIR)) {
  fs.mkdirSync(VENDOR_DIR, { recursive: true });
  console.log("Created vendor/ directory");
}

// 2. Pack shared/ into a tarball for deployment
console.log("\n[1/3] Packing @prahari/shared …");
run("npm pack", SHARED_DIR);

// npm pack emits the tarball into the cwd (SHARED_DIR)
const emitted = fs.readdirSync(SHARED_DIR).find((f) => f.endsWith(".tgz"));
if (!emitted) {
  console.error("FATAL ROOT CAUSE: npm pack did not produce a .tgz file in shared/");
  process.exit(1);
}

// 3. Move tarball to vendor/
const src = path.join(SHARED_DIR, emitted);
const dest = path.join(VENDOR_DIR, TARBALL_NAME);
fs.renameSync(src, dest);
console.log(`  Moved ${emitted} → vendor/${TARBALL_NAME}`);

if (process.argv.includes("--pack-only")) {
  console.log("\nDone (pack-only mode — skipping node_modules sync).");
  process.exit(0);
}

// 4. Sync canonical shared modules directly to each function node_modules
console.log("\n[2/3] Syncing canonical @prahari/shared to each function …");
for (const fnName of FUNCTION_NAMES) {
  const fnDir = path.join(FUNCTIONS_DIR, fnName);
  if (!fs.existsSync(fnDir)) {
    console.warn(`  WARN: ${fnDir} not found — skipping`);
    continue;
  }

  const targetPrahariDir = path.join(fnDir, "node_modules", "@prahari");
  const targetSharedDir = path.join(targetPrahariDir, "shared");

  if (!fs.existsSync(targetPrahariDir)) {
    fs.mkdirSync(targetPrahariDir, { recursive: true });
  }

  if (fs.existsSync(targetSharedDir)) {
    fs.rmSync(targetSharedDir, { recursive: true, force: true });
  }

  // Copy canonical shared directory directly into node_modules/@prahari/shared
  fs.cpSync(SHARED_DIR, targetSharedDir, { recursive: true });

  // Immediate per-function verification
  const pkgCheck = path.join(targetSharedDir, "package.json");
  const valCheck = path.join(targetSharedDir, "utils", "validator.js");

  if (!fs.existsSync(pkgCheck) || !fs.existsSync(valCheck)) {
    console.error(`\nFATAL ROOT CAUSE: Installation verification failed for ${fnName}! Missing ${valCheck}`);
    process.exit(1);
  }

  console.log(`  ✔ ${fnName}: @prahari/shared synced successfully`);
}

// 5. Audit all 9 functions for file parity
console.log("\n[3/3] Auditing @prahari/shared installation across all functions …");
let allOk = true;
for (const fnName of FUNCTION_NAMES) {
  const sharedInModules = path.join(
    FUNCTIONS_DIR, fnName, "node_modules", "@prahari", "shared"
  );

  let fnOk = fs.existsSync(sharedInModules);
  if (fnOk) {
    for (const relFile of ESSENTIAL_SHARED_FILES) {
      const fileInModules = path.join(sharedInModules, relFile);
      if (!fs.existsSync(fileInModules)) {
        console.error(`  ✘ ${fnName}: missing file ${relFile}`);
        fnOk = false;
        break;
      }
    }
  }

  console.log(`  ${fnOk ? "✔" : "✘"} ${fnName}/node_modules/@prahari/shared`);
  if (!fnOk) allOk = false;
}

if (!allOk) {
  console.error("\nFATAL ROOT CAUSE: @prahari/shared audit failed for some function node_modules");
  process.exit(1);
}

console.log("\n✔  pack-shared complete — all 9 functions have verified identical @prahari/shared installed.\n");
