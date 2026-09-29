export function formatMessagePlainText(message) {
  if (!message || typeof message !== 'object') {
    throw new TypeError('message must be an object');
  }

  const subject = text(message.subject) || '(no subject)';
  const sender = text(message.sender) || 'Unknown sender';
  const address = text(message.address);
  const receivedAt = normalizeReceivedAt(message.receivedAt);
  const body = normalizeBody(message.body);
  const attachmentCount = Array.isArray(message.attachments) ? message.attachments.length : 0;

  const lines = [
    'GoreeCloud Mail — message export',
    `Subject: ${subject}`,
    `From: ${address ? `${sender} <${address}>` : sender}`,
    `Date: ${receivedAt}`,
    '',
    body,
    '',
    attachmentCount === 0
      ? 'Attachments: none'
      : `Attachments: ${attachmentCount} not included in this plain-text export.`,
    '',
  ];

  return lines.join('\n');
}


export async function copyMessagePlainText(message, clipboard) {
  if (!clipboard || typeof clipboard.writeText !== 'function') {
    throw new Error('Clipboard API is unavailable');
  }

  const payload = formatMessagePlainText(message);
  await clipboard.writeText(payload);
  return payload;
}

export function messagePlainTextFilename(message) {
  const subject = text(message?.subject)
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  const stem = subject || 'message';
  return `${stem}.txt`;
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBody(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

function normalizeReceivedAt(value) {
  const raw = text(value);
  if (!raw) return 'Unknown';
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : parsed.toISOString();
}
