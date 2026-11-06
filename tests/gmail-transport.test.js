import { prepareReplyDraft } from '../src/reply.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { connectGoogle, disconnect, requestCapability } from '../src/auth.js';
import { listMessages, sendMessage } from '../src/gmail.js';

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


const draft = { to: 'test@example.com', subject: 'Synthetic test', body: 'No real email was sent.' };

test('Gmail submission requires a message ID and distinguishes accepted from delivered', async () => {
  await withFakeGoogle(async () => {
    await requestCapability('send');
    let requests = 0;
    globalThis.fetch = async (url, init) => {
      requests++;
      assert.ok(String(url).endsWith('/messages/send'));
      assert.equal(init.method, 'POST');
      assert.equal(init.credentials, 'omit');
      const submitted = JSON.parse(init.body);
      assert.match(submitted.raw, /^[A-Za-z0-9_-]+$/);
      assert.ok(!submitted.raw.includes('No real email was sent'));
      return response({ id: 'synthetic-message-123', threadId: 'synthetic-thread-1' });
    };
    const result = await sendMessage(draft);
    assert.deepEqual(result, {
      id: 'synthetic-message-123',
      threadId: 'synthetic-thread-1',
      status: 'accepted_by_provider'
    });
    assert.equal(requests, 1);
  });
});

test('Gmail 200 without a message ID is an unknown submission, not confirmation', async () => {
  await withFakeGoogle(async () => {
    await requestCapability('send');
    let requests = 0;
    globalThis.fetch = async () => { requests++; return response({}); };
    await assert.rejects(sendMessage(draft), /Check Sent before retrying/);
    assert.equal(requests, 1, 'never auto-retry an ambiguous submission');
  });
});

test('lost Gmail send responses are treated as ambiguous with no automatic retries', async () => {
  await withFakeGoogle(async () => {
    await requestCapability('send');
    let requests = 0;
    globalThis.fetch = async () => {
      requests++;
      throw new TypeError('Simulated connection loss after send');
    };
    await assert.rejects(sendMessage(draft), /Check Sent before retrying/);
    assert.equal(requests, 1);
  });
});

test('explicit Gmail authorization denial is surfaced without an ambiguous-send claim', async () => {
  await withFakeGoogle(async () => {
    await requestCapability('send');
    globalThis.fetch = async () => response({}, 403);
    await assert.rejects(sendMessage(draft), (error) => error.status === 403);
  });
});

test('invalid sending input is rejected before any provider network call', async () => {
  await withFakeGoogle(async () => {
    await requestCapability('send');
    let requests = 0;
    globalThis.fetch = async () => { requests++; return response({ id: 'never' }); };
    await assert.rejects(sendMessage({ ...draft, to: 'bad-address' }), /ASCII email addresses/);
    assert.equal(requests, 0);
  });
});


test('Gmail threaded reply sends validated RFC headers and an explicit threadId', async () => {
  await withFakeGoogle(async () => {
    await requestCapability('send');
    let requests = 0;
    globalThis.fetch = async (url, options) => {
      requests++;
      assert.match(String(url), /messages\/send$/);
      const payload = JSON.parse(options.body);
      assert.equal(payload.threadId, 'gmailThread001');
      const mime = Buffer.from(payload.raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
      assert.match(mime, /In-Reply-To: <parent@example.test>\r\n/);
      assert.match(mime, /References: <ancestor@example.test> <parent@example.test>\r\n/);
      return response({ id: 'accepted123', threadId: 'gmailThread001' });
    };
    const prepared = prepareReplyDraft({
      threadId: 'gmailThread001',
      headers: [
        { name: 'From', value: 'sender@example.test' },
        { name: 'Subject', value: 'Question' },
        { name: 'Message-ID', value: '<parent@example.test>' },
        { name: 'References', value: '<ancestor@example.test>' }
      ]
    });
    const result = await sendMessage({ ...prepared, body: 'The reply content' });
    assert.equal(result.status, 'accepted_by_provider');
    assert.equal(result.threadId, 'gmailThread001');
    assert.equal(requests, 1);
  });
});

test('changed threaded reply subject is rejected before any Gmail submission', async () => {
  await withFakeGoogle(async () => {
    await requestCapability('send');
    let requests = 0;
    globalThis.fetch = async () => {
      requests++;
      return response({ id: 'should-not-send' });
    };
    const prepared = prepareReplyDraft({
      threadId: 'thread2',
      headers: [
        { name: 'Reply-To', value: 'recipient@example.test' },
        { name: 'Subject', value: 'Question' },
        { name: 'Message-ID', value: '<parent@example.test>' }
      ]
    });
    await assert.rejects(
      sendMessage({ ...prepared, subject: 'Changed', body: 'Reply body' }),
      /threading data or subject changed/
    );
    assert.equal(requests, 0);
  });
});


test('a Gmail reply receipt for a different thread is treated as an ambiguous submission', async () => {
  await withFakeGoogle(async () => {
    await requestCapability('send');
    const prepared = prepareReplyDraft({
      threadId: 'expected-thread',
      headers: [
        { name: 'From', value: 'sender@example.test' },
        { name: 'Subject', value: 'Review' },
        { name: 'Message-ID', value: '<original@example.test>' }
      ]
    });
    let requests = 0;
    globalThis.fetch = async (url, init) => {
      requests++;
      assert.equal(JSON.parse(init.body).threadId, 'expected-thread');
      return response({ id: 'possibly-sent', threadId: 'unexpected-thread' });
    };
    await assert.rejects(sendMessage({ ...prepared, body: 'A synthetic reply' }),
      /unexpected reply thread.*Check Sent before retrying/i);
    assert.equal(requests, 1, 'never automatically resend a potentially accepted reply');
  });
});

test('a Gmail reply receipt with no thread ID is not a confirmation of threading', async () => {
  await withFakeGoogle(async () => {
    await requestCapability('send');
    let requests = 0;
    globalThis.fetch = async () => {
      requests++;
      return response({ id: 'possibly-sent' });
    };
    const prepared = prepareReplyDraft({
      threadId: 'thread9',
      headers: [
        { name: 'From', value: 'author@example.test' },
        { name: 'Subject', value: 'Topic' },
        { name: 'Message-ID', value: '<original@example.test>' }
      ]
    });
    await assert.rejects(sendMessage({ ...prepared, body: 'Synthetic reply' }),
      /unexpected reply thread/i);
    assert.equal(requests, 1);
  });
});
