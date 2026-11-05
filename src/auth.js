// Gmail OAuth tokens are kept only in memory. No tokens, mail or refresh credentials
// are persisted or sent to GoreeCloud infrastructure.
export const SCOPES = Object.freeze({
  read: 'https://www.googleapis.com/auth/gmail.readonly',
  modify: 'https://www.googleapis.com/auth/gmail.modify',
  send: 'https://www.googleapis.com/auth/gmail.send'
});

let token = null;
let expiresAt = 0;
let grantedScopes = new Set();
let activeClientId = '';
let generation = 0;
let loading = null;

function loadGis() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser required'));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => window.google?.accounts?.oauth2
        ? resolve() : reject(new Error('Google sign-in did not initialize'));
      script.onerror = () => reject(new Error('Cannot load Google sign-in'));
      document.head.append(script);
    }).catch((error) => { loading = null; throw error; });
  }
  return loading;
}

function validClientId(clientId) {
  return typeof clientId === 'string'
    && /^[a-zA-Z0-9.-]+\.apps\.googleusercontent\.com$/.test(clientId);
}

function isGranted(capability) {
  if (capability === 'read') return grantedScopes.has(SCOPES.read) || grantedScopes.has(SCOPES.modify);
  return grantedScopes.has(SCOPES[capability]);
}

export function connected() {
  return Boolean(token && Date.now() < expiresAt && isGranted('read'));
}

export function hasCapability(capability) {
  if (!Object.hasOwn(SCOPES, capability)) return false;
  return connected() && isGranted(capability);
}

export function getToken(capability = 'read') {
  if (!Object.hasOwn(SCOPES, capability)) throw new Error('Unsupported Gmail capability.');
  if (!token || Date.now() >= expiresAt) {
    token = null;
    expiresAt = 0;
    grantedScopes.clear();
    throw new Error('Your Google session expired. Reconnect to continue.');
  }
  if (!isGranted(capability)) {
    throw new Error('Additional Gmail permission is required before this action.');
  }
  return token;
}

async function authorize(clientId, capability) {
  if (!validClientId(clientId)) throw new Error('Enter a valid Google OAuth Web client ID.');
  if (!Object.hasOwn(SCOPES, capability)) throw new Error('Unsupported Gmail capability.');
  const currentGeneration = generation;
  await loadGis();
  if (currentGeneration !== generation) throw new Error('Connection was cancelled.');

  const neededScopes = capability === 'read'
    ? [SCOPES.read]
    : [SCOPES.read, SCOPES[capability]];

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: neededScopes.join(' '),
      callback: (response) => {
        if (currentGeneration !== generation) {
          reject(new Error('Connection was cancelled.'));
          return;
        }
        if (!response || response.error || !response.access_token) {
          reject(new Error('Google access was not granted.'));
          return;
        }
        const actual = new Set((response.scope || '').split(/\s+/).filter(Boolean));
        // Granular consent may grant fewer scopes than requested. Never silently elevate.
        if (!neededScopes.every((scope) => actual.has(scope))) {
          reject(new Error('Google did not grant the requested mail permissions.'));
          return;
        }
        const ttl = Number(response.expires_in);
        if (!Number.isFinite(ttl) || ttl <= 60) {
          reject(new Error('Google returned an invalid or too-short session.'));
          return;
        }
        token = response.access_token;
        grantedScopes = actual;
        expiresAt = Date.now() + (ttl - 60) * 1000;
        activeClientId = clientId;
        resolve();
      },
      error_callback: () => reject(new Error('Google sign-in was cancelled or blocked.'))
    });
    client.requestAccessToken({ prompt: 'consent' });
  });
}

export async function connectGoogle(clientId) {
  // Reset a previous connection before asking to connect a new account.
  disconnect();
  return authorize(clientId, 'read');
}

export async function requestCapability(capability) {
  if (capability === 'read') {
    getToken('read');
    return;
  }
  if (!Object.hasOwn(SCOPES, capability)) throw new Error('Unsupported Gmail capability.');
  if (!connected()) throw new Error('Connect your Gmail account first.');
  if (hasCapability(capability)) return;
  const id = activeClientId;
  return authorize(id, capability);
}

export function disconnect() {
  // Local disconnect is not the same as Google account OAuth grant revocation.
  generation++;
  token = null;
  expiresAt = 0;
  grantedScopes.clear();
  activeClientId = '';
}
