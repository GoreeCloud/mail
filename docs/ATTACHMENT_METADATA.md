# GoreeCloud Mail — Read-only Attachment Summaries (Alpha)

**Status:** Implemented in the experimental Gmail API web client. This milestone displays metadata only, not attachment contents or downloads. It does not implement file sending, file management, malware scanning, or a provider-independent attachment adapter.

## User-visible behavior

When a full message is opened, the reader can show a separate **Attachments** section below its safely rendered plain-text message body. Each entry shows a limited filename (or *Unnamed attachment*), a recognized media type (or *Unknown type*), and a provider-reported size (or *Size unavailable*). No download, open, preview, save, print, execute, or external navigation controls are provided.

GoreeCloud Mail uses the existing authorized Gmail `format=full` message response. It does not fetch `/attachments/{id}`, and the display model excludes raw attachment IDs. The reader clears these summaries on disconnect or when changing messages. Filename and type strings are untrusted provider data; the DOM receives them through `textContent`, not HTML. Control and bidirectional formatting characters are neutralized in displayed filenames.

## Defensive limitations

- At most **24 visible attachment summaries** per message. If more are found, the reader displays a truncation notice.
- MIME traversal uses the existing **256-node and 32-level limits**; messages above the limits can be rejected with a visible error.
- Filenames are limited to the first **120 Unicode code points** after safety normalization.
- File size is displayed only when the provider supplies a nonnegative safe integer.
- The scanner recognizes Gmail MIME part `filename`, an attachment disposition, or an attachment ID. Some unusual MIME constructions may not be listed. Inline content with attachment metadata can appear in the summary.
- Attachment content is never obtained or scanned. **Listing a file does not mean it is safe to open.**
- Nested attached messages are not recursively unpacked or treated as the enclosing message's body.

## Verified

- Unit tests for malicious filenames, forbidden control/bidi characters, metadata normalization, truncated lists, nested attachments, and MIME complexity limits.
- Simulated Gmail UI test confirms a summary is visible in the reader, with inert filename text and reported size.
- Existing MIME, OAuth, pagination, encrypted draft, account-isolation and interface checks continue to run.

Before enabling download, preview, or upload: use an audited MIME/attachment pipeline, explicit user intent, strict maximum sizes, safe file names and temporary file controls, OS-backed storage where possible, independent malware scanning boundaries, accessibility checks, and live-provider interoperability tests. There is no browser-connected Gmail acceptance or independent security audit for this milestone.

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md), [ARCHITECTURE.md](ARCHITECTURE.md) and [SECURITY.md](SECURITY.md).
