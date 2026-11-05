import { getToken } from './auth.js';
const BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

async function api(path, init = {}) {
  const response = await fetch(BASE + path, {
    method: init.method || 'GET',
    headers: { Authorization: 'Bearer ' + getToken(), ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
    credentials: 'omit',
    redirect: 'error'
  });
  if (response.status === 401) throw new Error('Google session expired. Please reconnect.');
  if (!response.ok) throw new Error('Gmail request failed (HTTP ' + response.status + ').');
  return response.status === 204 ? {} : response.json();
}
function headerValue(headers, key) {
  return (headers || []).find((item) => item.name.toLowerCase() === key.toLowerCase())?.value || '';
}
export function decodeB64Url(value) {
  if (!value || !/^[A-Za-z0-9_-]*={0,2}$/.test(value)) return '';
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}
export function extractPlainText(payload) {
  if (!payload) return '';
  if (payload.mimeType?.toLowerCase() === 'text/plain' && payload.body?.data) return decodeB64Url(payload.body.data);
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
export async function getProfile() {
  return api('/profile');
}
export async function listMessages(view, query = '') {
  const params = new URLSearchParams({ maxResults: '30' });
  if (view && view !== 'ALL') params.set('labelIds', view);
  if (query.trim()) params.set('q', query.trim());
  const result = await api('/messages?' + params.toString());
  const ids = result.messages || [];
  // Bound concurrency to avoid hundreds of simultaneous requests or quota spikes.
  const messages = [];
  for (let i = 0; i < ids.length; i += 6) {
    const batch = await Promise.allSettled(ids.slice(i, i + 6).map((item) =>
      api('/messages/' + encodeURIComponent(item.id) + '?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date')
    ));
    for (const entry of batch) if (entry.status === 'fulfilled') messages.push(normalizeMessage(entry.value));
  }
  return messages;
}
export async function getMessage(id) {
  const message = await api('/messages/' + encodeURIComponent(id) + '?format=full');
  return normalizeMessage(message);
}
export async function modifyMessage(id, { addLabelIds = [], removeLabelIds = [] }) {
  return api('/messages/' + encodeURIComponent(id) + '/modify', { method: 'POST', body: { addLabelIds, removeLabelIds } });
}
export function base64UrlEncode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function recipients(value) {
  if (!value || /[\r\n]/.test(value)) throw new Error('Recipients may not contain line breaks.');
  const values = value.split(',').map((item) => item.trim()).filter(Boolean);
  if (values.length === 0 || !values.every((item) => /^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(item))) {
    throw new Error('Enter valid comma-separated recipient addresses.');
  }
  return values.join(', ');
}
export function buildRawMessage({ to, subject, body }) {
  const safeTo = recipients(to);
  if (!subject?.trim() || /[\r\n]/.test(subject)) throw new Error('Subject must be a single non-empty line.');
  if (!body?.trim()) throw new Error('Message body is required.');
  const encodedSubject = base64UrlEncode(subject.trim()).replace(/-/g, '+').replace(/_/g, '/');
  // RFC 2047 uses ordinary base64 with padding, not base64url.
  const subjectBase64 = btoa(String.fromCharCode(...new TextEncoder().encode(subject.trim())));
  const normalizedBody = body.replace(/\r?\n/g, '\r\n');
  const bodyBytes = new TextEncoder().encode(normalizedBody);
  let binary = '';
  for (const byte of bodyBytes) binary += String.fromCharCode(byte);
  const base64Body = btoa(binary).replace(/.{1,76}/g, '$&\r\n').trimEnd();
  const mime = [
    'To: ' + safeTo,
    'Subject: =?UTF-8?B?' + subjectBase64 + '?=',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body
  ].join('\r\n');
  return base64UrlEncode(mime);
}
export async function sendMessage(input) {
  const raw = buildRawMessage(input);
  return api('/messages/send', { method: 'POST', body: { raw } });
}
