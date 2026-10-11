import { safeWebviewExternalUrl } from '../src/components/webview-external-url';

describe('Sign-in guest external URL safety', () => {
  it('allows valid absolute HTTPS and HTTP links', () => {
    expect(safeWebviewExternalUrl('https://example.org/help')).toEqual(
      'https://example.org/help'
    );
    expect(safeWebviewExternalUrl('http://example.org/terms')).toEqual(
      'http://example.org/terms'
    );
  });

  it('rejects script, local file, application and non-URL requests', () => {
    expect(safeWebviewExternalUrl('javascript:alert(1)')).toBe(null);
    expect(safeWebviewExternalUrl('file:///etc/passwd')).toBe(null);
    expect(safeWebviewExternalUrl('mailspring://action')).toBe(null);
    expect(safeWebviewExternalUrl('//example.org/help')).toBe(null);
    expect(safeWebviewExternalUrl('')).toBe(null);
  });

  it('refuses credentials, control characters and non-string payloads', () => {
    expect(safeWebviewExternalUrl('https://user:password@example.org/')).toBe(null);
    expect(safeWebviewExternalUrl('https://example.org/\nother')).toBe(null);
    expect(safeWebviewExternalUrl(' https://example.org')).toBe(null);
    expect(safeWebviewExternalUrl('https://example.org/%0a')).toEqual(
      'https://example.org/%0a'
    );
    expect(safeWebviewExternalUrl(null)).toBe(null);
    expect(safeWebviewExternalUrl({ url: 'https://example.org' })).toBe(null);
  });
});
