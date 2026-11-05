// OAuth access tokens are deliberately kept in JS memory, never persisted or logged.
let liveToken = null;
let expiresAt = 0;
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

export async function connectGoogle(clientId) {
  if (!/^[a-zA-Z0-9.-]+\.apps\.googleusercontent\.com$/.test(clientId)) {
    throw new Error('Enter a valid Google OAuth Web client ID');
  }
  await loadGis();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send',
      callback: (response) => {
        if (!response || response.error || !response.access_token) {
          reject(new Error('Google access was not granted'));
          return;
        }
        liveToken = response.access_token;
        expiresAt = Date.now() + (Number(response.expires_in || 3600) - 60) * 1000;
        resolve();
      },
      error_callback: () => reject(new Error('Google sign-in was cancelled or blocked'))
    });
    client.requestAccessToken({ prompt: 'consent' });
  });
}

export function getToken() {
  if (!liveToken || Date.now() >= expiresAt) {
    liveToken = null;
    throw new Error('Your Google session expired. Reconnect to continue.');
  }
  return liveToken;
}
export function connected() { return Boolean(liveToken && Date.now() < expiresAt); }
export function disconnect() { liveToken = null; expiresAt = 0; }
