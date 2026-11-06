import { getToken } from './auth.js';
import { summarizeMessageHeaders } from './message-headers.js';
import { validateReplyContext } from './reply.js';

const BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
const PAGE_SIZE = 30;
const MAX_BODY_BYTES = 1024 * 1024; // This alpha supports small, plain-text messages only.

async function api(path, init = {}) {
  const response = await fetch(BASE + path, {
    method: init.method || 'GET',
    headers: {
      Authorization: 'Bearer ' + getToken(init.capability || 'read'),
      ...(init.body ? { 'Content-Type': 'application/json' } : {})
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: init.signal,
    cache: 'no-store',
    credentials: 'omit',
    redirect: 'error'
  });
  if (response.status === 401) {
    const error = new Error('Google session expired. Please reconnect.');
    error.status = 401;
    throw error;
  }
  if (!response.ok) {
    const error = new Error('Gmail request failed (HTTP ' + response.status + ').');
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? {} : response.json();
}

function headerValue(headers, key) {
  if (!Array.isArray(headers)) return '';
  for (let index = 0; index < Math.min(headers.length, 256); index++) {
    const entry = headers[index];
    if (entry && typeof entry.name === 'string'
        && typeof entry.value === 'string'
        && entry.name.toLowerCase() === key.toLowerCase()) {
      return entry.value.slice(0, 8192);
    }
  }
  return '';
}

// Read MIME text defensively. The alpha deliberately does not render HTML or download
// attachment bodies. These bounds prevent recursive or oversized payloads from freezing UI.
const MAX_TEXT_BYTES = 4 * 1024 * 1024;
const MAX_MIME_NODES = 256;
const MAX_MIME_DEPTH = 32;

export function decodeB64Url(value, charset = 'utf-8') {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]*={0,2}$/.test(value)) return '';
  if (value.length > Math.ceil(MAX_TEXT_BYTES / 3) * 4 + 4) {
    throw new Error('Message text exceeds this alpha\'s 4 MiB viewing limit.');
  }
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  if (binary.length > MAX_TEXT_BYTES) {
    throw new Error('Message text exceeds this alpha\'s 4 MiB viewing limit.');
  }
  let decoder;
  try { decoder = new TextDecoder(charset); } catch { decoder = new TextDecoder(); }
  return decoder.decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function textCharset(part) {
  const contentType = headerValue(part.headers, 'Content-Type') || part.mimeType || '';
  const match = /(?:^|;)\s*charset\s*=\s*(?:"([^"]{1,64})"|([^;\s]{1,64}))/i.exec(contentType);
  return match?.[1] || match?.[2] || 'utf-8';
}

export function extractPlainText(payload) {
  if (!payload) return '';
  const pending = [{ part: payload, depth: 0 }];
  let visited = 0;
  while (pending.length) {
    const { part, depth } = pending.pop();
    if (++visited > MAX_MIME_NODES || depth > MAX_MIME_DEPTH) {
      throw new Error('Message MIME structure exceeds this alpha\'s viewing limit.');
    }
    if (!part || typeof part !== 'object' || part.filename || part.body?.attachmentId) continue;
    const disposition = headerValue(part.headers, 'Content-Disposition').trim();
    if (/^attachment(?:\s|;|$)/i.test(disposition)) continue;
    if (typeof part.mimeType === 'string'
      && part.mimeType.split(';')[0].trim().toLowerCase() === 'text/plain'
      && typeof part.body?.data === 'string' && part.body.data) {
      return decodeB64Url(part.body.data, textCharset(part));
    }
    const children = Array.isArray(part.parts) ? part.parts : [];
    if (visited + pending.length + children.length > MAX_MIME_NODES
        || (depth >= MAX_MIME_DEPTH && children.length)) {
      throw new Error('Message MIME structure exceeds this alpha\'s viewing limit.');
    }
    for (let i = children.length - 1; i >= 0; i--) {
      pending.push({ part: children[i], depth: depth + 1 });
    }
  }
  return '';
}

// These are inert metadata summaries, not attachments or downloaded bytes.
const MAX_VISIBLE_ATTACHMENTS = 24;
function safeAttachmentLabel(value) {
  if (typeof value !== 'string') return 'Unnamed attachment';
  const cleaned = value.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, '�').trim();
  return Array.from(cleaned).slice(0, 120).join('') || 'Unnamed attachment';
}

