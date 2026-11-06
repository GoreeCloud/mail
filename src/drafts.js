import { validateReplyContext } from './reply.js';
// User-initiated encrypted local draft. No plaintext or passphrase is persisted.
// Alpha limitation: one draft per browser origin, stored in localStorage.
const STORAGE_KEY = 'goreecloud-mail:encrypted-draft:v1';
const VERSION = 1;
const PBKDF2_ITERATIONS = 310000;
const ASSOCIATED_DATA = 'GoreeCloud Mail local draft v1';
const MAX_PLAINTEXT_BYTES = 1024 * 1024; // Prevent UI hangs and excessive browser storage.
const MAX_ENVELOPE_BYTES = 2 * 1024 * 1024;

function ensureActive(options) {
  if (options.signal?.aborted) throw new DOMException('Encrypted draft operation cancelled.', 'AbortError');
}

function getDependencies(options = {}) {
  const cryptography = options.cryptography || globalThis.crypto;
  const storage = options.storage || globalThis.localStorage;
  if (!cryptography?.subtle || typeof cryptography.getRandomValues !== 'function') {
    throw new Error('Encrypted drafts require a secure browser context with Web Crypto.');
  }
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
    throw new Error('Local encrypted draft storage is unavailable in this browser.');
  }
  return { cryptography, storage };
}

function bytesToBase64(bytes) {
  let text = '';
  for (let i = 0; i < bytes.length; i += 8192) {
    text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(text);
}

function base64ToBytes(value, expectedLength = 0) {
  if (typeof value !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new Error('Encrypted draft data is invalid.');
  }
  if (value.length > MAX_ENVELOPE_BYTES * 2) {
    throw new Error('Encrypted draft exceeds the supported size.');
  }
  const binary = atob(value);
  if (expectedLength && binary.length !== expectedLength) {
    throw new Error('Encrypted draft data is invalid.');
  }
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function ensurePassphrase(value) {
  if (typeof value !== 'string' || value.length < 12 || value.length > 1024) {
    throw new Error('Use a draft passphrase between 12 and 1024 characters.');
  }
}
function normalizeAccount(account) {
  if (typeof account !== 'string' || !account.trim() || account.length > 320) {
    throw new Error('Connect to a verified email account before managing drafts.');
  }
  return account.trim().toLowerCase();
}
function ensureDraft(draft) {
  if (!draft || typeof draft !== 'object') throw new Error('Draft is missing.');
  for (const field of ['to', 'subject', 'body']) {
    if (typeof draft[field] !== 'string') throw new Error('Draft data is invalid.');
  }
  if (draft.reply != null) validateReplyContext(draft.reply, draft.subject);
  if (!draft.to.trim() && !draft.subject.trim() && !draft.body.trim()) {
    throw new Error('Write some email content before saving an encrypted draft.');
  }
}
async function deriveKey(passphrase, salt, cryptography) {
  const baseKey = await cryptography.subtle.importKey(
    'raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  return cryptography.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

export function hasEncryptedDraft(options = {}) {
  const { storage } = getDependencies(options);
  return storage.getItem(STORAGE_KEY) !== null;
}

export async function saveEncryptedDraft(draft, passphrase, options = {}) {
  const { storage, cryptography } = getDependencies(options);
  ensurePassphrase(passphrase);
  ensureDraft(draft);
  ensureActive(options);
  const account = normalizeAccount(draft.account);
  const text = JSON.stringify({
    account, to: draft.to, subject: draft.subject, body: draft.body,
    ...(draft.reply ? { reply: validateReplyContext(draft.reply, draft.subject) } : {})
  });
  const plaintext = new TextEncoder().encode(text);
  if (plaintext.length > MAX_PLAINTEXT_BYTES) {
    throw new Error('This alpha supports encrypted drafts up to 1 MiB.');
  }
  const salt = cryptography.getRandomValues(new Uint8Array(16));
  const iv = cryptography.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, cryptography);
  ensureActive(options);
  const ciphertext = new Uint8Array(await cryptography.subtle.encrypt({
    name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(ASSOCIATED_DATA)
  }, key, plaintext));
  ensureActive(options);
  const envelope = JSON.stringify({
    version: VERSION, kdf: 'PBKDF2-SHA256', iterations: PBKDF2_ITERATIONS,
    cipher: 'AES-256-GCM', salt: bytesToBase64(salt),
    iv: bytesToBase64(iv), payload: bytesToBase64(ciphertext)
  });
  if (envelope.length > MAX_ENVELOPE_BYTES) throw new Error('Encrypted draft exceeds the supported size.');
  // Never write ciphertext after the user cancelled or disconnected.
  ensureActive(options);
  // Storage assignment replaces the previous one-draft snapshot atomically.
  storage.setItem(STORAGE_KEY, envelope);
}

export async function restoreEncryptedDraft(expectedAccount, passphrase, options = {}) {
  const { storage, cryptography } = getDependencies(options);
  ensurePassphrase(passphrase);
  ensureActive(options);
  const account = normalizeAccount(expectedAccount);
  const serialized = storage.getItem(STORAGE_KEY);
  if (!serialized) throw new Error('No encrypted draft is saved in this browser.');
  if (serialized.length > MAX_ENVELOPE_BYTES) throw new Error('Encrypted draft exceeds the supported size.');
  let envelope;
  try { envelope = JSON.parse(serialized); }
  catch { throw new Error('Encrypted draft data is invalid.'); }
  if (!envelope || envelope.version !== VERSION || envelope.iterations !== PBKDF2_ITERATIONS
    || envelope.kdf !== 'PBKDF2-SHA256' || envelope.cipher !== 'AES-256-GCM') {
    throw new Error('Encrypted draft format is not supported.');
  }
  const salt = base64ToBytes(envelope.salt, 16);
  const iv = base64ToBytes(envelope.iv, 12);
  const ciphertext = base64ToBytes(envelope.payload);
  let data;
  try {
    const key = await deriveKey(passphrase, salt, cryptography);
    ensureActive(options);
    const decrypted = await cryptography.subtle.decrypt({
      name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(ASSOCIATED_DATA)
    }, key, ciphertext);
    ensureActive(options);
    data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(decrypted));
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    // Deliberately avoid distinguishing wrong passwords from authentication failures.
    throw new Error('Unable to unlock draft. Check the passphrase or encrypted data.');
  }
  ensureDraft(data);
  if (normalizeAccount(data.account) !== account) {
    throw new Error('This draft belongs to another account. Connect that account to restore it.');
  }
  ensureActive(options);
  return { to: data.to, subject: data.subject, body: data.body,
    ...(data.reply ? { reply: validateReplyContext(data.reply, data.subject) } : {}) };
}

export function deleteEncryptedDraft(options = {}) {
  const { storage } = getDependencies(options);
  storage.removeItem(STORAGE_KEY);
}
