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

test('compose dialog has a programmatic accessible name and description for reply', () => {
  const html = read('index.html');
  const js = read('src/main.js');
  assert.match(html, /id="composer-dialog"[^>]*aria-labelledby="compose-title"/);
  assert.match(html, /id="compose-eyebrow">NEW MESSAGE/);
  assert.match(html, /id="compose-reply-context"[^>]*hidden/);
  assert.match(js, /setAttribute\('aria-describedby', 'compose-reply-context'\)/);
  assert.match(js, /removeAttribute\('aria-describedby'\)/);
});

test('mobile dock exposes four labeled and accessible mailbox actions', () => {
  const html = read('index.html');
  const nav = html.match(/<nav class="nav"[^>]*>[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav, 'mailbox navigation must exist');
  for (const [view, label] of [
    ['INBOX', 'Inbox'], ['STARRED', 'Starred'],
    ['SENT', 'Sent'], ['ALL', 'All mail']
  ]) {
    const found = nav.match(new RegExp('<button[^>]*data-view="' + view + '"[^>]*>[\\s\\S]*?<\\/button>'))?.[0];
    assert.ok(found, 'missing mailbox control ' + view);
    assert.match(found, new RegExp('<span class="nav-label">' + label + '<\\/span>'));
  }
  assert.match(nav, /data-view="INBOX" aria-current="page"/);
});

test('mobile primary navigation floats clear of screen edges and scrollable content', () => {
  const css = read('styles/app.css');
  assert.match(css, /\.sidebar\{position:fixed;bottom:calc\(12px \+ env\(safe-area-inset-bottom, 0px\)\)/);
  assert.match(css, /left:calc\(12px \+ env\(safe-area-inset-left, 0px\)\)/);
  assert.match(css, /right:calc\(12px \+ env\(safe-area-inset-right, 0px\)\)/);
  assert.match(css, /border-radius:var\(--gc-radius-lg\)/);
  assert.match(css, /\.workspace\{height:calc\(100dvh - 108px - env\(safe-area-inset-bottom, 0px\)\)/);
  assert.match(css, /\.nav button\{flex:1;min-width:0;max-width:120px;min-height:62px/);
  assert.match(css, /@media\(max-width:300px\)/);
  assert.match(css, /@media\(forced-colors:active\)/);
});

test('the mobile settings dialog provides an accessible theme switch', () => {
  const html = read('index.html');
  const js = read('src/main.js');
  assert.match(html, /id="theme-settings" type="button"/);
  assert.match(html, /Switch appearance \(light \/ dark\)/);
  assert.match(js, /'theme-settings'\)\.addEventListener\('click', toggleAppearance\)/);
  assert.match(html, /id="compose"[^>]*aria-label="Compose a new email"/);
});


test('account settings provide browser-local draft deletion without account OAuth', () => {
  const html = read('index.html');
  const js = read('src/main.js');
  assert.match(html, /id="delete-local-draft-settings" type="button"/);
  assert.match(js, /'delete-local-draft-settings'\)\.addEventListener\('click', removeLocalDraft\)/);
  assert.match(html, /No Gmail account or passphrase is needed/);
});
