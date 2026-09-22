# GoreeCloud Mail — Planned Features

**Record type:** Repository planned/open feature inventory  
**Repository:** `GoreeCloud/mail`  
**Lifecycle:** Development / nonconformant  
**Repository version:** `0.1.0-dev`  
**Migration state:** Complete on authoritative `main`; PR #64 merged as `9e0220856782ca4d19ade7fd7ced53507a581b80`, exact-main Validate GoreeCloud Mail #190 and CI #755 passed, and the mapped legacy Drive roadmap/changelog sources were permanently retired and independently verified absent on September 22, 2026.  
**Governance baseline:** repository-native records accepted on `main` at `9e0220856782ca4d19ade7fd7ced53507a581b80`; the migration changed documentation/governance only.  
**Current GLAZE UI target:** Official Stable V1.6 / `1.6.0`, published from source `a7180679ea851389e0f3004515f9a25f420e716d`.  
**Governing standard:** Standard — Repository Feature Tracking and Changelog Governance v1.0.

## Purpose and migration sources

This file carries forward material planned, partial, blocked, deferred, acceptance-gated, or future capability obligations from:
- the retired former root `FEATURE-ROADMAP.md`, preserved through Git history;
- retired legacy Drive `FEATURE-ROADMAP.docx` (`1C9HNOKLlRFBEiomCA6Uf-2TmJMDyEvoy`), whose migrated dispositions are preserved below;
- current repository `README.md`, `FEATURES.md`, `SPECIFICATIONS.md`, and accepted Platform Contract evidence;
- current live GitHub repository identity and open Draft candidate evidence; and
- verified current GLAZE UI release authority.

The retired legacy roadmap namespace `GoreeCloud/goreecloud-mail` is stale. Current live repository identity is `GoreeCloud/mail`.

Open Draft pull requests remain candidate-only. The current direct-main candidate line through PRs #60–#63 is not implementation authority, and older open stacked Drafts are likewise not accepted current behavior.

## Priority open obligations

### P0 — Provider authority, authentication, and production interoperability
- Preserve external providers as authoritative for mailbox hosting, mailbox contents, delivery state, provider policy, and Internet mail transport unless a future explicit architecture decision changes that boundary.
- Complete real-provider Gmail and standards-based IMAP/SMTP authorization, credential custody, account isolation, provider transport, failure-mode, and production interoperability acceptance.
- Keep GoreeCloud Identity application authentication separate from external-provider authorization.
- Establish governed native Mail application registration and native session exchange before any native provider transport is activated.

