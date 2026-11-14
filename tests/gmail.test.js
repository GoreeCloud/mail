import test from 'node:test';
import assert from 'node:assert/strict';
import { base64UrlEncode, decodeB64Url, extractPlainText, buildRawMessage, normalizeMessage, extractAttachmentSummaries, validateSendReceipt } from '../src/gmail.js';

test('base64url encodes and decodes UTF-8 safely', () => {
  const value = 'Hello, Görée ✉️';
  assert.equal(decodeB64Url(base64UrlEncode(value)), value);
});
test('plain text is preferred recursively over HTML', () => {
  const payload = { mimeType: 'multipart/alternative', parts: [
    { mimeType: 'text/html', body: { data: base64UrlEncode('<b>unsafe</b>') } },
    { mimeType: 'text/plain', body: { data: base64UrlEncode('Safe text') } }
  ] };
  assert.equal(extractPlainText(payload), 'Safe text');
  assert.equal(extractPlainText({ mimeType: 'text/html', body: { data: base64UrlEncode('<img src=x>') } }), '');
});
test('message metadata is normalized without HTML execution', () => {
  const data = normalizeMessage({ id: '1', labelIds: ['INBOX'], snippet: 'Hi', payload: { headers: [
    { name: 'From', value: 'person@example.com' }, { name: 'Subject', value: '<img onerror=alert(1)>' }
  ] } });
  assert.equal(data.subject, '<img onerror=alert(1)>');
  assert.deepEqual(data.labels, ['INBOX']);
});
test('MIME email safely includes UTF-8 and recipient headers', () => {
  const mime = decodeB64Url(buildRawMessage({ to: 'a@example.com, b@example.org', subject: 'Résumé', body: 'First\nSecond' }));
  assert.match(mime, /^To: a@example.com, b@example.org\r\n/);
  assert.match(mime, /Subject: =\?UTF-8\?B\?/);
  assert.match(mime, /Content-Transfer-Encoding: base64/);
});
test('rejects email header injection and invalid recipients', () => {
  assert.throws(() => buildRawMessage({ to: 'x@example.com\r\nBcc: bad@example.com', subject: 'ok', body: 'yes' }));
  assert.throws(() => buildRawMessage({ to: 'x@example.com', subject: 'Hi\nCc: bad@example.com', body: 'yes' }));
  assert.throws(() => buildRawMessage({ to: 'not-an-email', subject: 'ok', body: 'yes' }));
  assert.throws(() => buildRawMessage({ to: 'x@example.com', subject: 'ok', body: ' ' }));
});

test('MIME parser never treats a text attachment as the email body', () => {
  const payload = { mimeType: 'multipart/mixed', parts: [
    { mimeType: 'text/plain', filename: 'secret.txt', body: { data: base64UrlEncode('attachment') } },
    { mimeType: 'text/plain', headers: [{ name: 'Content-Disposition', value: 'attachment; filename="hi.txt"' }], body: { data: base64UrlEncode('attached') } },
    { mimeType: 'text/plain', body: { data: base64UrlEncode('Actual body') } }
  ] };
  assert.equal(extractPlainText(payload), 'Actual body');
});

test('plain-text preview recognizes supported MIME charsets and safely falls back', () => {
  const latin1 = Buffer.from([0x63, 0x61, 0x66, 0xe9]).toString('base64url');
  const payload = {
    mimeType: 'text/plain',
    headers: [{ name: 'Content-Type', value: 'text/plain; charset="iso-8859-1"' }],
    body: { data: latin1 }
  };
  assert.equal(extractPlainText(payload), 'café');
  assert.equal(extractPlainText({
    mimeType: 'text/plain',
    headers: [{ name: 'Content-Type', value: 'text/plain; charset="unknown-encoding"' }],
    body: { data: base64UrlEncode('UTF-8 fallback') }
  }), 'UTF-8 fallback');
});

test('MIME preview bounds prohibit extremely deep or broad structures', () => {
  let nested = { mimeType: 'text/plain', body: { data: base64UrlEncode('hidden') } };
  for (let i = 0; i < 34; i++) {
    nested = { mimeType: 'multipart/mixed', parts: [nested] };
  }
  assert.throws(() => extractPlainText(nested), /MIME structure exceeds/);
  assert.throws(() => extractPlainText({
    mimeType: 'multipart/mixed',
    parts: Array.from({ length: 260 }, () => ({ mimeType: 'text/html' }))
  }), /MIME structure exceeds/);
});

