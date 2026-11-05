import test from 'node:test';
import assert from 'node:assert/strict';
import { base64UrlEncode, decodeB64Url, extractPlainText, buildRawMessage, normalizeMessage } from '../src/gmail.js';

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
