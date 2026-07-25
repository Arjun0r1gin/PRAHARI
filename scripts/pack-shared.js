/**
 * scripts/pack-shared.js
 *
 * Packs shared/ into a tarball, moves it to vendor/, and
 * runs npm install inside each function directory so that
 * node_modules/@prahari/shared is always up-to-date.
 *
 * Usage:
 *   node scripts/pack-shared.js          — pack + install all functions
 *   node scripts/pack-shared.js --pack-only — only pack, skip npm install
 *
 * Run this script whenever you change any file under shared/.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

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
  "report-export"
];
const TARBALL_NAME = "prahari-shared-1.0.0.tgz";

function run(cmd, cwd) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", shell: true });
}

// 1. Ensure vendor/ exists
if (!fs.existsSync(VENDOR_DIR)) {
  fs.mkdirSync(VENDOR_DIR, { recursive: true });
  console.log("Created vendor/ directory");
}

// 2. Pack shared/ into a tarball
console.log("\n[1/3] Packing @prahari/shared …");
run("npm pack", SHARED_DIR);

// npm pack emits the tarball into the cwd (SHARED_DIR)
const emitted = fs.readdirSync(SHARED_DIR).find((f) => f.endsWith(".tgz"));
if (!emitted) {
  console.error("ERROR: npm pack did not produce a .tgz file in shared/");
  process.exit(1);
}

// 3. Move tarball to vendor/
const src = path.join(SHARED_DIR, emitted);
const dest = path.join(VENDOR_DIR, TARBALL_NAME);
fs.renameSync(src, dest);
console.log(`  Moved ${emitted} → vendor/${TARBALL_NAME}`);

if (process.argv.includes("--pack-only")) {
  console.log("\nDone (pack-only mode — skipping npm install).");
  process.exit(0);
}

// 4. npm install inside each function to sync node_modules
console.log("\n[2/3] Installing @prahari/shared in each function …");
for (const fnName of FUNCTION_NAMES) {
  const fnDir = path.join(FUNCTIONS_DIR, fnName);
  if (!fs.existsSync(fnDir)) {
    console.warn(`  WARN: ${fnDir} not found — skipping`);
    continue;
  }
  console.log(`\n  → ${fnName}`);
  run("npm install --prefer-offline", fnDir);
}

console.log("\n[3/3] Verifying @prahari/shared is present …");
let allOk = true;
for (const fnName of FUNCTION_NAMES) {
  const sharedInModules = path.join(
    FUNCTIONS_DIR, fnName, "node_modules", "@prahari", "shared"
  );
  const ok = fs.existsSync(sharedInModules);
  console.log(`  ${ok ? "✔" : "✘"} ${fnName}/node_modules/@prahari/shared`);
  if (!ok) allOk = false;
}

if (!allOk) {
  console.error("\nERROR: @prahari/shared missing from some node_modules");
  process.exit(1);
}

console.log("\n✔  pack-shared complete — all functions have @prahari/shared installed.\n");
