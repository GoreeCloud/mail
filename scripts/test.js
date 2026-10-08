#!/usr/bin/env node
const { spawn } = require('child_process');
const electron = require('electron');

// Pinned so the suite doesn't run in whatever zone the machine happens to be in. CI has no TZ
// of its own, i.e. UTC, where a local date component read is indistinguishable from a UTC one —
// so the calendar's zone handling would go unverified there. Set as a default rather than an
// override, so `TZ=America/Santiago npm test` still works for chasing a zone-specific bug.
const DEFAULT_TZ = 'America/Chicago';

const child = spawn(electron, ['./app', '--enable-logging', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: Object.assign({ TZ: DEFAULT_TZ }, process.env),
});

if (process.env.CI === 'true') {
  const startedAt = Date.now();
  const heartbeat = setInterval(() => {
    console.error('Electron spec runner still active after ' + Math.round((Date.now() - startedAt) / 1000) + ' seconds');
  }, 60000);
  const deadline = setTimeout(() => {
    console.error('Electron spec runner exceeded 12-minute CI deadline; terminating as a test failure.');
    child.kill('SIGKILL');
  }, 720000);
  child.once('exit', () => {
    clearInterval(heartbeat);
    clearTimeout(deadline);
  });
}

child.on('exit', (code, signal) => {
  if (signal) {
    process.exit(signal === 'SIGKILL' ? 124 : 1);
  } else {
    process.exit(code);
  }
});
