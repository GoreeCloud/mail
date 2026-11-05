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
- **Auth:** Google Identity Services OAuth token client, public client ID entered per browser; token is held only in JavaScript memory, cleared on disconnect/expiry. Initial consent requests gmail.readonly; explicit user-triggered actions request gmail.modify or gmail.send alongside readonly. Granular consent scope receipts are checked. Public client ID alone is stored in localStorage.
- **Gmail:** requests to https://gmail.googleapis.com/gmail/v1/users/me only, with capability-checked scopes; the API is the server, not GoreeCloud. Five-at-a-time metadata retrieval, 30-message pages, explicit Load more and server-side search. Metadata uses bounded 429/5xx retries; an incomplete page fails as a unit, preserving the previous pagination cursor rather than skipping messages. HTTP 401/403 is not retried.
- **Reading:** Gmail text/plain MIME parts decoded to Unicode and assigned with textContent; HTML bodies and remote images are never executed or loaded.
- **Writing:** plain-text MIME built with header checks and UTF-8 base64 transfer encoding; Gmail accepts submission and returns an ID. No promise of final delivery or remote recall.
- **Asynchronous safety:** AbortControllers and request-generation checks suppress stale reader/list responses. Account email is rechecked after privilege escalation before a sensitive action, and profile responses are discarded if the initiating session has changed. A confirmed account mismatch in the same session disconnects locally. Provider-side accepted operations cannot be undone by cancellation.
- **Storage:** received messages, OAuth tokens, and active composer content remain in memory. A deliberate **Save encrypted draft** action stores one PBKDF2-SHA256/AES-256-GCM encrypted snapshot in local browser storage; contents and account identity are authenticated and encrypted. No autosave, Gmail draft syncing, encrypted offline mailbox, or robust backup is implemented. See [ENCRYPTED_DRAFTS.md](ENCRYPTED_DRAFTS.md).
- **Encrypted draft lifecycle:** user-supplied passphrase only, one snapshot per origin, explicit replacement/deletion, account-bound decryption and cancellation safety. Does not survive cleared browser data; local disconnect intentionally preserves an explicitly saved ciphertext snapshot.
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
