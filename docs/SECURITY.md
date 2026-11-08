# GoreeCloud Mail — Security and Privacy

**Scope:** First experimental browser client, not audited or ready for sensitive/production mail.

## Threat boundaries

- Treat provider responses, message subjects, headers, bodies, attachments, and all external links as untrusted data.
- Do not execute HTML, inline event handlers, scripts, active attachments, remote images, or tracking pixels from mail.
- Provider adapter v1 is a static build-time boundary, not a runtime extension sandbox. It rejects unknown method/feature declarations, inherited feature flags and unsupported mail mutation operations. This is contract validation, not independent security review or permission enforcement for arbitrary third-party code.
- The message reader's attachment section displays at most 24 inert, untrusted metadata summaries, never attachment IDs or active download controls. Filenames have control/bidi characters neutralized. No malware scanning is claimed and a listed filename does not imply safety.
- Gmail pages are validated before metadata fetch: 30-entry cap, unique bounded path-safe message IDs and bounded opaque page cursors; full-message/metadata returned IDs must match the requested IDs, or the page is rejected without advancing. See [GMAIL_PAGE_INTEGRITY.md](GMAIL_PAGE_INTEGRITY.md).
- Gmail full/metadata responses are type-checked and bounded before entering the message display model. Missing/invalid message IDs are rejected; malformed names/values, non-string MIME types, malformed label arrays and oversized previews cannot directly crash rendering or inject active markup. Sanitized sender/subject display values may truncate unusual legitimate headers.
- A collapsed message-header inspector renders provider-reported fields as plain text only, limits count/value sizes, neutralizes control and bidi formatting characters and clears the DOM on reader reset. This is **not** a trustworthy SPF/DKIM/DMARC verdict; email headers may be forged. See [MESSAGE_HEADERS.md](MESSAGE_HEADERS.md).
- The Gmail plain-text preview traverses only validated multipart MIME containers; encapsulated messages, named inline parts, attached or unknown dispositions, duplicate disposition headers and malformed provider attachment metadata cannot be silently promoted into the visible main message body. The attachment type validator now uses a bounded, strict media-token pattern. This is conservative MIME containment, not a full MIME parsing audit. See [MIME_PREVIEW_BOUNDARY.md](MIME_PREVIEW_BOUNDARY.md).
- Current message viewer uses textContent only; text/plain content may include malicious wording, so it is never trusted as commands. Preview MIME traversal and body decoding are bounded (256 nodes, 32 nesting levels, 4 MiB decoded text); unsupported charsets fall back to UTF-8.
- OAuth access tokens are short-lived and **in memory only**, never in URL parameters, localStorage, logs or repository.
- The public Google OAuth client ID is stored locally; additionally, a user may deliberately store **one encrypted local draft snapshot**. Received mail and access tokens are never saved to browser storage. The draft's address and contents are encrypted, but browser extensions and malicious same-origin scripts remain in the threat model.
- Requests are HTTPS-only to the configured Gmail API origin. CSP restricts script, frame and connect origins, with no inline JS.
- Explicit Gmail label modifications fail closed on malformed or conflicting label arrays before HTTP. A successful HTTP status is not accepted unless the returned message ID and label set confirm the exact requested change; unconfirmed changes leave local labels unchanged and instruct the user to refresh before retrying. The client never automatically repeats a possibly accepted mutation. See [GMAIL_MODIFICATION_RECEIPTS.md](GMAIL_MODIFICATION_RECEIPTS.md).
- Opening an email is read-only and does not mark it read. Initial Gmail authorization requests gmail.readonly only; explicit mutation and sending request gmail.modify and gmail.send respectively. Gmail.modify is itself a broad restricted scope that also permits sending, so user-facing consent must explain the provider's full grant.
- No external analytics/tracking SDK. No remote mail storage owned by GoreeCloud.
- Gmail threaded replies require a single supported original recipient, strict Message-ID/References/threadId validation, unchanged recipient and subject, explicit send consent, and an expected threadId in the receipt. Wrong-thread responses are ambiguous and are not automatically retried. Reply context is retained only in memory or inside the existing authenticated encrypted snapshot when explicitly saved. This does not prove delivery or live Gmail threading.
- Gmail send attempts never retry automatically. Only a nonempty returned Gmail message ID is treated as provider-accepted; ambiguous responses or network errors preserve the composer and tell the user to check Gmail Sent before retrying, because duplicates are possible. Provider acceptance is not recipient delivery.
- Error messages intentionally omit Gmail response bodies to reduce accidental private-data leakage.
- Nonempty composer dismissal now requires user confirmation on Discard/Escape; a standard before-unload request is issued where supported, but does not guarantee recovery on mobile crashes or unsupported navigation paths.
- In-flight mailbox/reader requests are cancelled or invalidated on disconnect and view change, and stale Gmail account-profile responses are ignored rather than altering a newer session. UI race tests confirm stale results remain hidden, but this does not undo server-side actions already submitted.

