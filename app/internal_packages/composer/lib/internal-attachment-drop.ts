import path from 'path';

/**
 * Parse the custom attachment drag format emitted by AttachmentItem:
 * contentType:basename:file://nativeAbsolutePath.
 * The native path is not URL-escaped, so do not decode it as a URL.
 */
export function internalAttachmentPathFromDrop(value: string): string | null {
  if (!value || /[\r\n\0]/.test(value)) return null;

  const marker = ':file://';
  const markerAt = value.indexOf(marker);
  if (markerAt < 1) return null;

  const metadata = value.slice(0, markerAt);
  const nameSeparator = metadata.indexOf(':');
  if (nameSeparator < 1) return null;

  const advertisedName = metadata.slice(nameSeparator + 1);
  const nativePath = value.slice(markerAt + marker.length);
  if (!advertisedName || !path.isAbsolute(nativePath)) return null;
  if (path.basename(nativePath) !== advertisedName) return null;

  return nativePath;
}
