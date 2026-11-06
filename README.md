# GoreeCloud Mail

**GoreeCloud Mail** is a privacy-first, multi-platform **email client**, not an email hosting service or mail server. It connects to existing providers through authorized protocols and APIs.

**Maturity: experimental foundation. NOT Stable, deployed, or a default mail client.**

## Available first milestone

- Responsive web email client with an accessible three-pane inbox and reading view, based on verified GoreeCloud UI semantic tokens.
- Gmail API connection through a tested v1 provider adapter and Google Identity Services with **read-only consent first**; additional modify/send permissions requested on explicit actions. Public OAuth client ID supplied at runtime.
- Inbox, starred, sent, all mail; server-side search and explicit Load more pagination with bounded metadata retry; incomplete pages never silently advance the cursor and the interface offers **Retry this page**; safe bounded plain-text reading (supported MIME charsets; 4 MiB text and structural limits), with **read-only attachment filename/type/size summaries** (no download or preview) and a collapsed, read-only message-header inspector; user-triggered read/unread, star/unstar, archive, and plain-text send with confirmed Gmail message IDs and explicit uncertain-status warnings.
- A confirmation protects unsent recipient, subject and body when the composer is discarded or closed with Escape; browsers may show a navigation warning for active drafts.
- Ephemeral OAuth tokens and received messages remain in memory; **optional passphrase-encrypted local draft snapshots** persist only when explicitly saved. Message HTML, remote images, and tracking pixels are never rendered.
- Provider metadata type checks and bounded display fields reduce UI failure risk from malformed Gmail responses.
- Automated MIME, Gmail API and authorization tests; simulated interaction tests for pagination, stale message responses, scope escalation and account switches.

**Sending caveat:** Gmail accepting a message ID confirms provider submission, **not** recipient delivery. A lost or malformed send response produces an unknown-status warning. Check Gmail Sent before retrying to avoid duplicates; the client never automatically retries sending.

**Not implemented yet:** adapters for providers other than Gmail, full encrypted offline mailbox storage, sync queue, autosaved/provider-synchronized drafts, threaded view, attachment download/upload/preview, notifications, calendars, AI, mobile/desktop native packages, default-mail registration. Do not rely on this milestone for production or critical correspondence.

## Run locally

Requires Node.js 22+ for tests, and any static HTTP server to serve the web app.

1. Configure a Google Cloud OAuth 2.0 **Web application** client ID with the exact authorized JavaScript origin (for example http://localhost:4173). Gmail API access and the required scopes must be enabled for the account / consent configuration. Client IDs are public identifiers; never put client secrets in this app.
2. Run `python3 -m http.server 4173` at the repository root and open http://localhost:4173.
3. Choose **Configure**, enter your public OAuth client ID, save it, then choose **Connect Google**. Initial consent requests Gmail read-only access. Explicit message changes request Gmail modify; sending requests Gmail send. Gmail modify is a broad provider permission which also grants other capabilities; review the Google consent screen before granting.
4. Use **Disconnect** to clear local tokens and loaded messages from memory. This is not revocation of Google OAuth grants; revoke access separately through your Google Account if needed. The public client ID can be cleared from settings.

```sh
npm run check
npm test
```

Sending is a user-triggered provider operation, with no hidden relay or server. Email content is not stored on a GoreeCloud server. This browser-only foundation is **not yet audited** for production use or Gmail OAuth verification.

## Local encrypted drafts

Compose offers **Save encrypted draft** and **Restore local draft**, using a user-chosen passphrase. Only one encrypted snapshot can be kept per browser origin; it is **not** Gmail Drafts or automatic autosave. Local Disconnect does not erase the ciphertext. See [Encrypted Drafts](docs/ENCRYPTED_DRAFTS.md) before using it for important messages.

## Documentation

- [Founder's product specification](docs/PRODUCT_SPECIFICATION.md)
- [Architecture and provider boundaries](docs/ARCHITECTURE.md)
- [Security and privacy model](docs/SECURITY.md)
- [Read-only attachment summaries and limitations](docs/ATTACHMENT_METADATA.md)
- [Read-only message headers and trust limitations](docs/MESSAGE_HEADERS.md)
- [Provider adapter contract and supported capability matrix](docs/PROVIDER_ADAPTERS.md)
- [Conservative Gmail threaded replies](docs/THREADED_REPLY.md)
- [Encrypted local drafts and limitations](docs/ENCRYPTED_DRAFTS.md)
- [Implementation status](docs/IMPLEMENTATION_STATUS.md)
- [Release plan and default mail gate](docs/ROADMAP.md)
- [GoreeCloud UI reference](https://github.com/GoreeCloud/gc-ui)

Public source is not a blanket reuse license; licensing has not yet been designated.
