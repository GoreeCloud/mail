import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

test('every JavaScript-bound control has a unique element ID', () => {
  const html = read('index.html');
  const code = read('src/main.js');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate HTML IDs');
  for (const match of code.matchAll(/\$\('([^']+)'\)/g)) {
    assert.ok(ids.includes(match[1]), 'missing DOM element #' + match[1]);
  }
});

test('web client forbids inline scripts and sets restrictive origins', () => {
  const html = read('index.html');
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /object-src 'none'/);
  assert.match(html, /script-src 'self' https:\/\/accounts\.google\.com/);
  assert.doesNotMatch(html, /<script(?![^>]*src=)[^>]*>/i);
  assert.doesNotMatch(html, /on(?:click|load|error)\s*=/i);
});

test('GC UI semantic tokens and mobile navigation are represented', () => {
  const css = read('styles/app.css');
  for (const token of ['--gc-canvas', '--gc-surface', '--gc-brand', '--gc-on-brand', '--gc-outline']) {
    assert.ok(css.includes(token), 'missing ' + token);
  }
  assert.match(css, /max-width:680px/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(read('index.html'), /id="back"/);
});

test('mobile configuration remains reachable with a labeled toolbar control', () => {
  const html = read('index.html');
  const css = read('styles/app.css');
  const js = read('src/main.js');
  assert.match(html, /id="settings-mobile"[^>]+aria-label="Configure connection"/);
  assert.match(css, /\.mobile-settings\{display:none\}/);
  assert.match(css, /@media\(max-width:680px\)\{\.mobile-settings\{display:inline-flex/);
  assert.match(js, /'settings-mobile'\)\.addEventListener\('click', openSettings\)/);
});
