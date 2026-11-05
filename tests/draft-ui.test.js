import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { disconnect } from '../src/auth.js';

const ids = [...readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  .matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

class Element {
  constructor() {
    this.textContent = '';
    this.value = '';
    this.hidden = false;
    this.disabled = false;
    this.open = false;
    this.dataset = {};
    this.children = [];
    this.listeners = new Map();
    this.selectors = new Map();
    this.classList = { add() {}, remove() {} };
  }
  addEventListener(name, fn) { this.listeners.set(name, fn); }
  async emit(name) { return this.listeners.get(name)?.({ preventDefault() {}, target: this }); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = [...children]; }
  setAttribute(key, value) { this[key] = value; }
  removeAttribute(key) { delete this[key]; }
  querySelector(key) {
    if (!this.selectors.has(key)) this.selectors.set(key, new Element());
    return this.selectors.get(key);
  }
  showModal() { this.open = true; }
  close() { this.open = false; }
  focus() {}
  reset() {}
}

test('manual draft save/restore uses ciphertext and rejects a changed account', async () => {
  const elements = new Map(ids.map((id) => [id, new Element()]));
  const nav = ['INBOX', 'STARRED', 'SENT', 'ALL'].map((view) => {
    const element = new Element(); element.dataset.view = view; return element;
  });
  const store = new Map([['goreecloud-mail-public-oauth-client-id', '1234.apps.googleusercontent.com']]);
  globalThis.localStorage = {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key)
  };
  globalThis.document = {
    body: new Element(), documentElement: new Element(), head: new Element(),
    getElementById: (id) => elements.get(id),
    querySelectorAll: (selector) => selector === '[data-view]' ? nav : [],
    querySelector: () => null,
    createElement: () => new Element(), addEventListener() {}
  };
  let currentEmail = 'first@example.com';
  globalThis.window = {
    google: { accounts: { oauth2: { initTokenClient(config) {
      return { requestAccessToken() {
        config.callback({ access_token: 'TEST-NOT-A-REAL-TOKEN', expires_in: 3600, scope: config.scope });
      } };
    } } } },
    confirm: () => true
  };
  globalThis.fetch = async (url) => {
    if (String(url).endsWith('/profile')) return {
      ok: true, status: 200, json: async () => ({ emailAddress: currentEmail })
    };
    if (String(url).includes('/messages?')) return {
      ok: true, status: 200, json: async () => ({ messages: [] })
    };
    throw new Error('Unexpected provider request.');
  };

  try {
    await import('../src/main.js');
    await elements.get('connect').emit('click');
    await elements.get('compose').emit('click');
    assert.equal(elements.get('composer-dialog').open, true);
    elements.get('to').value = 'someone@example.com';
    elements.get('subject').value = 'Private memo';
    elements.get('body').value = 'Do not persist this as plain text.';
    await elements.get('save-draft').emit('click');
    elements.get('draft-passphrase').value = 'never retain this typed password';
    await elements.get('draft-dialog').emit('cancel');
    assert.equal(elements.get('draft-passphrase').value, '', 'Escape clears password');
    assert.equal(elements.get('draft-dialog').open, false);
    await elements.get('save-draft').emit('click');
    assert.equal(elements.get('draft-dialog').open, true);
    elements.get('draft-passphrase').value = 'a long secret passphrase';
    await elements.get('draft-form').emit('submit');
    assert.equal(elements.get('draft-dialog').open, false);
    assert.equal(elements.get('draft-passphrase').value, '');
    const ciphertext = store.get('goreecloud-mail:encrypted-draft:v1');
    assert.ok(ciphertext);
    assert.doesNotMatch(ciphertext, /Private memo|Do not persist|first@example.com/);

    elements.get('to').value = '';
    elements.get('subject').value = '';
    elements.get('body').value = '';
    await elements.get('restore-draft').emit('click');
    elements.get('draft-passphrase').value = 'wrong passphrase here';
    await elements.get('draft-form').emit('submit');
    assert.match(elements.get('notice').textContent, /Unable to unlock draft/);
    assert.equal(elements.get('body').value, '');
    assert.equal(elements.get('draft-passphrase').value, '');
    elements.get('draft-passphrase').value = 'a long secret passphrase';
    await elements.get('draft-form').emit('submit');
    assert.equal(elements.get('body').value, 'Do not persist this as plain text.');
    assert.equal(elements.get('subject').value, 'Private memo');
    assert.equal(elements.get('draft-dialog').open, false);

    await elements.get('disconnect').emit('click');
    currentEmail = 'other@example.com';
    await elements.get('connect').emit('click');
    await elements.get('compose').emit('click');
    elements.get('body').value = '';
    await elements.get('restore-draft').emit('click');
    elements.get('draft-passphrase').value = 'a long secret passphrase';
    await elements.get('draft-form').emit('submit');
    assert.match(elements.get('notice').textContent, /another account/);
    assert.equal(elements.get('body').value, '');
    await elements.get('delete-draft').emit('click');
    assert.equal(store.has('goreecloud-mail:encrypted-draft:v1'), false);
  } finally {
    disconnect();
  }
});
