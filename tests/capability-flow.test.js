import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCOPES, disconnect } from '../src/auth.js';

const ids = [...readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  .matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

class Element {
  constructor() {
    this.textContent = '';
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.open = false;
    this.dataset = {};
    this.children = [];
    this.listeners = new Map();
    this.subElements = new Map();
    this.classList = { add() {}, remove() {} };
  }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  async emit(name) { return this.listeners.get(name)?.({ preventDefault() {}, target: this }); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = [...children]; }
  querySelector(name) {
    if (!this.subElements.has(name)) this.subElements.set(name, new Element());
    return this.subElements.get(name);
  }
  setAttribute(name, value) { this[name] = value; }
  removeAttribute(name) { delete this[name]; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  focus() {}
  reset() {}
}

function json(data) { return { status: 200, ok: true, json: async () => data }; }
function message(id, full = false) {
  return {
    id, threadId: 'threadSyn001', labelIds: ['INBOX', 'UNREAD'], snippet: 'message',
    payload: {
      mimeType: full ? 'text/plain' : undefined,
      body: full ? { data: 'SGVsbG8=' } : undefined,
      parts: full ? [{ mimeType: 'application/pdf', filename: 'unsafe\u202E.pdf', body: { attachmentId: 'not-downloaded', size: 250 } }] : undefined,
      headers: [
        { name: 'From', value: 'sender@example.com' },
        { name: 'Subject', value: 'Test message' },
        { name: 'Reply-To', value: 'reply@example.com' },
        { name: 'Message-ID', value: '<parent@example.test>' },
        { name: 'Authentication-Results', value: 'mx.example; spf=pass' },
        { name: 'Date', value: 'Thu, 05 Nov 2026 12:00:00 GMT' }
      ]
    }
  };
}

test('read-only viewing stays non-mutating; explicit modify prompts; account mismatch blocks send', async () => {
  const elements = new Map(ids.map((id) => [id, new Element()]));
  const nav = ['INBOX', 'STARRED', 'SENT', 'ALL'].map((view) => {
    const element = new Element();
    element.dataset.view = view;
    return element;
  });
  const scopes = [];
  const calls = [];
  let account = 'primary@example.com';

  globalThis.document = {
    body: new Element(), documentElement: new Element(), head: new Element(),
    getElementById: (id) => elements.get(id),
    querySelectorAll: (selector) => selector === '[data-view]' ? nav : [],
    querySelector: () => null,
    createElement: () => new Element(),
    addEventListener() {}
  };
  globalThis.window = {
    google: { accounts: { oauth2: { initTokenClient(config) {
      return { requestAccessToken() {
        scopes.push(config.scope);
        if (config.scope.includes(SCOPES.send)) account = 'alternate@example.com';
        config.callback({ access_token: 'FAKE-TOKEN', expires_in: 3600, scope: config.scope });
      } };
    } } } },
    confirm: () => true
  };
  globalThis.localStorage = {
    getItem: () => '1234.apps.googleusercontent.com',
    setItem() {}, removeItem() {}
  };
  globalThis.fetch = async (url) => {
    const path = String(url);
    calls.push(path);
    if (path.endsWith('/profile')) return json({ emailAddress: account });
    if (path.includes('/messages?')) return json({ messages: [{ id: 'one' }] });
    if (path.includes('/messages/one?format=full')) return json(message('one', true));
    if (path.includes('format=metadata')) return json(message('one'));
    if (path.includes('/modify')) return json({});
    if (path.includes('/send')) return json({});
    throw new Error('Unexpected mocked route ' + path);
  };

  try {
    await import('../src/main.js');
    await elements.get('connect').emit('click');
    assert.deepEqual(scopes, [SCOPES.read], 'read is the only initial scope');
    assert.equal(elements.get('message-list').children.length, 1);

    await elements.get('message-list').children[0].children[0].emit('click');
    assert.equal(elements.get('reader-body').textContent, 'Hello');
    assert.equal(elements.get('reader-header-details').hidden, false);
    assert.equal(elements.get('reader-header-details').open, false, 'details remains collapsed');
    const headerRows = elements.get('reader-header-list').children;
    assert.equal(headerRows.length, 6);
    assert.ok(headerRows.some((row) => row.children[0].textContent === 'Reply-To'
      && row.children[1].textContent === 'reply@example.com'));
    assert.equal(elements.get('reader-attachments').hidden, false);
    assert.equal(elements.get('reader-attachment-list').children.length, 1);
    assert.equal(elements.get('reader-attachment-list').children[0].children[0].textContent, 'unsafe�.pdf');
    assert.match(elements.get('reader-attachment-list').children[0].children[1].textContent, /250 bytes/);
    assert.equal(elements.get('unread').textContent, 'Mark read');
    assert.equal(calls.filter((path) => path.includes('/modify')).length, 0, 'opening must not write to Gmail');
    await elements.get('reply').emit('click');
    assert.equal(elements.get('composer-dialog').open, true, 'reply opens the composer');
    assert.equal(elements.get('to').value, 'reply@example.com');
    assert.equal(elements.get('subject').value, 'Re: Test message');
    assert.equal(elements.get('compose-reply-context').hidden, false);
    assert.deepEqual(scopes, [SCOPES.read], 'drafting a reply must not request send permission');
    await elements.get('close-compose').emit('click');
    assert.equal(elements.get('compose-reply-context').hidden, true);
    assert.equal(elements.get('composer-dialog').open, false);

    await elements.get('unread').emit('click');
    assert.equal(calls.filter((path) => path.includes('/modify')).length, 1);
    assert.ok(scopes[1].includes(SCOPES.modify));
    assert.ok(!scopes[1].includes(SCOPES.send));

    await elements.get('compose').emit('click');
    elements.get('to').value = 'recipient@example.com';
    elements.get('subject').value = 'Hello';
    elements.get('body').value = 'Hello from the test';
    await elements.get('compose-form').emit('submit');

    assert.ok(scopes[2].includes(SCOPES.send), 'send permission only requested at send time');
    assert.equal(calls.filter((path) => path.includes('/messages/send')).length, 0, 'different account must not receive mail');
    assert.equal(elements.get('reader-body').textContent, '');
    assert.equal(elements.get('reader-header-details').hidden, true);
    assert.equal(elements.get('reader-header-list').children.length, 0);
    assert.equal(elements.get('message-list').children.length, 0);
    assert.equal(elements.get('connect').hidden, false);

    // Delayed profile responses must not restore account details after disconnect.
    const previousFetch = globalThis.fetch;
    let holdNextProfile = true;
    let completeProfile = null;
    globalThis.fetch = async (url) => {
      if (String(url).endsWith('/profile') && holdNextProfile) {
        holdNextProfile = false;
        return new Promise((resolve) => { completeProfile = resolve; });
      }
      return previousFetch(url);
    };
    const firstConnection = elements.get('connect').emit('click');
    for (let i = 0; i < 30 && !completeProfile; i++) await new Promise((resolve) => setImmediate(resolve));
    assert.ok(completeProfile);
    await elements.get('disconnect').emit('click');
    completeProfile(json({ emailAddress: 'old@example.com' }));
    await firstConnection;
    assert.equal(elements.get('connect').hidden, false);
    assert.doesNotMatch(elements.get('compose-account').textContent, /old@example.com/);

    // A delayed mutation profile check must never disconnect a newly authorized account.
    account = 'second@example.com';
    await elements.get('connect').emit('click');
    await elements.get('message-list').children[0].children[0].emit('click');
    holdNextProfile = true;
    completeProfile = null;
    const oldModificationCount = calls.filter((path) => path.includes('/modify')).length;
    const pendingModification = elements.get('unread').emit('click');
    for (let i = 0; i < 30 && !completeProfile; i++) await new Promise((resolve) => setImmediate(resolve));
    assert.ok(completeProfile);
    await elements.get('disconnect').emit('click');
    account = 'third@example.com';
    await elements.get('connect').emit('click');
    completeProfile(json({ emailAddress: 'second@example.com' }));
    await pendingModification;
    assert.equal(calls.filter((path) => path.includes('/modify')).length, oldModificationCount);
    assert.equal(elements.get('connect').hidden, true);
    assert.match(elements.get('compose-account').textContent, /third@example.com/);
  } finally {
    disconnect();
  }
});
