import { fileURLToPath } from 'url';

/**
 * Resolve one local file URI from a drag payload without trusting arbitrary
 * text, remote file shares, query strings, or malformed percent escapes.
 */
export function localFilePathFromDropUri(value: string): string | null {
  if (!value || /[\r\n\0]/.test(value)) {
    return null;
  }

  try {
    // Some Electron URL runtimes do not normalize file://localhost consistently.
    // Map only this explicitly local authority to the canonical file:/// form.
    const uri = new URL(value.replace(/^file:\/\/localhost(?=\/)/i, 'file://'));
    if (
      uri.protocol !== 'file:' ||
      (uri.hostname !== '' && uri.hostname !== 'localhost') ||
      uri.search ||
      uri.hash ||
      uri.username ||
      uri.password
    ) {
      return null;
    }

    const filePath = fileURLToPath(uri);
    return filePath.includes('\0') ? null : filePath;
  } catch (err) {
    return null;
  }
}

/**
 * The text/uri-list format permits comment lines. Follow the first actual
 * URI only; never turn a later local link into an attachment after a rejected
 * first URI.
 */
export function localFilePathFromUriList(value: string): string | null {
  if (!value) {
    return null;
  }
  const firstUri = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith('#'));

  return firstUri ? localFilePathFromDropUri(firstUri) : null;
}
