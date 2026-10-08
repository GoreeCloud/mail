#!/usr/bin/env node
const { spawn } = require('child_process');
const electron = require('electron');

// Pinned so the suite doesn't run in whatever zone the machine happens to be in. CI has no TZ
// of its own, i.e. UTC, where a local date component read is indistinguishable from a UTC one —
// so the calendar's zone handling would go unverified there. Set as a default rather than an
// override, so `TZ=America/Santiago npm test` still works for chasing a zone-specific bug.
const DEFAULT_TZ = 'America/Chicago';

if (process.env.CI === 'true' && process.platform === 'linux') {
  const path = require('path');
  const { spawnSync } = require('child_process');
  const engine = path.resolve(__dirname, '..', 'app', 'mailsync.bin');
  const check = spawnSync('ldd', [engine], { encoding: 'utf8', timeout: 5000 });
  const output = String(check.stdout || '') + String(check.stderr || '');
  const missing = output.split('\n').filter(line => line.includes('not found'));
  if (check.error || check.status !== 0 || missing.length > 0) {
    console.error('Mailsync runtime dependency preflight failed:', missing.join('; ') || 'ldd error');
    process.exit(1);
  }
  console.error('Mailsync runtime dependency preflight passed.');
}

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
