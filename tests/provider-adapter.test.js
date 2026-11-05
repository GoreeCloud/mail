import test from 'node:test';
import assert from 'node:assert/strict';
import { defineMailAdapter, MAIL_ADAPTER_VERSION, MAIL_CAPABILITIES } from '../src/providers/contract.js';
import { gmailAdapter } from '../src/providers/gmail.js';
import { getProfile, listMessages, getMessage, modifyMessage, sendMessage } from '../src/gmail.js';
import { connectGoogle, connected, disconnect, requestCapability } from '../src/auth.js';

function basicConfig() {
  const capabilities = Object.fromEntries(MAIL_CAPABILITIES.map((key) => [key, false]));
  capabilities.read = true;
  return {
    id: 'readonly-test',
    displayName: 'Synthetic local test',
    transport: 'test-only',
    capabilities,
    methods: {
      connect() {}, connected() { return false; }, disconnect() {},
      getProfile() {}, listMessages() {}, getMessage() {}
    }
  };
}

test('Gmail is the only concrete v1 adapter, with explicit unsupported features', () => {
  assert.equal(gmailAdapter.id, 'gmail');
  assert.equal(gmailAdapter.adapterVersion, MAIL_ADAPTER_VERSION);
  assert.equal(gmailAdapter.clientOnly, true);
  assert.equal(gmailAdapter.transport, 'gmail-api');
  assert.equal(gmailAdapter.capabilities.read, true);
  assert.equal(gmailAdapter.capabilities.search, true);
  assert.equal(gmailAdapter.capabilities.attachmentMetadata, true);
  for (const feature of ['attachmentDownload', 'providerDrafts', 'scheduleSend', 'push', 'endToEndEncryption']) {
    assert.equal(gmailAdapter.capabilities[feature], false, feature + ' must remain disabled');
  }
  assert.equal(gmailAdapter.getProfile, getProfile);
  assert.equal(gmailAdapter.listMessages, listMessages);
  assert.equal(gmailAdapter.getMessage, getMessage);
  assert.equal(gmailAdapter.modifyMessage, modifyMessage);
  assert.equal(gmailAdapter.sendMessage, sendMessage);
  assert.equal(gmailAdapter.connect, connectGoogle);
  assert.equal(gmailAdapter.connected, connected);
  assert.equal(gmailAdapter.disconnect, disconnect);
  assert.equal(gmailAdapter.requestCapability, requestCapability);
  assert.equal(Object.isFrozen(gmailAdapter), true);
  assert.equal(Object.isFrozen(gmailAdapter.capabilities), true);
});

test('v1 adapter refuses unknown flags and unapproved methods', () => {
  assert.throws(() => defineMailAdapter({
    ...basicConfig(), capabilities: { ...basicConfig().capabilities, serverHosting: true }
  }), /Unknown mail capability/);
  assert.throws(() => defineMailAdapter({
    ...basicConfig(), methods: { ...basicConfig().methods, executeArbitraryCode() {} }
  }), /Unapproved mail adapter method/);
});

test('v1 adapter rejects incomplete or falsely advertised implementations', () => {
  assert.throws(() => defineMailAdapter({
    ...basicConfig(), capabilities: { ...basicConfig().capabilities, read: false }
  }), /requires read capability/);
  const incomplete = basicConfig();
  delete incomplete.methods.getMessage;
  assert.throws(() => defineMailAdapter(incomplete), /Missing required/);
  const unsupportedSend = basicConfig();
  unsupportedSend.capabilities.send = true;
  assert.throws(() => defineMailAdapter(unsupportedSend), /claims an operation/);
  const unsupportedModify = basicConfig();
  unsupportedModify.capabilities.modify = true;
  assert.throws(() => defineMailAdapter(unsupportedModify), /claims an operation/);
  const malformed = basicConfig();
  malformed.id = 'Bad ID';
  assert.throws(() => defineMailAdapter(malformed), /lowercase slug/);
});

test('synthetic read-only adapters can validate without granting mail mutations', () => {
  const adapter = defineMailAdapter(basicConfig());
  assert.equal(adapter.capabilities.read, true);
  assert.equal(adapter.capabilities.send, false);
  assert.equal(adapter.sendMessage, undefined);
  assert.equal(adapter.modifyMessage, undefined);
  assert.equal(adapter.connected(), false);
});
