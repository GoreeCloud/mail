# GoreeCloud Mail

GoreeCloud Mail is GoreeCloud's privacy-first, first-party email client platform for web and planned native clients. It connects to compatible external mail providers through trusted GoreeCloud provider adapters; GoreeCloud does **not** currently operate mailbox hosting, MX infrastructure, or Internet mail-delivery infrastructure.

## Status

**Active Development. Production deployment is not approved. Stable release is not approved.**

External providers remain authoritative for mailbox hosting, mailbox contents, delivery state, quotas, provider-owned policy, and Internet mail transport except where they explicitly delegate an operation through an authorized API or protocol.

## Current source foundation

The repository currently includes:

- responsive Glaze UI web/client foundations with provider-driven browser mailbox navigation and a message reader;
- browser mailbox switching that uses `listMessages(mailboxId)`, generation-guards stale reads, and scopes local search to the currently loaded mailbox snapshot;
- browser composition with multiple To recipients, optional Cc/Bcc, local Reply/Forward plain-text context, and no automatic forwarding of original attachments;
- provider-independent Mail contracts and same-origin provider gateway boundaries;
- Gmail and standards-based IMAP/SMTP adapter foundations;
- trusted session-derived GoreeCloud user identity and user-scoped provider-account handling;
- OAuth state, Gmail PKCE/OAuth construction, token refresh/revocation, capability resolution, and normalized provider errors;
- bounded provider timeout/retry/backoff policy for replay-safe operations;
- SQLite-backed provider-account, credential-reference, synchronization, operation, and attachment metadata foundations;
- encrypted provider credential-vault source with AES-256-GCM and key-rotation support;
- fail-closed HTML message policy pending production sanitizer acceptance;
- Privacy Shield remote-content defaults;
- Wardveil-gated cached incoming attachment delivery with exact-content binding and minimized clean-scan provenance;
- Gmail mailbox/label/message read foundations;
- bounded plain-text and sanitized rich Gmail composition with attachment-capable send, draft-create, and draft-update transport;
- fail-closed outgoing Wardveil attachment authorization using the exact validated bytes that are serialized into provider MIME;
- durable minimized outgoing clean-scan provenance that must persist before an attachment-bearing Gmail provider client is created;
- a bounded browser `File`-to-compose attachment materializer aligned to the current 20-file, 10 MiB-per-file, 20 MiB-total composition limits;
- an explicit browser provider runtime that defaults to local demo mode and can activate the existing authenticated provider gateway only with a non-secret account identifier and same-origin gateway path;
- demo-provider attachment submission that remains fail-closed so demo mode never transmits selected attachment bytes;
- one-attempt Gmail writes so non-idempotent provider writes are not automatically replayed; and
- **ambiguous Gmail send and draft-write reconciliation** using a server-owned deterministic RFC Message-ID and bounded provider lookup. Confirmed matches return reconciled metadata; unresolved outcomes fail closed as non-retryable `provider-write-outcome-unknown` rather than risking an automatic duplicate send or draft write.

Synthetic provider tests validate source contracts without representing a real mailbox as production-connected.

## Browser mailbox boundary

The Development web shell lists mailboxes returned by the configured provider and treats each selection as a provider read. The browser does not decide which messages belong to Inbox, Starred, Sent, Drafts, Archive, Trash, or any other provider mailbox.

Changing mailboxes clears the previous message reader and uses a generation guard so a slower earlier request cannot replace the results of a later selection. Browser search is intentionally local to the already-loaded mailbox snapshot rather than calling the provider-wide search surface and silently broadening results across mailboxes.

The demo provider currently supplies example Inbox and Starred state and can return empty snapshots for other demo mailboxes. Real gateway/provider environments remain authoritative for their own mailbox contents and capabilities.

## Product role

GoreeCloud Mail owns the GoreeCloud client experience, local/trusted-backend logic, privacy controls, security integration, synchronization behavior, intelligent-assistance boundaries, and wider GoreeCloud interoperability while compatible external providers remain the mail-service authority.

**GoreeCloud Courier** is the unified first-party mail technology and feature framework powering GoreeCloud Mail. Courier is not a separate application, provider, or repository.

## Current write boundary

The Gmail composition foundation supports bounded plain text, sanitized HTML alternatives, validated recipients and headers, optional trusted From/Reply-To fields where capabilities permit, and bounded attachments. Attachment-bearing Gmail sends and draft writes cannot create the provider client until the trusted server has validated the complete message, scanned the exact attachment bytes through Wardveil, accepted current authoritative clean evidence, and durably persisted minimized outgoing scan provenance.

When a stable client mutation identifier is supplied, send and draft create/update operations use a server-owned deterministic RFC Message-ID for post-failure reconciliation. Ambiguous send is checked against the Sent mailbox. Ambiguous draft create/update is checked against a bounded Gmail draft search, and an update is accepted only when the unique matching provider draft is the exact draft ID being replaced. No ambiguous write is automatically replayed.

The browser-side compose attachment materializer preserves selected bytes in the server-compatible base64 message shape and applies the current source limits of 20 attachments, 10 MiB per attachment, and 20 MiB total. These browser checks are an early usability boundary, not security authority. The Development web shell still defaults to the local demo provider. Demo mode refuses every attachment-bearing submission and never transmits selected bytes.

Reply and Forward prepare local plain-text context and do not automatically copy original attachments. If the user wants attachments on a forwarded Development message, those bytes must re-enter through the normal attachment selection path so the existing trusted Wardveil-gated provider boundary is not bypassed. Reply All, production thread semantics, and full provider parity remain separate milestones.

