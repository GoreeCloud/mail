import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareReplyDraft, validateReplyContext } from '../src/reply.js';
import { buildRawMessage, decodeB64Url } from '../src/gmail.js';

function source(overrides = {}) {
  return {
    threadId: 'testThread0039',
    subject: 'Quarterly review',
    headers: [
      { name: 'From', value: '"Person, A" <author@example.test>' },
      { name: 'Reply-To', value: 'reply@example.test' },
      { name: 'Subject', value: 'Quarterly review' },
      { name: 'Message-ID', value: '<original@example.test>' },
      { name: 'References', value: '<ancestor@example.test>' }
    ],
    ...overrides
  };
}

test('reply targets Reply-To and retains Gmail parent identifiers', () => {
  const reply = prepareReplyDraft(source());
  assert.equal(reply.to, 'reply@example.test');
  assert.equal(reply.subject, 'Re: Quarterly review');
  assert.equal(reply.body, '');
  assert.deepEqual(reply.reply, {
    recipient: 'reply@example.test',
    threadId: 'testThread0039',
    inReplyTo: '<original@example.test>',
    references: ['<ancestor@example.test>', '<original@example.test>'],
    subject: 'Re: Quarterly review'
  });
});

test('reply falls back to one valid From and does not stack Re prefixes', () => {
  const message = source({ headers: [
    { name: 'From', value: '"Person A" <author@example.test>' },
    { name: 'Subject', value: 'Re: Annual update' },
    { name: 'Message-ID', value: '<parent@example.test>' }
  ] });
  const reply = prepareReplyDraft(message);
  assert.equal(reply.to, 'author@example.test');
  assert.equal(reply.subject, 'Re: Annual update');
  assert.deepEqual(reply.reply.references, ['<parent@example.test>']);
});

test('builder uses RFC reply identifiers with strict Gmail threading payload', () => {
  const draft = prepareReplyDraft(source());
  const mime = decodeB64Url(buildRawMessage({ ...draft, body: 'Reply content' }));
  assert.match(mime, /^To: reply@example.test\r\n/);
  assert.match(mime, /In-Reply-To: <original@example.test>\r\n/);
  assert.match(mime, /References: <ancestor@example.test> <original@example.test>\r\n/);
  assert.doesNotMatch(mime, /<script|Bcc:/i);
});

test('malformed and ambiguous recipients fail closed rather than silently rerouting', () => {
  for (const invalid of [
    'someone@example.test, other@example.test',
    'Name <bad@example.test>\r\nBcc: other@example.test',
    'Name <unsupported@localhost>',
    'Name <first@example.test> <second@example.test>',
    ''
  ]) {
    const message = source({ headers: source().headers.map((h) =>
      h.name === 'Reply-To' ? { ...h, value: invalid } : h) });
    assert.throws(() => prepareReplyDraft(message), /Reply recipient/);
  }
  const duplicate = source({ headers: [
    ...source().headers, { name: 'Reply-To', value: 'attacker@example.test' }
  ] });
  assert.throws(() => prepareReplyDraft(duplicate), /ambiguous/);
});

test('missing or corrupt threading data cannot be used for a reply', () => {
  assert.throws(() => prepareReplyDraft(source({ threadId: '' })), /threading/);
  assert.throws(() => prepareReplyDraft(source({ headers: source().headers.filter(
    (h) => h.name !== 'Message-ID') })), /Message-ID/);
  const malformed = source({ headers: source().headers.map((h) =>
    h.name === 'Message-ID' ? { ...h, value: '<bad@example.test>\r\nCc: bad@example.test' } : h) });
  assert.throws(() => prepareReplyDraft(malformed), /Message-ID/);
  const invalidReferences = source({ headers: source().headers.map((h) =>
    h.name === 'References' ? { ...h, value: 'not-a-safe-message-id' } : h) });
  assert.throws(() => prepareReplyDraft(invalidReferences), /reference/);
});

test('reply subject cannot be changed or used with arbitrary thread references', () => {
  const draft = prepareReplyDraft(source());
  assert.throws(() => buildRawMessage({ ...draft, subject: 'Different', body: 'Hello' }), /threading data or subject changed/);
  assert.throws(() => validateReplyContext({
    ...draft.reply, inReplyTo: '<somebody@example.test>'
  }, draft.subject), /threading data or subject changed/);
  assert.throws(() => validateReplyContext({
    ...draft.reply, references: ['bad']
  }, draft.subject), /threading data or subject changed/);
  assert.throws(() => buildRawMessage({ ...draft, to: 'victim@example.test\r\nBcc: other@example.test', body: 'Hello' }), /Recipients must contain|valid comma-separated/);
});

test('a reply with excessive original subject length is refused rather than mistheaded', () => {
  const m = source({ headers: source().headers.map((h) =>
    h.name === 'Subject' ? { ...h, value: 'x'.repeat(290) } : h) });
  assert.throws(() => prepareReplyDraft(m), /Reply subject/);
});