test('MIME text decoder refuses oversized base64 bodies before decoding', () => {
  assert.throws(() => decodeB64Url('A'.repeat(6 * 1024 * 1024)), /4 MiB viewing limit/);
});


test('attachments are metadata only and untrusted names are normalized safely', () => {
  const payload = { mimeType: 'multipart/mixed', parts: [
    { mimeType: 'text/plain', body: { data: base64UrlEncode('Readable text') } },
    { mimeType: 'application/pdf', filename: 'invoice\u202Efdp.pdf\r\n<script>', body: { attachmentId: 'SECRET-ID', size: 4096 } },
    { mimeType: 'image/png', body: { attachmentId: 'SECRET-OTHER', size: 0 } }
  ] };
  const summary = extractAttachmentSummaries(payload);
  assert.equal(summary.items.length, 2);
  assert.equal(summary.items[0].name, 'invoice�fdp.pdf��<script>');
  assert.equal(summary.items[0].mediaType, 'application/pdf');
  assert.equal(summary.items[0].size, 4096);
  assert.equal(summary.items[1].name, 'Unnamed attachment');
  assert.equal(summary.items[1].size, 0);
  assert.equal(summary.truncated, false);
  assert.ok(!JSON.stringify(summary).includes('SECRET-ID'));
  assert.equal(extractPlainText(payload), 'Readable text');
});

test('attachment metadata is capped and does not fetch content or traverse attached submessages', () => {
  const parts = Array.from({ length: 25 }, (_, i) => ({
    mimeType: 'application/octet-stream', filename: 'item-' + i + '.bin',
    body: { attachmentId: 'id-' + i, size: i }
  }));
  parts[0].parts = [{ mimeType: 'text/plain', body: { data: base64UrlEncode('not a message body') } }];
  const summaries = extractAttachmentSummaries({ mimeType: 'multipart/mixed', parts });
  assert.equal(summaries.items.length, 24);
  assert.equal(summaries.truncated, true);
  assert.equal(extractPlainText({ mimeType: 'multipart/mixed', parts }), '');
});

test('attachment summary rejects MIME trees exceeding structural limits', () => {
  const payload = { mimeType: 'multipart/mixed', parts: Array.from({ length: 257 },
    () => ({ mimeType: 'text/plain', filename: 'x.bin' })) };
  assert.throws(() => extractAttachmentSummaries(payload), /MIME structure exceeds/);
});

test('normalized messages include only inert attachment summaries', () => {
  const message = normalizeMessage({
    id: 'synthetic',
    payload: { mimeType: 'multipart/mixed', parts: [
      { mimeType: 'text/plain', body: { data: base64UrlEncode('Safe text') } },
      { mimeType: 'application/pdf', filename: 'receipt.pdf', body: { attachmentId: 'HIDDEN-ID', size: 11 } }
    ] }
  });
  assert.equal(message.body, 'Safe text');
  assert.equal(message.attachments[0].name, 'receipt.pdf');
  assert.equal(message.attachments[0].size, 11);
  assert.ok(!JSON.stringify(message).includes('HIDDEN-ID'));
});


test('malformed provider data does not crash message normalization', () => {
  const item = normalizeMessage({
    id: 'synthetic-1', threadId: 42, labelIds: 'INBOX', snippet: {},
    payload: {
      mimeType: 42,
      headers: [null, { name: 99, value: 'bad' },
        { name: 'From', value: 'safe\u202E@example.test' },
        { name: 'Subject', value: 'Control\u0000character' }],
      body: { data: base64UrlEncode('Do not display') }
    }
  });
  assert.equal(item.from, 'safe�@example.test');
  assert.equal(item.subject, 'Control�character');
  assert.deepEqual(item.labels, []);
  assert.equal(item.body, '');
  assert.equal(item.snippet, '');
});

test('untrusted label and preview sizes are bounded', () => {
  const item = normalizeMessage({
    id: 'synthetic-2', threadId: 't'.repeat(300),
    labelIds: ['INBOX', 123, 'x'.repeat(70), 'UNREAD'],
    snippet: 's'.repeat(8000),
    payload: { headers: 'not an array', mimeType: 'text/plain',
      body: { data: base64UrlEncode('Safe') } }
  });
  assert.deepEqual(item.labels, ['INBOX', 'UNREAD']);
  // A too-long provider thread ID is discarded rather than truncated into
  // an invented valid-looking reply target.
  assert.equal(item.threadId, '');
  assert.equal(item.snippet.length, 2048);
  assert.equal(item.body, 'Safe');
});

