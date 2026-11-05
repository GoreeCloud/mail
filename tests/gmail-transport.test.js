import test from 'node:test';
import assert from 'node:assert/strict';
import { connectGoogle, disconnect } from '../src/auth.js';
import { listMessages } from '../src/gmail.js';

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;

async function withFakeGoogle(handler) {
  globalThis.window = {
    google: { accounts: { oauth2: { initTokenClient: (configuration) => ({
      requestAccessToken() {
        configuration.callback({ access_token: 'TEST-NOT-REAL', expires_in: 3600 });
      }
    }) } } }
  };
  await connectGoogle('12345.apps.googleusercontent.com');
  try { await handler(); }
  finally {
    disconnect();
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
  }
}

function response(body, status = 200) {
  return { status, ok: status >= 200 && status < 300, json: async () => body };
}
function metadata(id) {
  return { id, labelIds: ['INBOX'], payload: { headers: [
    { name: 'From', value: 'sample@example.com' },
    { name: 'Subject', value: 'Mailbox test' }
  ] } };
}

test('Gmail page preserves cursors and reports partial metadata errors', async () => {
  await withFakeGoogle(async () => {
    const visited = [];
    globalThis.fetch = async (url, init) => {
      visited.push(String(url));
      assert.equal(init.headers.Authorization, 'Bearer TEST-NOT-REAL');
      assert.equal(init.credentials, 'omit');
      if (String(url).includes('/messages?')) return response({
        messages: [{ id: 'one' }, { id: 'two' }, { id: 'three' }],
        nextPageToken: 'next-cursor'
      });
      if (String(url).includes('/messages/two')) return response({}, 503);
      return response(metadata(String(url).split('/messages/')[1].split('?')[0]));
    };
    const page = await listMessages('INBOX', 'from:sample@example.com');
    assert.equal(page.messages.length, 2);
    assert.equal(page.failedCount, 1);
    assert.equal(page.nextPageToken, 'next-cursor');
    assert.ok(visited[0].includes('q=from%3Asample%40example.com'));
    assert.ok(visited[0].includes('labelIds=INBOX'));
    assert.ok(!visited[0].includes('pageToken='));
    await listMessages('INBOX', '', 'next-cursor');
    assert.ok(visited.some((url) => url.includes('pageToken=next-cursor')));
  });
});

test('all failed Gmail metadata requests never masquerade as an empty inbox', async () => {
  await withFakeGoogle(async () => {
    globalThis.fetch = async (url) => String(url).includes('/messages?')
      ? response({ messages: [{ id: 'one' }] }) : response({}, 429);
    await assert.rejects(listMessages('INBOX'), /metadata could not be loaded/i);
  });
});

test('empty Gmail pages remain successful and unpaginated', async () => {
  await withFakeGoogle(async () => {
    globalThis.fetch = async () => response({ resultSizeEstimate: 0 });
    const page = await listMessages('SENT');
    assert.deepEqual(page, { messages: [], nextPageToken: '', failedCount: 0 });
  });
});