### P0 — Native Android authority and current Draft stack
- The current direct-main Draft line (#60–#63) remains candidate-only: Platform Contract 0.4 reconciliation, disconnected Android foundation, Mail-local GLAZE UI V1.6 source boundary, and fail-closed session-binding readiness are not accepted on `main`.
- Complete exact-field provider-account decoding/transport, authenticated provider access, local protected storage, background synchronization, push/notifications, attachment runtime, provider-backed mailbox operations, and degraded/offline behavior only after their authority prerequisites are accepted.
- Preserve no-network/fail-closed Development behavior until the required Identity/provider/privacy/security boundaries are independently satisfied.

### P0 — GLAZE UI V1.6 migration and accessibility
- Migrate supported Mail surfaces to current Official Stable GLAZE UI V1.6 / `1.6.0`.
- The accepted `main` control plane still records an older V1.1 source/compatibility plane; Draft PR #62 carries a V1.6 Android source boundary but remains unmerged.
- Complete repository-local rendered, keyboard, screen-reader, large-text/reflow, RTL/localization, Reduced Motion, Reduced Transparency, Increased Contrast, Touch Assistance, form-factor, representative-device/desktop, performance, rollback, and Human Visual Excellence acceptance.

### P0 — Security, privacy, continuity, and platform-system acceptance
- Complete Privacy Shield runtime/policy integration and production privacy acceptance.
- Complete Wardveil production identity/credential lifecycle, real-provider execution, authoritative audit/provenance, quarantine coordination, and broad production acceptance.
- Complete Everkeep backup scope, restore implementation, target-environment recovery drills, rollback, and continuity acceptance for authorized Mail-owned state.
- Complete applicable Manager, Mesh, Identity, Policy, Observability, and other governed platform-system integration without transferring external-provider authority into GoreeCloud Mail.

### P0 — Offline synchronization and account isolation
- Complete bounded cache windows, incremental synchronization, queued drafts/actions, retries/idempotency, conflict reconciliation, attachment caching, explicit queued-versus-provider-accepted state, and failure recovery.
- Preserve strict account/user isolation across messages, caches, indexes, attachments, credentials, notifications, synchronization, and any server-side service boundaries.

## Product capability backlog

### Core mailbox and message workflows
Complete the provider-backed multi-account inbox, conversation/thread behavior, folders/labels, archive/move/delete/spam/flag/read-state, bulk actions, search, attachments, sender identity, notifications, and provider-specific capability adaptation across supported surfaces.

### Organization, automation, productivity, and search
Continue the target inventory for labels/categories, priority/focused/split inboxes, saved/smart searches, provider-assisted search, rules, unsubscribe/cleanup, snooze/reminders/follow-up, reply queues, and other workflow automation without manufacturing provider capabilities.

### Composition and sending
Complete rich/plain composition, inline media, attachments, sender identities and aliases, Reply All, production threading, signatures, groups, templates/snippets/placeholders, scheduled send, Undo Send, delivery timing, and only those receipt/open-status features that the provider/standard can truthfully support.

### Writing and intelligent assistance
Add writing assistance, summarization, prioritization, classification, digests, contextual drafting, attachment filing, newsletter management, and mailbox insights only under explicit Privacy Shield authorization, bounded data authority, and truthful model/provider/runtime state.

### Secure mail and privacy controls
Implement eligible OpenPGP/PGP-MIME, S/MIME, signatures, encrypted drafts/attachments, protected subjects where supported, Autocrypt, client-side encryption, protected local/cache storage, tracking protection, remote-content privacy, aliases, and enforceable protected-message controls with explicit metadata and endpoint limitations.

### GoreeCloud integrations
Integrate Contacts, Calendar, Tasks, Notes/Memos, Notify, Search, Drive, Sync, Location, Backups, and other approved GoreeCloud systems through documented authority-preserving interfaces rather than shared internal databases or implicit authority transfer.

### Linux and iOS
- Complete a first-party Linux desktop client with desktop notifications, mailto integration, attachment workflows, keyboard efficiency, offline behavior, packaging, accessibility, and operating-system integration.
- Treat iOS as a long-term target until provider/authentication/synchronization/security/privacy architecture and primary clients are sufficiently stable and accepted.

### Release and production acceptance
Complete monitoring, privacy/security evidence, backup/recovery, dependency and vulnerability management, controlled signing/provenance, upgrade/rollback, representative environment acceptance, release approval, Release Candidate qualification, Production Acceptance, and Stable qualification on exact revisions.

## Legacy roadmap migration disposition

Every retired legacy Drive roadmap identifier is accounted for below.

| Legacy ID | Disposition under repository-native governance |
| --- | --- |
| FR-001 | Superseded as an active roadmap-control row by the maintenance rules in the three repository-native records; ongoing feature-state reconciliation remains required. |
| FR-002 | Continues as GoreeCloud Tasks Management governance where work remains actionable; it is not a product feature. |
| FR-003 | The evidence-backed lifecycle rule remains. Its repository/Drive synchronization requirement is superseded: Drive roadmap/changelog mirroring is prohibited after verified migration. |
| FR-010 | Continues as the provider-independent product boundary. No GoreeCloud mailbox-hosting/MX/Internet-delivery provider authority is accepted. |
| FR-011 | Partial Development foundation is implemented on `main`; production provider capability acceptance remains open. |
| FR-012 | Gmail and IMAP/SMTP adapter foundations exist on `main`; real-provider production execution remains open. |
| FR-013 | Trusted application identity boundaries exist on `main`; native registration/session work remains open. PRs #59/#63 are candidate-only and do not establish runtime registration. |
| FR-014 | Remains blocked. No accepted Android provider network transport exists on authoritative `main`. |
| FR-015 | Partial web/Gmail Development foundations exist; full provider-backed mailbox/message/compose/attachment/notification workflow acceptance remains open. |
| FR-016 | Partial Wardveil Development and controlled-provider evidence exists; complete real-provider and production acceptance remains open. |
| FR-017 | Privacy-oriented remote-content/message policy foundations exist; complete Privacy Shield runtime/product acceptance remains open. |
| FR-018 | Durable sync/idempotency foundations exist; complete offline synchronization, queues, conflicts, caching, and recovery remain open. |
| FR-019 | User/provider-account isolation foundations exist; complete production cross-user/cross-account evidence remains open. |
| FR-020 | Remains planned/incremental cross-application integration. |
| FR-021 | Partial attachment hardening and Wardveil gating exist; full provider/device/production acceptance remains open. |
| FR-022 | Remains planned; no production Linux desktop client is accepted. |
| FR-023 | Remains open. Native Android work exists only in unmerged Draft lines and is not accepted current-main behavior. |
| FR-024 | Remains open. Provider-account read/decoder work exists only as Draft candidate history; current direct-main stack has not accepted provider transport. |
| FR-025 | Remains blocked on Identity/session, provider transport, offline synchronization, storage, privacy, and security prerequisites. |
| FR-026 | Updated from stale V1.4 wording to current Official Stable GLAZE UI V1.6 / `1.6.0`; full Mail migration and application acceptance remain open. |
| FR-027 | Remains open across monitoring, security/privacy, continuity, signing/provenance, rollback, release, production, and Stable gates. |
| FR-028 | Remains long-term product direction only; no accepted iOS implementation is claimed. |

## Repository-governance obligations

- Do not recreate `FEATURE-ROADMAP.md`.
- Do not recreate, synchronize, mirror, back up, or maintain a Mail roadmap or changelog in Google Drive.
- Keep `IMPLEMENTED-FEATURES.md`, this file, and `CHANGELOGS.md` current in the same governed change when lifecycle state materially changes.
- Preserve open Draft/candidate evidence without promoting it to accepted implementation.
- Use current live repository identity `GoreeCloud/mail` in active records; retain `GoreeCloud/goreecloud-mail` only where historical provenance requires it.

## Maintenance rule

A capability remains here until its defined implementation and acceptance scope is complete. When accepted on authoritative `main`, update `IMPLEMENTED-FEATURES.md`, reconcile/remove the corresponding active obligation here, and record the meaningful event in `CHANGELOGS.md`.
