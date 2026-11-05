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
        configuration.callback({ access_token: 'TEST-NOT-REAL', expires_in: 3600, scope: configuration.scope });
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

test('Gmail page retries a transient metadata failure without skipping messages', async () => {
  await withFakeGoogle(async () => {
    const visited = [];
    let failedOnce = false;
    globalThis.fetch = async (url, init) => {
      visited.push(String(url));
      assert.equal(init.headers.Authorization, 'Bearer TEST-NOT-REAL');
      assert.equal(init.credentials, 'omit');
      if (String(url).includes('/messages?')) return response({
        messages: [{ id: 'one' }, { id: 'two' }, { id: 'three' }],
        nextPageToken: 'next-cursor'
      });
      if (String(url).includes('/messages/two') && !failedOnce) { failedOnce = true; return response({}, 503); }
      return response(metadata(String(url).split('/messages/')[1].split('?')[0]));
    };
    const page = await listMessages('INBOX', 'from:sample@example.com');
    assert.equal(page.messages.length, 3);
    assert.equal(page.failedCount, 0);
    assert.equal(failedOnce, true);
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
    await assert.rejects(listMessages('INBOX'), /Unable to load 1 message previews/i);
  });
});

test('empty Gmail pages remain successful and unpaginated', async () => {
  await withFakeGoogle(async () => {
    globalThis.fetch = async () => response({ resultSizeEstimate: 0 });
    const page = await listMessages('SENT');
    assert.deepEqual(page, { messages: [], nextPageToken: '', failedCount: 0 });
  });
});

test('persistent partial metadata failures reject the whole page instead of advancing the cursor', async () => {
  await withFakeGoogle(async () => {
    let attempts = 0;
    globalThis.fetch = async (url) => {
      if (String(url).includes('/messages?')) return response({
        messages: [{ id: 'one' }, { id: 'two' }], nextPageToken: 'would-skip-two'
      });
      if (String(url).includes('/messages/two')) { attempts++; return response({}, 503); }
      return response(metadata('one'));
    };
    await assert.rejects(listMessages('INBOX'), /Unable to load 1 message previews/);
    assert.equal(attempts, 3, 'bounded retries: first request and two retries');
  });
});

test('Gmail 401 and 403 metadata errors propagate without a retry loop', async () => {
  await withFakeGoogle(async () => {
    for (const status of [401, 403]) {
      let attempts = 0;
      globalThis.fetch = async (url) => {
        if (String(url).includes('/messages?')) return response({ messages: [{ id: 'test' }] });
        attempts++;
        return response({}, status);
      };
      await assert.rejects(listMessages('INBOX'), (error) => error.status === status);
      assert.equal(attempts, 1, 'authorization errors should not be retried');
    }
  });
});

test('Gmail metadata retry backoff is cancellable', async () => {
  await withFakeGoogle(async () => {
    const controller = new AbortController();
    let attempts = 0;
    globalThis.fetch = async (url) => {
      if (String(url).includes('/messages?')) return response({ messages: [{ id: 'test' }] });
      attempts++;
      if (attempts === 1) setTimeout(() => controller.abort(), 10);
      return response({}, 503);
    };
    await assert.rejects(listMessages('INBOX', '', '', { signal: controller.signal }),
      (error) => error.name === 'AbortError');
    assert.equal(attempts, 1, 'aborted retry must not issue another HTTP request');
  });
});