test('missing or oversized message identifiers are rejected', () => {
  for (const item of [null, {}, { id: 12 }, { id: '' }, { id: 'z'.repeat(257) },
    { id: 'a/b' }, { id: 'a\\nforged' }, { id: 'a\\u2028' }, { id: 'a ' }]) {
    assert.throws(() => normalizeMessage(item), /invalid message metadata/);
  }
});


test('provider thread IDs and label IDs do not carry malformed opaque identifiers', () => {
  const malformed = normalizeMessage({
    id: 'safe_id',
    threadId: 'bad/thread\\n',
    labelIds: ['INBOX', 'INBOX', 'Label_7', 'bad/label', 'strange\\u2028', null],
    payload: { headers: [] }
  });
  assert.equal(malformed.threadId, '');
  assert.deepEqual(malformed.labels, ['INBOX', 'Label_7']);
  const valid = normalizeMessage({ id: 'safe_id', threadId: 'thread-123', labelIds: ['UNREAD'] });
  assert.equal(valid.threadId, 'thread-123');
});

test('encapsulated RFC 822 message bodies are never used as the current email text', () => {
  const forwarded = {
    mimeType: 'message/rfc822',
    parts: [{ mimeType: 'text/plain', body: { data: base64UrlEncode('Private forwarded content') } }]
  };
  const payload = { mimeType: 'multipart/mixed', parts: [forwarded,
    { mimeType: 'text/plain', body: { data: base64UrlEncode('Visible original message') } }
  ] };
  assert.equal(extractPlainText(forwarded), '');
  assert.equal(extractPlainText(payload), 'Visible original message');
  const meta = extractAttachmentSummaries(payload);
  assert.equal(meta.items.length, 1);
  assert.equal(meta.items[0].mediaType, 'message/rfc822');
  assert.equal(meta.items[0].name, 'Unnamed attachment');
  assert.doesNotMatch(JSON.stringify(meta), /Private forwarded content/);
});

test('non-multipart MIME parts cannot smuggle nested visible text or attachment records', () => {
  const malformed = {
    mimeType: 'application/octet-stream',
    parts: [{ mimeType: 'text/plain', body: { data: base64UrlEncode('Hidden nested data') } },
      { mimeType: 'application/pdf', filename: 'do-not-descend.pdf', body: { size: 9999 } }]
  };
  assert.equal(extractPlainText(malformed), '');
  assert.deepEqual(extractAttachmentSummaries(malformed), { items: [], truncated: false });
  const sibling = { mimeType: 'multipart/mixed', parts: [
    malformed, { mimeType: 'text/plain', body: { data: base64UrlEncode('Visible sibling') } }
  ] };
  assert.equal(extractPlainText(sibling), 'Visible sibling');
});

test('unknown dispositions, attached multiparts and named inline parts never appear as body text', () => {
  const named = { mimeType: 'text/plain',
    headers: [{ name: 'Content-Disposition', value: 'inline; filename="secret.txt"' }],
    body: { data: base64UrlEncode('Named content not message body') } };
  const unknown = { mimeType: 'multipart/alternative',
    headers: [{ name: 'Content-Disposition', value: 'preview; filename="unknown.msg"' }],
    parts: [{ mimeType: 'text/plain', body: { data: base64UrlEncode('Suspicious nested content') } }] };
  const attached = { mimeType: 'multipart/mixed',
    headers: [{ name: 'Content-Disposition', value: 'ATTACHMENT' }],
    parts: [{ mimeType: 'text/plain', body: { data: base64UrlEncode('Attached children') } }] };
  const payload = { mimeType: 'multipart/mixed', parts: [named, unknown, attached,
    { mimeType: 'text/plain', body: { data: base64UrlEncode('Visible safe body') } }
  ] };
  assert.equal(extractPlainText(payload), 'Visible safe body');
  const metadata = extractAttachmentSummaries(payload);
  assert.equal(metadata.items.length, 3);
  assert.ok(metadata.items.every((item) => item.name === 'Unnamed attachment'));
});

test('valid media types are normalized but malformed provider MIME types are not trusted', () => {
  const payload = { mimeType: 'multipart/mixed', parts: [
    { mimeType: 'Application/PDF', filename: 'invoice.pdf', body: { size: 57 } },
    { mimeType: 'application/pdf<script>', filename: 'bad.pdf', body: { size: 5 } },
    { mimeType: 'x'.repeat(70) + '/pdf', filename: 'long.pdf' },
    { mimeType: 42, filename: 'bad-type.pdf' }
  ] };
  const meta = extractAttachmentSummaries(payload);
  assert.deepEqual(meta.items.map((item) => item.mediaType),
    ['application/pdf', 'Unknown type', 'Unknown type', 'Unknown type']);
  assert.equal(extractPlainText(payload), '');
});