## Known limits and open risks

1. Google Identity Services compatibility, consent screen verification and app-origin configuration require real-browser testing.
2. The browser has **manual passphrase-encrypted local draft save/restore**, not automatic drafts or provider synchronization. No persistent received-mail cache or full offline mailbox is implemented. Saved ciphertext remains after local Disconnect until explicitly deleted or browser storage is cleared.
3. Plain text only: HTML-only emails display a safety notice; rich message rendering and attachment content handling are not yet supported. Read-only attachment summaries now display sanitized filenames, media types and provider-reported sizes, **without fetching or previewing file content**. The bounded charset-aware viewer may reject unusually large or deeply nested legitimate email and is not an RFC-complete MIME implementation.
4. Incremental read/modify/send permission requests, receipt validation, and account continuity checks are implemented and tested with mocks. Real Google OAuth consent, scope verification, restricted-scope app verification, and account-switch behavior still require live-browser testing.
5. Sending accepts recipient list and subject with basic validation, but production MIME headers, internationalized mailboxes and all edge cases require a reviewed mail library and fuzz testing. Manual encrypted drafts use PBKDF2-SHA256 (310,000 iterations) and AES-256-GCM; user passphrases are not stored or recoverable. This crypto module has unit tests, **not** an independent audit.
6. The current code does not yet implement CSP reporting, phishing scanning, key management, malware scanning, certificate pinning, S/MIME or OpenPGP.
7. Gmail metadata 429/5xx failures receive up to two additional attempts with abortable delays; an incomplete page fails atomically without advancing its cursor, with an explicit retry action retaining already loaded messages, and 401/403 is not retried. This is only a bounded alpha mechanism, not full provider quota-aware scheduling or a guarantee of recovery. Test against real provider failures before Stable.
8. Local disconnect discards tokens but does not revoke Google OAuth grants. Users must revoke the app in Google Account permissions if they want to remove prior consent. A user-selectable revoke feature may follow after review.
9. Headless Chrome shell screenshots, simulated UI tests, granular-consent/denial/account-mismatch tests and a synthetic headless Chrome Web Crypto/localStorage smoke test have been performed. No real-Gmail consent, fully connected browser acceptance, storage quota/cache audit, screen-reader audit or penetration test has been completed.

## Development and contribution safeguards

- Never commit tokens, client secrets, email content, private domains, contact addresses, or production logs.
- Review dependencies, licenses, permissions, workflow actions, external scripts and supply-chain changes before running them.
- Do not enable email body transmission to any AI provider without separate informed consent.
- Local encrypted draft deletion and existence checks require storage access but do **not** depend on Web Crypto availability or a Gmail account connection. The Settings dialog offers explicit deletion even while disconnected; saving and unlocking remain cryptography-gated. This supports privacy-preserving deletion even if the browser loses cryptographic support. It does not guarantee secure erasure of storage media or backups.
- No mail servers, relays, proxy accounts, credential theft or insecure provider compatibility hacks.
- Security problems should be disclosed privately through an approved channel; do not attach sensitive example messages to public issues.

## Minimum release gates

- Verified OAuth flow and correct scope handling in Chromium, Firefox, Safari and supported mobile browsers.
- Secure credential persistence only if/when introduced, with keychain-backed storage and attack-surface review.
- MIME parser and composer hardened, attachment safety review and HTML sandbox/sanitizer tested.
- Clear privacy policy, permission inventory, threat model and provider compatibility matrix.
- No critical/high unmitigated vulnerabilities; green tests and manual privacy/security review. Browser storage, passphrase handling, mobile nested modal/focus, offline operation, crypto/key-management and accidental-loss scenarios must be tested before Stable.

## CI supply-chain controls

The current workflow pins official `actions/checkout` and `actions/setup-node` to verified immutable commit SHAs. The workflow token retains `contents: read`; no deployment permissions are configured. Automated tests guard these declarations, but cannot certify the underlying actions or their transitive supply chains. See [CI_INTEGRITY.md](CI_INTEGRITY.md).
