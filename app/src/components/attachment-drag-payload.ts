import path from 'path';

/**
 * The exact Chromium DownloadURL envelope used when dragging an existing
 * attachment. The receiving composer must preserve native path characters
 * and validate the basename before using the attached file.
 */
export function buildAttachmentDragPayload(contentType: string | undefined, filePath: string) {
  return `${contentType}:${path.basename(filePath)}:file://${filePath}`;
}