export function extractAttachmentSummaries(payload) {
  const items = [];
  if (!payload) return { items, truncated: false };
  const pending = [{ part: payload, depth: 0 }];
  let visited = 0;
  let truncated = false;
  while (pending.length) {
    const { part, depth } = pending.pop();
    if (++visited > MAX_MIME_NODES || depth > MAX_MIME_DEPTH) {
      throw new Error('Message MIME structure exceeds this alpha\'s viewing limit.');
    }
    if (!part || typeof part !== 'object') continue;
    const disposition = String(headerValue(part.headers, 'Content-Disposition') || '').trim();
    const named = typeof part.filename === 'string' && part.filename.trim().length > 0;
    const attached = named || /^attachment(?:\s|;|$)/i.test(disposition)
      || (typeof part.body?.attachmentId === 'string' && part.body.attachmentId.length > 0);
    if (attached) {
      if (items.length < MAX_VISIBLE_ATTACHMENTS) {
        const size = part.body?.size;
        const mediaType = typeof part.mimeType === 'string' && /^[a-z0-9!#export function normalizeMessage(message) {^_.+-]+\/[a-z0-9!#export function normalizeMessage(message) {^_.+-]+$/i.test(part.mimeType)
          ? part.mimeType.toLowerCase() : 'Unknown type';
        items.push({
          name: safeAttachmentLabel(part.filename),
          mediaType,
          size: Number.isSafeInteger(size) && size >= 0 ? size : null
        });
      } else truncated = true;
      // Attached submessages are not recursively interpreted as message text.
      continue;
    }
    const children = Array.isArray(part.parts) ? part.parts : [];
    if (visited + pending.length + children.length > MAX_MIME_NODES
      || (depth >= MAX_MIME_DEPTH && children.length)) {
      throw new Error('Message MIME structure exceeds this alpha\'s viewing limit.');
    }
    for (let i = children.length - 1; i >= 0; i--) {
      pending.push({ part: children[i], depth: depth + 1 });
    }
  }
  return { items, truncated };
}

export function normalizeMessage(message) {
  if (!message || typeof message !== 'object'
    || typeof message.id !== 'string' || !message.id.trim() || message.id.length > 256) {
    throw new Error('Provider returned invalid message metadata. Retry this mailbox.');
  }
  const headers = Array.isArray(message.payload?.headers) ? message.payload.headers : [];
  const attachmentInfo = extractAttachmentSummaries(message.payload);
  const safeHeaders = summarizeMessageHeaders(headers);
  const displayHeader = (key) => safeHeaders.items.find((item) =>
    item.name.toLowerCase() === key.toLowerCase())?.value || '';
  return {
    headers: safeHeaders.items,
    headersTruncated: safeHeaders.truncated,
    attachments: attachmentInfo.items,
    attachmentsTruncated: attachmentInfo.truncated,
    id: message.id,
    threadId: typeof message.threadId === 'string' ? message.threadId.slice(0, 256) : '',
    labels: Array.isArray(message.labelIds)
      ? message.labelIds.filter((label) => typeof label === 'string' && label.length <= 64).slice(0, 128)
      : [],
    from: displayHeader('From') || '(Unknown sender)',
    subject: displayHeader('Subject') || '(No subject)',
    date: displayHeader('Date'),
    snippet: typeof message.snippet === 'string' ? message.snippet.slice(0, 2048) : '',
    body: extractPlainText(message.payload)
  };
}

export async function getProfile({ signal } = {}) {
  return api('/profile', { signal });
}

// Retry transient provider failures briefly. Abort removes the scheduled retry promptly.
function retryDelay(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Request cancelled', 'AbortError')); return; }
    const timer = setTimeout(() => { signal?.removeEventListener('abort', cancel); resolve(); }, milliseconds);
    function cancel() {
      clearTimeout(timer);
      reject(new DOMException('Request cancelled', 'AbortError'));
    }
    signal?.addEventListener('abort', cancel, { once: true });
  });
}

async function fetchMetadata(id, signal) {
  const path = '/messages/' + encodeURIComponent(id)
    + '?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date';
  const retryable = new Set([429, 500, 502, 503, 504]);
  for (let attempt = 0; ; attempt++) {
    try { return await api(path, { signal }); }
    catch (error) {
      if (signal?.aborted) throw new DOMException('Request cancelled', 'AbortError');
      if (attempt >= 2 || !retryable.has(error.status)) throw error;
      await retryDelay([200, 600][attempt], signal);
    }
  }
}

// Pagination is transactional: never return or advance an incomplete metadata page.
export async function listMessages(view, query = '', pageToken = '', { signal } = {}) {
  const params = new URLSearchParams({ maxResults: String(PAGE_SIZE) });
  if (view && view !== 'ALL') params.set('labelIds', view);
  if (query.trim()) params.set('q', query.trim());
  if (pageToken) params.set('pageToken', pageToken);
  const result = await api('/messages?' + params.toString(), { signal });
  const ids = result.messages || [];
  const messages = [];
  let failedCount = 0;
  // Five concurrent metadata fetches per page keeps Gmail quota and browser load bounded.
  for (let i = 0; i < ids.length; i += 5) {
    if (signal?.aborted) throw new DOMException('Request cancelled', 'AbortError');
    const batch = await Promise.allSettled(ids.slice(i, i + 5).map((item) =>
      fetchMetadata(item.id, signal)
    ));
    for (const entry of batch) {
      if (entry.status === 'fulfilled') messages.push(normalizeMessage(entry.value));
      else {
        // Expired or denied authorization is not an ordinary transient preview error.
        if ([401, 403].includes(entry.reason?.status)) throw entry.reason;
        if (signal?.aborted) throw new DOMException('Request cancelled', 'AbortError');
        failedCount++;
      }
    }
  }
  // Return nothing on a partial failure: the UI keeps the previous page cursor.
  if (failedCount) throw new Error('Unable to load ' + failedCount
    + ' message previews. Retry the same page; no messages were skipped.');
  return { messages, nextPageToken: result.nextPageToken || '', failedCount: 0 };
}