test('inline multipart alternatives remain visible without rendering HTML or active attachments', () => {
  const payload = { mimeType: 'multipart/mixed', parts: [
    { mimeType: 'multipart/alternative',
      headers: [{ name: 'Content-Disposition', value: 'INLINE' }],
      parts: [
        { mimeType: 'text/html', body: { data: base64UrlEncode('<script>bad()</script>') } },
        { mimeType: 'text/plain', body: { data: base64UrlEncode('Safe plain alternative') } }
      ] },
    { mimeType: 'image/png', body: { attachmentId: 'hidden-content-id' } }
  ] };
  assert.equal(extractPlainText(payload), 'Safe plain alternative');
  assert.equal(extractAttachmentSummaries(payload).items.length, 1);
});


test('a text/plain node with fabricated parts does not expose nested attachment metadata', () => {
  const malformed = {
    mimeType: 'text/plain',
    body: { data: base64UrlEncode('Current body') },
    parts: [{ mimeType: 'application/pdf', filename: 'hidden.pdf', body: { size: 100 } }]
  };
  assert.equal(extractPlainText(malformed), 'Current body');
  assert.deepEqual(extractAttachmentSummaries(malformed), { items: [], truncated: false });
});


test('duplicate MIME dispositions and RFC 2231 filename continuations are never previewed', () => {
  const entries = [
    { mimeType: 'text/plain',
      headers: [
        { name: 'Content-Disposition', value: 'inline' },
        { name: 'Content-Disposition', value: 'attachment' }
      ],
      body: { data: base64UrlEncode('conflicted header') } },
    { mimeType: 'text/plain',
      headers: [{ name: 'Content-Disposition', value: 'inline; filename*0*=UTF-8\'\'secret.txt' }],
      body: { data: base64UrlEncode('continuation attachment') } },
    { mimeType: 'text/plain',
      headers: [{ name: 'Content-Disposition', value: 'INLINE; filename*=UTF-8\'\'secret.txt' }],
      body: { data: base64UrlEncode('encoded attachment') } },
    { mimeType: 'text/plain', body: { data: base64UrlEncode('Visible body only') } }
  ];
  const payload = { mimeType: 'multipart/mixed', parts: entries };
  assert.equal(extractPlainText(payload), 'Visible body only');
  assert.equal(extractAttachmentSummaries(payload).items.length, 3);
});

test('malformed provider filename and attachment ID data are never interpreted as body text', () => {
  const payload = { mimeType: 'multipart/mixed', parts: [
    { mimeType: 'text/plain', filename: { evil: 'object' },
      body: { data: base64UrlEncode('not a body') } },
    { mimeType: 'text/plain', body: { attachmentId: { invalid: 'id' },
      data: base64UrlEncode('not visible') } },
    { mimeType: 'text/plain', body: { data: base64UrlEncode('Visible text') } }
  ] };
  assert.equal(extractPlainText(payload), 'Visible text');
  assert.equal(extractAttachmentSummaries(payload).items.length, 2);
  assert.equal(extractAttachmentSummaries(payload).items[0].name, 'Unnamed attachment');
});


test('sent-mail receipts reject malformed IDs and unsafe provider thread metadata', () => {
  assert.deepEqual(validateSendReceipt({ id: 'msg_123', threadId: 'thread_123' }), {
    id: 'msg_123', threadId: 'thread_123', status: 'accepted_by_provider'
  });
  assert.deepEqual(validateSendReceipt({ id: 'msg_123' }), {
    id: 'msg_123', threadId: null, status: 'accepted_by_provider'
  });
  for (const receipt of [null, {}, { id: 'has space' }, { id: 'a/b' },
    { id: 'a\\nforged' }, { id: 'x'.repeat(257) }, { id: 'ok', threadId: 7 },
    { id: 'ok', threadId: 'bad/thread' }, { id: 'ok', threadId: '' }]) {
    assert.throws(() => validateSendReceipt(receipt), /Check Sent before retrying/);
  }
  assert.throws(() => validateSendReceipt({ id: 'sent', threadId: 'wrong' }, 'expected'),
    /unexpected reply thread/);
  assert.deepEqual(validateSendReceipt({ id: 'sent', threadId: 'expected' }, 'expected'), {
    id: 'sent', threadId: 'expected', status: 'accepted_by_provider'
  });
});
