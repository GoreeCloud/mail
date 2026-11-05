# GoreeCloud Mail — Provider Adapter Contract v1

**Status:** Implemented foundation for the current Gmail-only experimental web alpha. This interface does not make another provider functional, and it is not a third-party plugin loader or email server.

## Modules

- `src/providers/contract.js` — versioned, explicit capability and method validation. The object is frozen at construction.
- `src/providers/gmail.js` — the single concrete adapter. It delegates to the existing Google Identity Services authorization logic and the official Gmail API client. This preserves current Gmail behaviors and permission controls.
- `src/main.js` — reads Gmail operations via this adapter instead of importing the API and authentication modules directly.

## Contract

The v1 interface declares a stable `id`, `displayName`, `transport`, `adapterVersion`, `clientOnly: true`, and explicit boolean `capabilities`:

`read`, `search`, `modify`, `send`, `attachmentMetadata`, `attachmentDownload`, `providerDrafts`, `scheduleSend`, `push`, `endToEndEncryption`.

Required methods are `connect`, `connected`, `disconnect`, `getProfile`, `listMessages`, and `getMessage`. Optional methods are `requestCapability`, `modifyMessage`, and `sendMessage`. A provider cannot advertise send or modification without its corresponding method and authorization gate.

Capabilities are explicit own boolean properties, and unsupported mutations cannot be exposed through the validated interface. Unknown capability keys and arbitrary additional methods are rejected. This is **declaration validation only**, not security sandboxing or a security audit.

## Verified Gmail capability baseline

| Capability | Current state |
| --- | --- |
| Read and server-side search | Experimental; Gmail API integration implemented, no real-account acceptance |
| Explicit modify and send | Experimental; staged Google consent and account-continuity guards implemented |
| Attachment metadata | Read-only filename/type/size display; no content fetch |
| Attachment download | Unsupported |
| Provider-synchronized drafts | Unsupported; one opt-in encrypted *local* draft snapshot exists outside the adapter |
| Scheduled sending, push, E2EE | Unsupported |
| Outlook, iCloud, standard IMAP/SMTP, Proton Bridge and Tuta | No adapters implemented or verified |

The interface must not be treated as permission to bypass provider OAuth, use unsupported protocols, share credentials, centralize mail content, run arbitrary extensions, or claim a provider is supported.

## Future integration requirements

Future adapters must be implemented and independently reviewed against the actual provider: authorization, least-privilege scopes, provider terms, supported read/send/update operations, sync semantics, error/quota handling, identity continuity, test fixtures, and privacy/security controls. Native clients can consider verified IMAP/SMTP or provider bridges with OS secret stores. Web clients cannot directly open raw IMAP/SMTP sockets and must use officially supported APIs or another separately approved architecture.

Before adding any provider to UI selection or making GoreeCloud Mail a default client: add contract tests, live test-account integration, threat review, accessibility acceptance, and accurate provider-specific feature disclosures.

See [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY.md](SECURITY.md), and [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).
