# GoreeCloud Mail — Phased delivery and Stable gate

**Goal:** GoreeCloud Mail becomes the user's preferred/default mail client on mobile, desktop and compatible browser contexts **once Stable**, by explicit per-platform user choice.

## Phase 0 — Public source and project baseline (experimental)

- Establish correctly scoped public repository, product requirements, architecture, security boundary, implementation status and build/test checks.
- Implement provider-connected web foundation and consistent GC UI shell.
- Do not deploy or register as default.

## Phase 1 — Verified web client

- Real test Gmail OAuth origin/scope verification, account connect/revoke/reauth.
- Hardened MIME parser, robust rendering, safe attachment storage, pagination and error recovery.
- Accessibility and premium visual acceptance on Chrome, Firefox, Safari, mobile browser widths, 200–400% zoom and reduced-motion/high-contrast modes.
- Security audits, identity isolation, read/send scope minimization.
- Optional static hosting only with explicit deployment authorization.

## Phase 2 — Usable multi-provider client

- Provider adapter contract and capability matrix; IMAP/SMTP in audited native runtimes; Outlook Graph and other official APIs where possible.
- Secure OS keychain + encrypted cache, multi-account sync, folders/labels, offline drafts/queues, import/export.
- Accurate Proton Bridge/Tuta limitations and supported encrypted mail interoperability.

## Phase 3 — First-party native apps

- Linux, Windows, macOS client packages; verified system mailto/default-mail preference integration.
- Android client: app links, ACTION_SENDTO mailto intents, share target, notifications, keystore, offline behavior.
- iOS/iPadOS client: default email application eligibility and user-selection workflow, keychain, share extension, notifications.
- Native packaging/signing/update security and device testing. No unsupported platform claims.

## Phase 4 — Privacy-preserving intelligence and ecosystem

- Optional on-device or approved AI with explicit consent, no automatic outbound actions.
- Rules, tasks, calendar/notes, search, backup/sync and notifications through verified interoperable contracts.
- E2EE/key management, user-facing security explanations and provider capability discovery.

## Stable / default mail criteria

No default-client designation until:

1. Mail read, send, reply, search, archive, drafts, attachments, account recovery, multi-account and offline workflows meet documented acceptance on the target platform.
2. End-to-end tests prove provider compatibility and message-data integrity with test accounts.
3. Security, privacy, accessibility, localization, performance, crash recovery, visual design and supported-device testing are completed with evidence.
4. Platform packages are signed, distribution/update policies reviewed, and rollback/recovery instructions verified.
5. Founder explicitly accepts Stable and enables platform-specific default-client setup. A web client can request registration as a mailto handler where supported, but cannot forcibly become the global default mail app.

Promotion requires traceable evidence, not just passing unit tests.
