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
