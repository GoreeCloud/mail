import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  hasEncryptedDraft, saveEncryptedDraft, restoreEncryptedDraft, deleteEncryptedDraft
} from '../src/drafts.js';

function fixture() {
  const items = new Map();
  const storage = {
    getItem: (key) => items.has(key) ? items.get(key) : null,
    setItem: (key, value) => items.set(key, value),
    removeItem: (key) => items.delete(key)
  };
  const options = { cryptography: webcrypto, storage };
  const draft = {
    account: 'Person@Example.com',
    to: 'recipient@example.com',
    subject: 'Important subject',
    body: 'Sensitive body 🚀\nSecond line'
  };
  return { items, options, draft };
}

test('encrypted draft round trip preserves Unicode without storing readable content', async () => {
  const { items, options, draft } = fixture();
  assert.equal(hasEncryptedDraft(options), false);
  await saveEncryptedDraft(draft, 'secure passphrase 123', options);
  assert.equal(hasEncryptedDraft(options), true);
  const serialized = [...items.values()][0];
  assert.ok(!serialized.includes(draft.subject));
  assert.ok(!serialized.includes(draft.body));
  assert.ok(!serialized.includes(draft.account));
  assert.deepEqual(await restoreEncryptedDraft('person@example.com', 'secure passphrase 123', options), {
    to: draft.to, subject: draft.subject, body: draft.body
  });
});

test('wrong draft passphrase leaves ciphertext unchanged', async () => {
  const { items, options, draft } = fixture();
  await saveEncryptedDraft(draft, 'correct passphrase', options);
  const saved = [...items.values()][0];
  await assert.rejects(restoreEncryptedDraft(draft.account, 'incorrect passphrase', options), /Unable to unlock/);
  assert.equal([...items.values()][0], saved);
});

test('tampering with ciphertext makes the authenticated decryption fail', async () => {
  const { items, options, draft } = fixture();
  await saveEncryptedDraft(draft, 'secure passphrase 123', options);
  const [key, serialized] = [...items.entries()][0];
  const envelope = JSON.parse(serialized);
  const old = envelope.payload;
  envelope.payload = (old[0] === 'A' ? 'B' : 'A') + old.slice(1);
  items.set(key, JSON.stringify(envelope));
  await assert.rejects(restoreEncryptedDraft(draft.account, 'secure passphrase 123', options), /Unable to unlock/);
});

test('encrypted draft refuses account switching after correct decryption', async () => {
  const { options, draft } = fixture();
  await saveEncryptedDraft(draft, 'secure passphrase 123', options);
  await assert.rejects(
    restoreEncryptedDraft('other@example.com', 'secure passphrase 123', options),
    /another account/
  );
});

test('saving a second draft replaces the single local snapshot; deletion removes it', async () => {
  const { options, draft } = fixture();
  await saveEncryptedDraft(draft, 'secure passphrase 123', options);
  await saveEncryptedDraft({ ...draft, subject: 'Revised' }, 'different passphrase', options);
  assert.equal((await restoreEncryptedDraft(draft.account, 'different passphrase', options)).subject, 'Revised');
  await assert.rejects(restoreEncryptedDraft(draft.account, 'secure passphrase 123', options), /Unable to unlock/);
  deleteEncryptedDraft(options);
  assert.equal(hasEncryptedDraft(options), false);
  await assert.rejects(restoreEncryptedDraft(draft.account, 'different passphrase', options), /No encrypted draft/);
});

test('invalid input, unsupported crypto and oversize content fail closed', async () => {
  const { options, draft } = fixture();
  await assert.rejects(saveEncryptedDraft(draft, 'short', options), /between 12 and 1024/);
  await assert.rejects(saveEncryptedDraft({ ...draft, body: '', subject: '', to: '' }, 'secure passphrase 123', options), /Write some/);
  await assert.rejects(saveEncryptedDraft(draft, 'secure passphrase 123', { ...options, cryptography: {} }), /secure browser/);
  await assert.rejects(saveEncryptedDraft({ ...draft, body: 'x'.repeat(1024 * 1024 + 1) }, 'secure passphrase 123', options), /1 MiB/);
  assert.equal(hasEncryptedDraft(options), false);
});

test('malformed encrypted draft headers are rejected without overwriting', async () => {
  const { options, items, draft } = fixture();
  await saveEncryptedDraft(draft, 'secure passphrase 123', options);
  const [key, serialized] = [...items.entries()][0];
  const envelope = JSON.parse(serialized);
  envelope.iterations = 1;
  items.set(key, JSON.stringify(envelope));
  await assert.rejects(restoreEncryptedDraft(draft.account, 'secure passphrase 123', options), /format is not supported/);
});


test('cancelled save cannot persist ciphertext even after encryption completes', async () => {
  const { options, draft } = fixture();
  const controller = new AbortController();
  const cryptoWithAbort = {
    getRandomValues: (value) => webcrypto.getRandomValues(value),
    subtle: {
      importKey: (...args) => webcrypto.subtle.importKey(...args),
      deriveKey: (...args) => webcrypto.subtle.deriveKey(...args),
      encrypt: async (...args) => {
        const ciphertext = await webcrypto.subtle.encrypt(...args);
        controller.abort();
        return ciphertext;
      }
    }
  };
  await assert.rejects(
    saveEncryptedDraft(draft, 'secure passphrase 123', {
      ...options, cryptography: cryptoWithAbort, signal: controller.signal
    }),
    (error) => error.name === 'AbortError'
  );
  assert.equal(hasEncryptedDraft(options), false);
});

test('cancelled restore cannot repopulate data after decryption completes', async () => {
  const { options, draft } = fixture();
  await saveEncryptedDraft(draft, 'secure passphrase 123', options);
  const controller = new AbortController();
  const cryptoWithAbort = {
    getRandomValues: (value) => webcrypto.getRandomValues(value),
    subtle: {
      importKey: (...args) => webcrypto.subtle.importKey(...args),
      deriveKey: (...args) => webcrypto.subtle.deriveKey(...args),
      decrypt: async (...args) => {
        const cleartext = await webcrypto.subtle.decrypt(...args);
        controller.abort();
        return cleartext;
      }
    }
  };
  await assert.rejects(
    restoreEncryptedDraft(draft.account, 'secure passphrase 123', {
      ...options, cryptography: cryptoWithAbort, signal: controller.signal
    }),
    (error) => error.name === 'AbortError'
  );
  assert.equal(hasEncryptedDraft(options), true);
});
