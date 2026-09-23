# GoreeCloud Mail — Implemented Features

**Record type:** Repository implemented-feature inventory  
**Repository:** `GoreeCloud/mail`  
**Lifecycle:** Development / nonconformant  
**Repository version:** `0.1.0-dev`  
**Migration state:** Complete on authoritative `main`; PR #64 merged as `9e0220856782ca4d19ade7fd7ced53507a581b80`, exact-main Validate GoreeCloud Mail #190 and CI #755 passed, and the mapped legacy Drive roadmap/changelog sources were permanently retired and independently verified absent on September 22, 2026.  
**Current source checkpoint:** PR #70 integrated at `548a21c33318a7ab7cc7e6c43defccf048b065e5` on `main`; the repository-native governance migration baseline remains `9e0220856782ca4d19ade7fd7ced53507a581b80`.  
**Pre-migration capability baseline:** `096f53da62c92567cd2fe949fe40a4f6e946a68c`; PR #64 changed documentation/governance only.  
**Governing standard:** Standard — Repository Feature Tracking and Changelog Governance v1.0.

## Interpretation

This record describes capabilities accepted on authoritative `main`. It does not promote open Draft pull requests, retired Drive roadmap wording, or superseded design-system targets into current implementation state.

Authoritative `main` includes the repository-native governance migration at `9e0220856782ca4d19ade7fd7ced53507a581b80`; its exact-main Validate GoreeCloud Mail #190 and CI #755 passed. Platform Contract 0.4 was subsequently integrated through PRs #68 and #69. PR #70 then integrated the bounded disconnected Android foundation as exact `main` `548a21c33318a7ab7cc7e6c43defccf048b065e5`. Its exact-head PR runs passed: Mail Android Client `35894182889`, CI `35894182896`, and Validate GoreeCloud Mail `35894182906`. Post-merge source readback was verified, but independent exact-new-main push-workflow and artifact verification is still open. Historical Draft PRs #60–#63 are unmerged provenance only; no connected Android mailbox or release authority follows.

## Implemented Development foundations

### Disconnected native Android Development source
- PR #70 integrated a Kotlin/Jetpack Compose Android Development build root, launcher shell and five-capability fail-closed status model.
- Development APK identity is `com.goreecloud.mail.dev`; minimum SDK 29, target SDK 36, Java 17. The manifest declares no `INTERNET` permission and disables backup and cleartext traffic.
- Exact-head PR CI passed JVM unit tests, lint, Development APK build, package/permission checks and retained an independently checksum-verified source-bound artifact. This is source/build evidence only, not physical-device or connected runtime acceptance.
- Native provider transport, Identity/session exchange, background synchronization, secure local store, notifications, attachments, Glaze application acceptance, protected signing and release approval remain unimplemented or unaccepted.

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
- Platform Contract schema 0.4 is accepted on `main` through PRs #68 and #69, with Development/nonconformant state and all nine Integral Platform Systems still requiring acceptance.
- Current `main` declares all nine Integral Platform Systems: Manager, Privacy Shield, Wardveil Security, Everkeep, GLAZE UI, Mesh, Identity, Policy, and Observability. All remain blocked or migration-required as recorded by the current contract.
- The accepted Platform Contract now uses canonical `GoreeCloud/mail`, requires GLAZE UI V1.6 / `1.6.0`, and pins central evaluator `e49b9afdea094c96a36a0457b1603f2fa8e8fa6b`. The implemented web presentation remains historical V1.1 Development source; the manifest target does not establish Mail-local Glaze acceptance.

## Explicitly not implemented or not accepted on current main

Current authoritative `main` does not establish:
- connected, provider-backed or production-accepted native Android application/runtime behavior; PR #70 integrates only a disconnected Development shell, while historical Draft PRs #51–#63 are not accepted current-main runtime capabilities;
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
