/**
 * scripts/clean-build.js
 *
 * Safely stops stale background Node processes locking the .build directory
 * and cleans .build prior to catalyst serve or jest tests.
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT, '.build');

function cleanBuild() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.log('[clean-build] .build directory clean.');
    return true;
  }

  try {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
    console.log('[clean-build] Successfully cleaned .build directory.');
    return true;
  } catch (err) {
    console.warn('[clean-build] .build directory is locked. Stopping background handles...');
    try {
      if (process.platform === 'win32') {
        try {
          execSync(
            'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name = \'node.exe\'\\" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like \'*\\\\.build\\\\*\' -or $_.CommandLine -like \'*auth-hooks*\' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"',
            { stdio: 'ignore' }
          );
        } catch (e) {}
      } else {
        try {
          execSync('pkill -f "\\.build|auth-hooks"', { stdio: 'ignore' });
        } catch (e) {}
      }
    } catch (e) {}

    const start = Date.now();
    while (Date.now() - start < 500) {}

    try {
      if (fs.existsSync(BUILD_DIR)) {
        fs.rmSync(BUILD_DIR, { recursive: true, force: true });
      }
      console.log('[clean-build] Successfully cleaned .build directory.');
      return true;
    } catch (finalErr) {
      console.warn('[clean-build] Note: .build directory will be refreshed by Catalyst CLI.');
      return false;
    }
  }
}

if (require.main === module) {
  cleanBuild();
}

module.exports = cleanBuild;
