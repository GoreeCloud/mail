/**
 * Guest sign-in pages are untrusted. Only the dedicated new-window event may
 * request an external link, and only with an absolute HTTP(S) URL.
 */
export function safeWebviewExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value || Array.from(value).some((c) => {
    const code = c.charCodeAt(0);
    return code <= 32 || code === 127;
  })) {
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
