# GoreeCloud Mail — Safe Plain-Text MIME Preview Boundary

**Status:** Implemented as a conservative security hardening for the experimental Gmail-only web reader. This is **not** a complete RFC MIME parser, a full message renderer, or an attachment download/preview feature.

## Display and traversal model

The reader accepts already-authorized Gmail `format=full` MIME metadata without making additional remote-content requests. It displays **one suitable `text/plain` body** as inert `textContent` and never parses message HTML.

- Only validated `multipart/*` containers are traversed to find the message's visible body. Non-multipart containers that misleadingly include child `parts` are not followed.
- An encapsulated `message/*` entity is **not** interpreted as the current message body. It is represented, if applicable, as an inert attachment summary.
- A part with a filename, attachment ID, explicit attachment disposition, unrecognized disposition, or named inline-disposition filename is excluded from automatic body display. Unknown dispositions follow the conservative attachment behavior described in RFC 2183.
- Duplicate Content-Disposition fields, malformed filename/attachment ID types, and RFC 2231-style `filename*` / `filename*0*` metadata are handled as attachment-like input rather than assumed safe inline text.
- Gmail `mimeType` values used for attachment metadata must match a bounded ASCII media-type token and subtype pair. Unsupported or malformed values display as **Unknown type**. A malformed original media-type validation expression has been replaced.
- Attached and encapsulated subtrees are not recursively interpreted as message bodies; the attachment section lists only sanitized, provider-reported metadata. It never includes raw attachment IDs or executes content.

The existing structural limits remain: 256 visited MIME nodes, 32 nesting levels, up to 4 MiB decoded plain-text content, a maximum of 24 attachment summaries and truncated filename display. Reader presentation still uses inert text rather than active HTML, images or links.

## Compatibility trade-offs

This is intentionally a **fail-closed alpha preview**, not general MIME interoperability. Some valid but unusual constructions—including message-level embedded MIME content, filename-qualified inline text, unconventional media type representations, and full multipart bodies spanning multiple independent plain-text sections—may be omitted or shown as an attachment summary. Only one suitable plain-text part is currently selected; RFC 2047/2231 decoding, MIME canonicalization, complete multipart semantics, attachment preview, and signed/encrypted MIME support still need a reviewed implementation.

The reader does **not** verify content authenticity or sender identity. It cannot guarantee that untrusted plain-text words are safe or truthful.

## Verification

Synthetic tests cover multipart alternative and mixed messages, embedded `message/rfc822`, fabricated children under non-multipart nodes, duplicate and unknown dispositions, named/encoded attachments, invalid attachment identifiers, malicious or malformed media types, size/depth/node bounds, and preservation of safe plain-text behavior. The simulated Gmail reader fixture uses structurally valid multipart metadata.

**93/93 automated tests and JavaScript syntax validation passed locally** on the development branch on November 8, 2026. Live Gmail provider compatibility, OS/device acceptance, independent security review, full RFC parsing and production mail access remain unverified.

## References

- [RFC 2045 — MIME Content-Type syntax](https://www.rfc-editor.org/rfc/rfc2045.html)
- [RFC 2183 — Content-Disposition and unknown disposition handling](https://www.rfc-editor.org/rfc/rfc2183.html)
- [Attachment metadata limitations](ATTACHMENT_METADATA.md)
- [Security](SECURITY.md)
- [Architecture](ARCHITECTURE.md)
- [Implementation status](IMPLEMENTATION_STATUS.md)
