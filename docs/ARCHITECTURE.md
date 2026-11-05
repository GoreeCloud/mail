# GoreeCloud Mail — Architecture

**State:** Initial browser-client architecture; native clients and additional providers are planned, not implemented.

## Core boundary

The product is a **mail user agent** (MUA). It does not host accounts or deliver messages independently. Provider APIs and authenticated standards handle mailbox access and actual outbound sending.

```text
[User] -> [GoreeCloud Mail UI (GoreeCloud UI tokens)]
            |   |       |
            |   |       +--> [Optional local security / AI / rules]
            |   +----------> [Local encrypted app store (planned)]
            +--------------> [Provider adapters (permissions)]
                                     |
                        [Existing Gmail / Outlook / IMAP + SMTP]
```

## Current implementation

- Static ES modules and CSS. No app backend, custom SMTP relay, framework runtime, cookies, analytics SDK or external message cache.
- **Auth:** Google Identity Services OAuth token client, public client ID entered per browser; token is held only in JavaScript memory, cleared on disconnect/expiry. Public client ID alone is stored in localStorage.
- **Gmail:** requests to https://gmail.googleapis.com/gmail/v1/users/me only, with explicit modify/send scopes; the API is the server, not GoreeCloud. Bounded message-metadata retrieval and server-side search.
- **Reading:** Gmail text/plain MIME parts decoded to Unicode and assigned with textContent; HTML bodies and remote images are never executed or loaded.
- **Writing:** plain-text MIME built with header checks and UTF-8 base64 transfer encoding; Gmail accepts submission and returns an ID. No promise of final delivery or remote recall.
- **Storage:** in-memory messages and composer. No encrypted persistent offline mail yet; switching/reloading loses unsent local compose text. The CSS and HTML app shell may be cached by browser normally, not message data.
- **UI:** GC UI semantic palette, spacing and radius snapshot; migrate to the released shared token distribution when integration is verified.

## Provider adapter evolution

Introduce a versioned interface with capability discovery:
```text
authenticate / reauthenticate / disconnect
listMailboxes / listMessages / readMessage
sendMessage / modifyMessage / optionalSearch
supports: labels, folders, push, drafts, schedule, E2EE, attachments, aliases
```

Native desktop/mobile may use standard IMAP/SMTP with OS secure store and audited libraries. Browser web is constrained by same-origin and provider API availability; it cannot open raw IMAP/SMTP sockets. Never introduce a generic backend proxy merely to simulate client-only support without an approved architecture review.

Provider capabilities must be surfaced truthfully (Gmail labels vs IMAP folders, Proton official Bridge on eligible desktop, Tuta no standard IMAP).

## Planned security architecture

- Platform keychain/keystore for credentials, encrypted local message/attachment/search storage, key rotation and lock screens.
- Offline sync queue with idempotent operations, conflict handling, provider quotas and error recovery.
- Safe HTML rendering using a reviewed sanitizer in an isolated context with no scripts and controlled remote content; no untrusted HTML injection.
- Optional local AI first; opt-in external models with separate, consented data sharing and explicit action approvals.
- Segregate account data/permissions; no global token sharing or plaintext telemetry.

## Release / defaults

See [ROADMAP.md](ROADMAP.md). Do not register as a default email client or represent the browser foundation as a validated native app.
