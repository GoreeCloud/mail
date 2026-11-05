import { getToken } from './auth.js';

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
  if (response.status === 401) throw new Error('Google session expired. Please reconnect.');
  if (!response.ok) {
    const error = new Error('Gmail request failed (HTTP ' + response.status + ').');
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? {} : response.json();
}

function headerValue(headers, key) {
  return (headers || []).find((item) => item.name?.toLowerCase() === key.toLowerCase())?.value || '';
}

// Gmail uses base64url for MIME payloads. Never pass decoded HTML to the DOM.
export function decodeB64Url(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]*={0,2}$/.test(value)) return '';
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

export function extractPlainText(payload) {
  if (!payload || payload.filename || payload.body?.attachmentId) return '';
  if ((payload.headers || []).some((header) =>
    header.name?.toLowerCase() === 'content-disposition' && /^attachment\b/i.test(header.value?.trim() || '')
  )) return '';
  if (payload.mimeType?.toLowerCase() === 'text/plain' && payload.body?.data) {
    return decodeB64Url(payload.body.data);
  }
  for (const part of payload.parts || []) {
    const text = extractPlainText(part);
    if (text) return text;
  }
  return '';
}

export function normalizeMessage(message) {
  const headers = message.payload?.headers || [];
  return {
    id: message.id,
    threadId: message.threadId,
    labels: message.labelIds || [],
    from: headerValue(headers, 'From') || '(Unknown sender)',
    subject: headerValue(headers, 'Subject') || '(No subject)',
    date: headerValue(headers, 'Date'),
    snippet: message.snippet || '',
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

export function buildRawMessage({ to, subject, body }) {
  const safeTo = recipients(to);
  const safeSubject = encodeSubject(subject);
  if (typeof body !== 'string' || !body.trim()) throw new Error('Message body is required.');
  const normalizedBody = body.replace(/\r\n|\r|\n/g, '\r\n');
  const bodyBytes = new TextEncoder().encode(normalizedBody);
  if (bodyBytes.length > MAX_BODY_BYTES) throw new Error('This alpha supports messages up to 1 MiB.');
  const binary = btoa(bytesToBinary(bodyBytes));
  const base64Body = binary.match(/.{1,76}/g)?.join('\r\n') || '';
  const mime = [
    'To: ' + safeTo,
    'Subject: ' + safeSubject,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body
  ].join('\r\n');
  return base64UrlEncode(mime);
}

export async function sendMessage(input) {
  return api('/messages/send', { method: 'POST', body: { raw: buildRawMessage(input) }, capability: 'send' });
}
