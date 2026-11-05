import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRawMessage, decodeB64Url, base64UrlEncode } from '../src/gmail.js';

function decodeSubjectLine(raw) {
  const firstLine = raw.split('\r\n').find((line) => line.startsWith('Subject: '));
  return firstLine || '';
}

test('long UTF-8 subjects are folded into valid RFC 2047 encoded words', () => {
  const raw = decodeB64Url(buildRawMessage({
    to: 'person@example.com',
    subject: 'Résumé ✉️ '.repeat(45),
    body: 'Hello'
  }));
  const encodedWords = [...raw.matchAll(/=\?UTF-8\?B\?([A-Za-z0-9+/]+=*)\?=/g)];
  assert.ok(encodedWords.length > 2, 'subject must be split');
  const recovered = encodedWords.map((match) => Buffer.from(match[1], 'base64').toString('utf8')).join('');
  assert.equal(recovered, 'Résumé ✉️ '.repeat(45).trim());
  assert.ok(encodedWords.every((match) => match[0].length <= 75));
  assert.match(decodeSubjectLine(raw), /^Subject: =\?UTF-8\?B\?/);
});

test('large text bodies encode without stack overflow and enforce alpha size limit', () => {
  const body = 'GoreeCloud mail\n'.repeat(4000);
  const raw = decodeB64Url(buildRawMessage({ to: 'person@example.com', subject: 'Test', body }));
  const encodedBody = raw.split('\r\n\r\n')[1];
  const decoded = Buffer.from(encodedBody.replace(/\s+/g, ''), 'base64').toString('utf8');
  assert.equal(decoded, body.replace(/\n/g, '\r\n'));
  assert.throws(() => buildRawMessage({
    to: 'person@example.com', subject: 'Too large', body: 'X'.repeat(1048577)
  }), /1 MiB/);
});

test('control characters and non-ASCII mailboxes are rejected in this milestone', () => {
  for (const badTo of ['person@example.com\t', 'x@invalid', 'user@example.com\rAnother: x', 'héllo@example.com']) {
    assert.throws(() => buildRawMessage({ to: badTo, subject: 'ok', body: 'message' }));
  }
  for (const badSubject of ['hello\nBad: hi', 'line\rcontinuation', 'foo\0bar']) {
    assert.throws(() => buildRawMessage({ to: 'person@example.com', subject: badSubject, body: 'message' }));
  }
});

test('base64url output remains URL safe for international text', () => {
  const payload = base64UrlEncode('合作　GoreeCloud 📧');
  assert.match(payload, /^[A-Za-z0-9_-]+$/);
  assert.equal(decodeB64Url(payload), '合作　GoreeCloud 📧');
});
