# GoreeCloud Mail — Implemented Features

**Record type:** Repository implemented-feature inventory  
**Repository:** `GoreeCloud/mail`  
**Lifecycle:** Development / nonconformant  
**Repository version:** `0.1.0-dev`  
**Migration state:** Complete on authoritative `main`; PR #64 merged as `9e0220856782ca4d19ade7fd7ced53507a581b80`, exact-main Validate GoreeCloud Mail #190 and CI #755 passed, and the mapped legacy Drive roadmap/changelog sources were permanently retired and independently verified absent on September 22, 2026.  
**Current governance baseline:** `9e0220856782ca4d19ade7fd7ced53507a581b80` on `main`.  
**Pre-migration capability baseline:** `096f53da62c92567cd2fe949fe40a4f6e946a68c`; PR #64 changed documentation/governance only.  
**Governing standard:** Standard — Repository Feature Tracking and Changelog Governance v1.0.

## Interpretation

This record describes capabilities accepted on authoritative `main`. It does not promote open Draft pull requests, retired Drive roadmap wording, or superseded design-system targets into current implementation state.

Authoritative `main` includes the repository-native governance migration at `9e0220856782ca4d19ade7fd7ced53507a581b80`; exact-main Validate GoreeCloud Mail #190 / run `35780338172` and CI #755 / run `35780338226` passed on that exact revision. The migration changed documentation authority only and did not alter Mail runtime behavior or lifecycle state. The current direct-main Draft control-plane/Android stack (PRs #60–#63) and older open Draft stacks remain candidate-only and are not represented below as accepted implementation.

## Implemented Development foundations

### Provider-independent Mail client architecture
- GoreeCloud Mail is implemented as a first-party client/trusted-backend platform over compatible external mail providers rather than as a GoreeCloud mailbox host or Internet mail-delivery provider.
- Provider-independent `MailProvider` and same-origin provider-gateway boundaries are present.
- Account-scoped provider capability discovery/enforcement and opaque provider-account routing are implemented as Development source foundations.
- Gmail and standards-based IMAP/SMTP adapter foundations exist, with real-provider production acceptance still open.

### Trusted identity, provider-account, and credential boundaries
- Trusted server-session identity is separated from caller-selected identity.
- Provider-account ownership is user-scoped and fails closed across users.
- OAuth state, PKCE construction, Gmail token refresh/revocation, credential-vault boundaries, and encrypted credential-persistence foundations are implemented.
- Provider credentials remain outside browser-visible responses and ordinary application metadata.

### Provider transport and write safety foundations
- Gmail read-side transport foundations and capability-gated send/draft write paths are present.
- Provider requests use bounded timeout/retry/backoff behavior for eligible replay-safe operations.
- Non-idempotent Gmail writes are not automatically replayed.
- Deterministic Message-ID-based ambiguous send/draft reconciliation is implemented so unresolved outcomes fail closed rather than risking duplicate provider writes.

### Durable state and synchronization foundations
- SQLite-backed provider-account, credential-reference, synchronization, operation, and attachment metadata foundations are implemented.
- Schema migration, bounded backup/integrity tooling, synchronization cursors, operation/idempotency state, and related Development persistence controls exist.
- These foundations do not establish full offline synchronization, target-environment recovery, or Everkeep acceptance.

### Message-content privacy and security foundations
- A fail-closed HTML/message-content policy and restrictive sanitizer boundary are present.
- Privacy Shield-oriented remote-content blocking defaults are implemented as a Development policy foundation.
- Mail content, links, attachments, provider responses, and remote resources remain treated as untrusted input.

### Wardveil attachment-security foundations
- Incoming cached attachment delivery includes Wardveil Scan transport, exact-content binding, owner-bound delivery, private-object handling, and minimized durable clean-scan provenance.
- Outgoing Gmail attachment paths include fail-closed Wardveil authorization tied to the exact bytes serialized into provider MIME.
- Controlled-provider application-consumer runtime evidence exists on `main`, but real Gmail execution, production identity/credential lifecycle, authoritative Audit/Security Center provenance, quarantine execution, and broad production Wardveil acceptance remain open.

### Browser mailbox and composition foundations
- The responsive web shell includes provider-driven mailbox navigation, message reading, race-safe mailbox switching, and local search scoped to the already-loaded mailbox snapshot.
- Browser composition includes multiple recipients, optional Cc/Bcc, draft submission, local Reply/Forward context, bounded attachment selection/materialization, and fail-closed demo-provider attachment behavior.
- Provider-backed Development reader actions include archive/delete/move foundations where accepted on `main`.

### Repository control plane accepted on current main
- Platform Contract schema 0.2 is accepted on `main` with Development/nonconformant state.
- Current `main` declares Manager, Privacy Shield, Wardveil Security, Everkeep, GLAZE UI, Mesh, and Identity integration planes, all unresolved or migration-required as recorded by that accepted contract.
- The live repository identity is now `GoreeCloud/mail`; the accepted Platform Contract file still contains the pre-rename `GoreeCloud/goreecloud-mail` namespace and remains stale until separately reconciled.

## Explicitly not implemented or not accepted on current main

Current authoritative `main` does not establish:
- accepted native Android application/runtime behavior from Draft PRs #51–#63;
- accepted GLAZE UI V1.6 application migration or rendered/accessibility/device acceptance;
- accepted GoreeCloud Identity native application registration or native session exchange;
- authenticated Android provider transport, provider-backed Android mailbox reads/writes, or Android network authority;
- complete offline synchronization or local-authoritative mailbox behavior;
- production Gmail or IMAP/SMTP interoperability acceptance;
- complete Privacy Shield, Wardveil Security, Everkeep, Manager, Mesh, Identity, Policy, or Observability runtime acceptance;
- a production Linux desktop client or iOS client;
- protected production signing/provenance, Release Candidate qualification, Production Acceptance, or Stable qualification.

## Maintenance rule

When an open capability becomes accepted on authoritative `main`, reconcile this file, `PLANNED-FEATURES.md`, and `CHANGELOGS.md` in the same evidence-backed workflow. Green CI on an unmerged branch is not implementation authority.
