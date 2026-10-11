/**
 * Guest sign-in pages are untrusted. Only the dedicated new-window event may
 * request an external link, and only with an absolute HTTP(S) URL.
 */
export function safeWebviewExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value || /[\u0000-\u0020\u007f]/.test(value)) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (
      (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password
    ) {
      return null;
    }
    return parsed.href;
  } catch (err) {
    return null;
  }
}
