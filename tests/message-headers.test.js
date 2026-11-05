import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeMessageHeaders, MAX_VISIBLE_HEADERS } from '../src/message-headers.js';
import { normalizeMessage } from '../src/gmail.js';

test('header inspector unfolds lines and neutralizes controls and bidirectional spoofing', () => {
  const result = summarizeMessageHeaders([
    { name: 'Authentication-Results', value: 'mx.example; spf=pass;\r\n\t dkim=pass' },
    { name: 'X-Test', value: 'Before\u202Eafter\u0000<script>alert(1)</script>' },
    { name: 'Received', value: 'from a' },
    { name: 'Received', value: 'from b' }
  ]);
  assert.deepEqual(result.items.map((x) => x.name),
    ['Authentication-Results', 'X-Test', 'Received', 'Received']);
  assert.equal(result.items[0].value, 'mx.example; spf=pass; dkim=pass');
  assert.equal(result.items[1].value, 'Before�after�<script>alert(1)</script>');
  assert.equal(result.truncated, false);
});

test('header inspector caps entry counts and per-field values', () => {
  const long = 'A'.repeat(10000);
  const headers = [
    { name: 'X-Large', value: long },
    ...Array.from({ length: 60 }, (_, i) => ({ name: 'X-N-' + i, value: 'ok' }))
  ];
  const result = summarizeMessageHeaders(headers);
  assert.equal(result.items.length, MAX_VISIBLE_HEADERS);
  assert.equal(result.items[0].value.length, 1024);
  assert.equal(result.truncated, true);
});

test('invalid header names and non-string data never trigger code execution or coercion', () => {
  const trap = { toString() { throw new Error('Never execute a provider value'); } };
  const result = summarizeMessageHeaders([
    { name: 'To: Bcc', value: 'fake' },
    { name: 'X-Valid', value: trap },
    { name: 'X-\u202E-Bidi', value: 'fake' },
    { name: 'Reply-To', value: 'reply@example.com' }
  ]);
  assert.deepEqual(result.items, [
    { name: 'X-Valid', value: '' }, { name: 'Reply-To', value: 'reply@example.com' }
  ]);
  assert.equal(result.truncated, true);
  assert.deepEqual(summarizeMessageHeaders(null), { items: [], truncated: false });
});

test('normalized Gmail reader data includes only bounded header summaries', () => {
  const data = normalizeMessage({
    id: 'synthetic',
    payload: {
      mimeType: 'text/plain',
      body: { data: 'SGVsbG8=' },
      headers: [
        { name: 'From', value: 'sender@example.com' },
        { name: 'Subject', value: 'Synthetic' },
        { name: 'Message-ID', value: '<synthetic@example.com>' }
      ]
    }
  });
  assert.equal(data.body, 'Hello');
  assert.equal(data.headers.find((h) => h.name === 'Message-ID').value, '<synthetic@example.com>');
  assert.equal(data.headersTruncated, false);
});
