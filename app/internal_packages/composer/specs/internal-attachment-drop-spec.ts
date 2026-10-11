import os from 'os';
import path from 'path';
import { buildAttachmentDragPayload } from '../../../src/components/attachment-drag-payload';
import { internalAttachmentPathFromDrop } from '../lib/internal-attachment-drop';

describe('Composer internal attachment dragging', () => {
  const filePath = path.join(os.tmpdir(), 'attachment 100% #complete.pdf');
  const name = path.basename(filePath);

  it('accepts the exact DownloadURL format produced by AttachmentItem', () => {
    const payload = buildAttachmentDragPayload('application/pdf', filePath);
    expect(payload).toEqual('application/pdf:' + name + ':file://' + filePath);
    expect(internalAttachmentPathFromDrop(payload)).toEqual(filePath);
  });

  it('preserves raw native paths when content type is absent', () => {
    const payload = buildAttachmentDragPayload(undefined, filePath);
    expect(internalAttachmentPathFromDrop(payload)).toEqual(filePath);
  });

  it('rejects mismatched advertised basenames and relative paths', () => {
    expect(internalAttachmentPathFromDrop('application/pdf:fake.pdf:file://' + filePath)).toBe(
      null
    );
    expect(internalAttachmentPathFromDrop('application/pdf:relative.pdf:file://relative.pdf')).toBe(
      null
    );
  });

  it('rejects malformed envelopes and control characters', () => {
    expect(internalAttachmentPathFromDrop('file://' + filePath)).toBe(null);
    expect(
      internalAttachmentPathFromDrop('application/pdf:' + name + ':file://' + filePath + '\n')
    ).toBe(null);
    expect(internalAttachmentPathFromDrop('https://example.invalid/' + name)).toBe(null);
  });
});
