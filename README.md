# GoreeCloud Mail

**GoreeCloud Mail** is a privacy-first, multi-platform **email client**, not an email hosting service or mail server. It connects to existing providers through authorized protocols and APIs.

**Maturity: experimental foundation. NOT Stable, deployed, or a default mail client.**

## Available first milestone

- Responsive web email client with an accessible three-pane inbox and reading view, based on verified GoreeCloud UI semantic tokens.
- Gmail API connection through Google Identity Services OAuth token flow, with explicit consent; public OAuth client ID supplied at runtime.
- Inbox, starred, sent, all mail; server-side search; read plain-text mail safely; mark read/unread; star/unstar; archive; and send plain-text email.
- Ephemeral OAuth tokens and messages in memory (not persisted); external images, message HTML, and tracking pixels are never rendered.
- Automated unit tests for MIME construction, base64url decoding, plain-text selection and defensive header validation.

**Not implemented yet:** multi-provider adapters, true encrypted offline storage, sync queue, durable drafts, threaded view, attachments, notifications, calendars, AI, mobile/desktop native packages, default-mail registration. Do not rely on this milestone for production or critical correspondence.

## Run locally

Requires Node.js 22+ for tests, and any static HTTP server to serve the web app.

1. Configure a Google Cloud OAuth 2.0 **Web application** client ID with the exact authorized JavaScript origin (for example http://localhost:4173). Gmail API access and the required scopes must be enabled for the account / consent configuration. Client IDs are public identifiers; never put client secrets in this app.
2. Run `python3 -m http.server 4173` at the repository root and open http://localhost:4173.
3. Choose **Configure**, enter your public OAuth client ID, save it, then choose **Connect Google**. Consent requests Gmail modify and send permissions for this experimental client; review before granting.
4. Use **Disconnect** to clear tokens and loaded messages from memory. The public client ID can be cleared from settings.

```sh
npm run check
npm test
```

Sending is a user-triggered provider operation, with no hidden relay or server. Email content is not stored on a GoreeCloud server. This browser-only foundation is **not yet audited** for production use or Gmail OAuth verification.

## Documentation

- [Founder's product specification](docs/PRODUCT_SPECIFICATION.md)
- [Architecture and provider boundaries](docs/ARCHITECTURE.md)
- [Security and privacy model](docs/SECURITY.md)
- [Implementation status](docs/IMPLEMENTATION_STATUS.md)
- [Release plan and default mail gate](docs/ROADMAP.md)
- [GoreeCloud UI reference](https://github.com/GoreeCloud/gc-ui)

Public source is not a blanket reuse license; licensing has not yet been designated.