export async function getMessage(id, { signal } = {}) {
  const message = await api('/messages/' + encodeURIComponent(id) + '?format=full', { signal });
  return normalizeMessage(message);
}

export async function modifyMessage(id, { addLabelIds = [], removeLabelIds = [] }) {
  return api('/messages/' + encodeURIComponent(id) + '/modify', {
    method: 'POST', body: { addLabelIds, removeLabelIds }, capability: 'modify'
  });
}

function bytesToBinary(bytes) {
  const chunks = [];
  for (let i = 0; i < bytes.length; i += 8192) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
  }
  return chunks.join('');
}

export function base64UrlEncode(text) {
  return btoa(bytesToBinary(new TextEncoder().encode(text)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function recipients(value) {
  if (typeof value !== 'string' || /[\x00-\x1f\x7f]/.test(value)) {
    throw new Error('Recipients must contain only email addresses.');
  }
  const values = value.split(',').map((item) => item.trim()).filter(Boolean);
  // The first milestone deliberately supports simple ASCII mailboxes only.
  const simpleAddress = /^[A-Za-z0-9.!#$%&'*+/=?^_\`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
  if (!values.length || values.length > 100 || !values.every((item) => simpleAddress.test(item))) {
    throw new Error('Enter up to 100 valid comma-separated ASCII email addresses.');
  }
  return values.join(', ');
}

function encodeSubject(value) {
  if (typeof value !== 'string' || !value.trim() || /[\x00-\x1f\x7f]/.test(value)) {
    throw new Error('Subject must be a non-empty line without control characters.');
  }
  // RFC 2047 encoded-words: limit each encoded chunk to 42 UTF-8 bytes, never split a character.
  const words = [];
  let buffer = [];
  for (const char of value.trim()) {
    const bytes = [...new TextEncoder().encode(char)];
    if (buffer.length + bytes.length > 42) {
      words.push('=?UTF-8?B?' + btoa(bytesToBinary(Uint8Array.from(buffer))) + '?=');
      buffer = [];
    }
    buffer.push(...bytes);
  }
  if (buffer.length) words.push('=?UTF-8?B?' + btoa(bytesToBinary(Uint8Array.from(buffer))) + '?=');
  return words.join('\r\n ');
}

export function buildRawMessage({ to, subject, body, reply = null }) {
  const safeTo = recipients(to);
  const safeSubject = encodeSubject(subject);
  const replyMetadata = reply ? validateReplyContext(reply, subject, to) : null;
  if (typeof body !== 'string' || !body.trim()) throw new Error('Message body is required.');
  const normalizedBody = body.replace(/\r\n|\r|\n/g, '\r\n');
  const bodyBytes = new TextEncoder().encode(normalizedBody);
  if (bodyBytes.length > MAX_BODY_BYTES) throw new Error('This alpha supports messages up to 1 MiB.');
  const binary = btoa(bytesToBinary(bodyBytes));
  const base64Body = binary.match(/.{1,76}/g)?.join('\r\n') || '';
  const mime = [
    'To: ' + safeTo,
    'Subject: ' + safeSubject,
    ...(replyMetadata ? [
      'In-Reply-To: ' + replyMetadata.inReplyTo,
      'References: ' + replyMetadata.references.join(' ')
    ] : []),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body
  ].join('\r\n');
  return base64UrlEncode(mime);
}

export async function sendMessage(input) {
  // Validate before any network request. Gmail accepted/submitted is not final delivery.
  const raw = buildRawMessage(input);
  const replyMetadata = input.reply
    ? validateReplyContext(input.reply, input.subject, input.to) : null;
  const outbound = replyMetadata
    ? { raw, threadId: replyMetadata.threadId } : { raw };
  let receipt;
  try {
    receipt = await api('/messages/send', {
      method: 'POST', body: outbound, capability: 'send'
    });
  } catch (error) {
    // Explicit auth failures are not ambiguous delivery receipts.
    if ([401, 403].includes(error.status) || /^(Your Google session expired|Additional Gmail permission|Unsupported Gmail capability)/.test(error.message)) {
      throw error;
    }
    // A lost response after submission may follow a successfully accepted send.
    // There is no automatic retry: that could duplicate mail.
    throw new Error('Gmail submission could not be confirmed. Check Sent before retrying to avoid duplicates.');
  }
  if (!receipt || typeof receipt.id !== 'string' || !receipt.id.trim() || receipt.id.length > 256) {
    throw new Error('Gmail did not confirm a message ID. Check Sent before retrying to avoid duplicates.');
  }
  if (replyMetadata && receipt.threadId !== replyMetadata.threadId) {
    // The provider may already have accepted this message into a different thread.
    // Never retry an ambiguous submission automatically.
    throw new Error('Gmail returned an unexpected reply thread. Check Sent before retrying to avoid duplicates.');
  }
  return { id: receipt.id, threadId: receipt.threadId || null, status: 'accepted_by_provider' };
}
