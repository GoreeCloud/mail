import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatMessagePlainText,
  messagePlainTextFilename,
} from '../web/message-export.js';

test('formats the selected message as bounded plain text without attachment bytes', () => {
  const result = formatMessagePlainText({
    subject: 'Quarterly update',
    sender: 'Example Sender',
    address: 'sender@example.test',
    receivedAt: '2026-09-29T12:34:56-05:00',
    body: 'Line one\r\nLine two',
    attachments: [
      { filename: 'secret.pdf', contentBase64: 'DO-NOT-EXPORT' },
      { filename: 'photo.jpg', contentBase64: 'DO-NOT-EXPORT-EITHER' },
    ],
  });

  assert.match(result, /Subject: Quarterly update/);
  assert.match(result, /From: Example Sender <sender@example\.test>/);
  assert.match(result, /Date: 2026-09-29T17:34:56\.000Z/);
  assert.match(result, /Line one\nLine two/);
  assert.match(result, /Attachments: 2 not included/);
  assert.equal(result.includes('DO-NOT-EXPORT'), false);
  assert.equal(result.includes('secret.pdf'), false);
});

test('filename is local-safe and bounded', () => {
  assert.equal(
    messagePlainTextFilename({ subject: ' Project: Q4 / follow-up? ' }),
    'Project Q4 follow-up.txt',
  );
  assert.equal(messagePlainTextFilename({ subject: '' }), 'message.txt');
  assert.ok(messagePlainTextFilename({ subject: 'x'.repeat(200) }).length <= 84);
});

test('invalid message input fails closed', () => {
  assert.throws(() => formatMessagePlainText(null), /message must be an object/);
});
