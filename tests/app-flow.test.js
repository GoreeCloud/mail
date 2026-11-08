import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

class FakeElement {
  constructor() {
    this.textContent = '';
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.dataset = {};
    this.children = [];
    this.listeners = new Map();
    this.selectors = new Map();
    const values = new Set();
    this.classList = {
      add: (item) => values.add(item),
      remove: (item) => values.delete(item),
      contains: (item) => values.has(item)
    };
  }
  addEventListener(type, fn) { this.listeners.set(type, fn); }
  async click() {
    const fn = this.listeners.get('click');
    return fn?.({ preventDefault() {}, target: this });
  }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = [...items]; }
  setAttribute(key, value) { this[key] = value; }
  removeAttribute(key) { delete this[key]; }
  querySelector(key) {
    if (!this.selectors.has(key)) this.selectors.set(key, new FakeElement());
    return this.selectors.get(key);
  }
  showModal() { this.open = true; }
  close() { this.open = false; }
  focus() {}
  reset() {}
}
function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}
const response = (value) => ({ status: 200, ok: true, json: async () => value });
const metadata = (id) => ({
  id, labelIds: ['INBOX'], snippet: 'Preview ' + id,
  payload: { headers: [
    { name: 'From', value: 'test@example.com' },
    { name: 'Subject', value: 'Subject ' + id },
    { name: 'Date', value: 'Thu, 05 Nov 2026 12:00:00 GMT' }
  ] }
});

test('pagination loads another page; disconnect prevents stale reader text', async () => {
  const elements = new Map(ids.map((id) => [id, new FakeElement()]));
  const nav = ['INBOX', 'STARRED', 'SENT', 'ALL'].map((view) => {
    const element = new FakeElement();
    element.dataset.view = view;
    return element;
  });
  globalThis.document = {
    body: new FakeElement(),
    documentElement: new FakeElement(),
    head: new FakeElement(),
    getElementById: (id) => elements.get(id),
    querySelectorAll: (selector) => selector === '[data-view]' ? nav : [],
    querySelector: () => null,
    createElement: () => new FakeElement(),
    addEventListener() {}
  };
  globalThis.window = {
    google: { accounts: { oauth2: { initTokenClient: (options) => ({
      requestAccessToken: () => options.callback({ access_token: 'fake-token', expires_in: 3600, scope: options.scope })
    }) } } },
    confirm: () => true
  };
  globalThis.localStorage = {
    getItem: () => '12345.apps.googleusercontent.com',
    setItem() {},
    removeItem() {}
  };
  let readPending = deferred();
  let listPending = null;
  let metadataFailuresRemaining = 3;
  globalThis.fetch = async (url) => {
    const request = String(url);
    if (request.endsWith('/profile')) return response({ emailAddress: 'test@example.com' });
    if (request.includes('/messages?')) {
      if (listPending) return listPending.promise;
      const parsed = new URL(request);
      return response(parsed.searchParams.has('pageToken')
        ? { messages: [{ id: 'two' }] }
        : { messages: [{ id: 'one' }], nextPageToken: 'second' });
    }
    if (request.includes('/messages/one?format=full')) return readPending.promise;
    if (request.includes('format=metadata')) {
      const id = request.split('/messages/')[1].split('?')[0];
      if (id === 'two' && metadataFailuresRemaining-- > 0) {
        return { status: 503, ok: false, json: async () => ({}) };
      }
      return response(metadata(id));
    }
    if (request.includes('/modify')) return response({});
    throw new Error('Unexpected network request ' + request);
  };
  await import('../src/main.js');
  const initialTheme = document.documentElement.dataset.mode;
  await elements.get('theme-settings').click();
  assert.equal(document.documentElement.dataset.mode, initialTheme === 'dark' ? 'light' : 'dark');
  await elements.get('theme-settings').click();
  assert.equal(document.documentElement.dataset.mode, initialTheme === 'dark' ? 'dark' : 'light');
  await elements.get('connect').click();
  assert.equal(elements.get('message-list').children.length, 1);
  assert.equal(elements.get('load-more').hidden, false);
  await elements.get('load-more').click();
  assert.equal(elements.get('message-list').children.length, 1, 'failed second page leaves previous page intact');
  assert.equal(elements.get('load-more').hidden, false, 'failed page cursor must remain available');
  assert.equal(elements.get('load-more').textContent, 'Retry this page');
  assert.match(elements.get('notice').textContent, /Retry the same page/);
  await elements.get('load-more').click();
  assert.equal(elements.get('message-list').children.length, 2);
  assert.equal(elements.get('load-more').hidden, true);
  const firstMessage = elements.get('message-list').children[0].children[0];
  const ongoingRead = firstMessage.click();
  await elements.get('disconnect').click();
  readPending.resolve(response(metadata('one')));
  await ongoingRead;
  assert.equal(elements.get('reader-body').textContent, '');
  assert.equal(elements.get('reader').hidden, true);
  assert.equal(elements.get('message-list').children.length, 0);

  // A previously selected message cannot overwrite the reader after a mailbox switch.
  await elements.get('connect').click();
  readPending = deferred();
  const anotherRead = elements.get('message-list').children[0].children[0].click();
  await nav[1].click();
  readPending.resolve(response(metadata('one')));
  await anotherRead;
  assert.equal(elements.get('reader-body').textContent, '');
  assert.equal(elements.get('reader').hidden, true);

  // A delayed mailbox listing must not restore messages after disconnect.
  listPending = deferred();
  await nav[0].click();
  await elements.get('disconnect').click();
  listPending.resolve(response({ messages: [{ id: 'one' }] }));
  await new Promise((done) => setTimeout(done, 0));
  assert.equal(elements.get('message-list').children.length, 0);
  assert.equal(elements.get('load-more').hidden, true);
});
