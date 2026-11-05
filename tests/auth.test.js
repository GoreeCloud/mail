import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SCOPES, connectGoogle, requestCapability, getToken,
  connected, hasCapability, disconnect
} from '../src/auth.js';

const originalWindow = globalThis.window;

function installMock(handler) {
  const requests = [];
  globalThis.window = {
    google: { accounts: { oauth2: {
      initTokenClient(config) {
        return {
          requestAccessToken(options) {
            requests.push({ scope: config.scope, options });
            handler(config, requests.length);
          }
        };
      }
    } } }
  };
  return requests;
}
function grant(config, scopes = config.scope) {
  config.callback({
    access_token: 'TEST-TOKEN-ONLY',
    expires_in: 3600,
    scope: scopes
  });
}
function cleanup() {
  disconnect();
  globalThis.window = originalWindow;
}

test('initial Gmail connection grants only read access', async () => {
  const requests = installMock((config) => grant(config));
  try {
    await connectGoogle('1234.apps.googleusercontent.com');
    assert.deepEqual(requests.map((item) => item.scope), [SCOPES.read]);
    assert.equal(connected(), true);
    assert.equal(hasCapability('read'), true);
    assert.equal(hasCapability('modify'), false);
    assert.equal(hasCapability('send'), false);
    assert.equal(getToken('read'), 'TEST-TOKEN-ONLY');
    assert.throws(() => getToken('send'), /permission/i);
  } finally { cleanup(); }
});

test('send and modify are requested incrementally, not during initial connect', async () => {
  const requests = installMock((config) => grant(config));
  try {
    await connectGoogle('1234.apps.googleusercontent.com');
    await requestCapability('send');
    assert.equal(hasCapability('send'), true);
    assert.equal(hasCapability('modify'), false);
    assert.ok(requests[1].scope.includes(SCOPES.read));
    assert.ok(requests[1].scope.includes(SCOPES.send));
    assert.ok(!requests[1].scope.includes(SCOPES.modify));
    await requestCapability('modify');
    assert.equal(hasCapability('modify'), true);
    assert.equal(hasCapability('send'), false);
    assert.ok(!requests[2].scope.includes(SCOPES.send));
    assert.equal(requests.length, 3);
  } finally { cleanup(); }
});

test('granular consent denial preserves existing read-only access', async () => {
  let count = 0;
  installMock((config) => {
    count++;
    grant(config, count === 1 ? config.scope : SCOPES.read);
  });
  try {
    await connectGoogle('1234.apps.googleusercontent.com');
    await assert.rejects(requestCapability('send'), /did not grant/);
    assert.equal(connected(), true);
    assert.equal(hasCapability('send'), false);
    assert.equal(getToken('read'), 'TEST-TOKEN-ONLY');
  } finally { cleanup(); }
});

test('disconnect makes a late popup callback unable to resurrect a token', async () => {
  let callback;
  installMock((config) => { callback = config.callback; });
  try {
    const pending = connectGoogle('1234.apps.googleusercontent.com');
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(typeof callback, 'function');
    disconnect();
    callback({ access_token: 'LATE-TOKEN', expires_in: 3600, scope: SCOPES.read });
    await assert.rejects(pending, /cancelled/i);
    assert.equal(connected(), false);
    assert.throws(() => getToken(), /expired/i);
  } finally { cleanup(); }
});

test('capability names are allowlisted', async () => {
  installMock((config) => grant(config));
  try {
    await assert.rejects(connectGoogle('not-an-oauth-client'), /valid Google OAuth/);
    await connectGoogle('1234.apps.googleusercontent.com');
    await assert.rejects(requestCapability('admin'), /Unsupported/);
    assert.equal(hasCapability('admin'), false);
    assert.throws(() => getToken('admin'), /Unsupported/);
  } finally { cleanup(); }
});