An operator may explicitly select `gateway` mode using non-secret page metadata for the provider mode, provider-account identifier, and a same-origin root-relative gateway base. No reusable provider token, refresh token, app password, session secret, or cryptographic key belongs in that browser configuration. In gateway mode, the browser may submit the already-materialized server-compatible attachment shape to the authenticated same-origin Mail API; the trusted backend remains authoritative for session identity, provider-account authorization, complete message validation, Wardveil exact-byte authorization, scan provenance, and the eventual provider write.

Authenticated real-provider environment acceptance, production sender identities, production OAuth/credential custody, production Wardveil service acceptance, quarantine execution, offline replay UX, and release acceptance remain separate milestones.

## Wardveil attachment scanning

GoreeCloud Mail's trusted cached incoming attachment-delivery path requires Wardveil Scan before provider attachment bytes can become a downloadable cached object. Mail does not connect directly to ClamAV and does not reinterpret raw scanner output as an authoritative application verdict.

Only current authoritative clean evidence with the required exact-resource, correlation, validity, evidence-reference, and SHA-256 content binding may proceed. Malicious, suspicious, unknown, unsupported, invalid, expired, changed-content, or scanner-unavailable outcomes fail closed before downloadable storage or an attachment-bearing Gmail provider write. A malicious outcome may expose a bounded quarantine-required state; Mail is not the Wardveil Quarantine executor and quarantine is not deletion.

Minimized durable clean-scan provenance exists for both the incoming cache boundary and outgoing Gmail attachment writes. Missing, corrupt, tampered, expired, mismatched, or nonpersistable required provenance fails closed. Application provenance is not Wardveil Audit, and source validation is not production Wardveil runtime acceptance.

## Security and privacy boundaries

Mail content, HTML, links, attachments, provider responses, protocol data, sender metadata, and remote resources are untrusted input. Reusable provider credentials, refresh tokens, app passwords, cryptographic keys, session material, and other secrets must remain in trusted custody and must not be exposed through browser responses or committed to source.

- **Wardveil Security / Security Center** governs applicable security decisions such as attachment security evidence.
- **Privacy Shield / Privacy Center** governs privacy, consent, remote resources, tracking protection, data minimization, and user control.
- **Everkeep / Continuity Center** governs accepted backup, recovery, preservation, portability, and continuity behavior.
- **GoreeCloud Identity / Identity Center** governs GoreeCloud authentication and authorization boundaries.
- **GoreeCloud Mesh / Mesh Center** governs authenticated, policy-controlled cross-service coordination.
- **Glaze UI / Design Center** governs the approved interface/design-system contract for applicable clients.

Passing source tests does not establish production acceptance for any of these systems.

## Native Android Development foundation (integrated; disconnected)

PR #70 was squash-merged to authoritative `main` as `548a21c33318a7ab7cc7e6c43defccf048b065e5` after its exact-head Android Client, CI and repository-validation workflows passed. The integrated first-party Kotlin/Jetpack Compose Android Development sidecar provides a buildable generic shell, a five-capability fail-closed status model, JVM tests and exact-source Android CI with Development APK identity/authority evidence. Its development package is `com.goreecloud.mail.dev` (minimum SDK 29, target SDK 36). The manifest requests **no `INTERNET` permission**, disables Android backup and cleartext traffic, and adds no provider, GoreeCloud Identity, synchronization, secure storage, notifications, attachment or production-signing authority.

The merged source replaces the obsolete Groovy `clients/android/settings.gradle` with Kotlin `settings.gradle.kts`. Historical Draft PR #61 is selective source provenance, not current integration authority. Contract 0.4 is already integrated on `main`; GLAZE UI V1.6 / `1.6.0` remains an unaccepted full-application migration. Source/build success does not establish a connected mailbox, representative-device acceptance, protected signing, deployment, Release Candidate, Production Acceptance or Stable qualification. Independent post-merge exact-main **push-workflow and artifact** evidence remains to be verified; successful PR-head workflows must not be relabeled as push acceptance.

## Planned client surfaces

- Web
- Linux desktop
- Android
- iOS

Native packaging and representative-device acceptance remain incomplete unless a later release record explicitly states otherwise.

## Documentation

- [USER-MANUAL.md](USER-MANUAL.md)
- [SPECIFICATIONS.md](SPECIFICATIONS.md)
- [FEATURES.md](FEATURES.md)
- [BENEFITS.md](BENEFITS.md)
- [COMPETITIVE-OBJECTIVES.md](COMPETITIVE-OBJECTIVES.md)
- [docs/courier.md](docs/courier.md)
- [docs/provider-backend-contract.md](docs/provider-backend-contract.md)
- [docs/gmail-write-transport.md](docs/gmail-write-transport.md)
- [docs/wardveil-attachment-scanning.md](docs/wardveil-attachment-scanning.md)
- [docs/outgoing-attachment-wardveil-gate.md](docs/outgoing-attachment-wardveil-gate.md)
- [docs/browser-compose-attachment-materialization.md](docs/browser-compose-attachment-materialization.md)
- [docs/database-maintenance.md](docs/database-maintenance.md)
- [docs/credential-vault.md](docs/credential-vault.md)

## Validation

Run the source suites with:

```bash
npm test
npm run test:backend
```

GitHub Actions also runs repository validation and static safety checks. Material backend/security candidates require exact-head validation before merge.

Source validation is not production deployment, real-provider acceptance, signed release, or Stable qualification.

## License

GoreeCloud Mail is licensed under the GNU Affero General Public License, version 3 only (`AGPL-3.0-only`). See `LICENSE`.