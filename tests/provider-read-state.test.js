import assert from 'node:assert/strict';
import test from 'node:test';

import { MAIL_PROVIDER_CAPABILITY, validateMailProvider } from '../web/mail-provider.js';
import { DemoMailProvider } from '../web/providers/demo-provider.js';
import { GatewayMailProvider } from '../web/providers/gateway-mail-provider.js';

test('demo provider persists read and unread state in the current provider instance', async () => {
  const provider = validateMailProvider(new DemoMailProvider());
  const capabilities = await provider.capabilities();
  assert.equal(capabilities[MAIL_PROVIDER_CAPABILITY.READ_STATE], true);

  assert.equal((await provider.getMessage('welcome-1')).unread, true);
  assert.equal((await provider.listMailboxes()).find(({ id }) => id === 'inbox').unread, 1);

  await provider.setReadState('welcome-1', true);
  assert.equal((await provider.getMessage('welcome-1')).unread, false);
  assert.equal((await provider.listMailboxes()).find(({ id }) => id === 'inbox').unread, 0);

  await provider.setReadState('welcome-1', false);
  assert.equal((await provider.getMessage('welcome-1')).unread, true);
  assert.equal((await provider.listMailboxes()).find(({ id }) => id === 'inbox').unread, 1);
});

test('gateway provider maps read-state mutation to the account-scoped gateway path', async () => {
  const requests = [];
  const provider = new GatewayMailProvider({
    accountId: 'account/read state',
    gateway: {
      request(path, options = {}) {
        requests.push({ path, options });
        return Promise.resolve({ ok: true });
      },
    },
  });

  await provider.setReadState('message/1', false);
  assert.deepEqual(requests, [{
    path: '/accounts/account%2Fread%20state/messages/message%2F1/read-state',
    options: { method: 'PUT', body: { read: false } },
  }]);
});
