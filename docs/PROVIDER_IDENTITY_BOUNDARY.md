# Provider metadata identity boundary — November 13, 2026

**Scope:** defensive parsing of Gmail-returned metadata only, before it reaches the preview or reply context. No scope escalation, provider writes, storage, account access, or production deployment.

The existing Gmail client validates IDs before making direct API requests and ensures returned page/message IDs match requested IDs, but its independently exported `normalizeMessage` accepted any nonempty string up to 256 characters as a message ID. Its thread ID was truncated, rather than treated as an opaque provider ID; and label IDs were filtered only by size.

This change applies the same strict opaque message identifier pattern during normalization and to optional thread identifiers. Invalid thread IDs are dropped instead of exposing potentially malformed reply context. Labels now use the existing label-ID grammar with duplicate removal. The client continues to show only inert text; no HTML is rendered. Existing matching ID checks and explicit provider-mutation receipts remain in place.

New tests cover forbidden slash, control/Unicode line separators, whitespace, duplicate/invalid labels, valid thread IDs and malformed thread context. Passing Node tests would establish only synthetic boundary behavior; a disposable Gmail OAuth account test and client/platform review remain unverified release gates. No real messages are touched by the tests.
