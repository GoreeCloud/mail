# GoreeCloud Mail — Capability Traceability and Acceptance Crosswalk

**Status:** Proposed planning aid — not an implementation inventory, approved release roadmap, or feature acceptance record.  
**As of:** October 10, 2026  
**Canonical product blueprint:** [GoreeCloud Mail — Features and Capabilities Catalog.docx](https://docs.google.com/document/d/1nkRDbhXr1PlkPRuKkCrFuAESKh15cNa5/edit) in `GoreeCloud / Feature Roadmap`. The Word file is authoritative for the proposed product scope.  
**Technical evidence:** [GoreeCloud/mail](https://github.com/GoreeCloud/mail); [fail-closed acceptance state](./acceptance/mail-security.json). GitHub owns live implementation, PR, CI and issue state.

## Interpretation rules

1. **All 25 domains below are target capabilities, not claims of delivery.** The source catalog includes 785 primary feature entries plus separate external-integration and optional-tracking proposals. Some inherited client behavior may exist; no feature-level acceptance is inferred merely because code or an automated test exists.
2. **Delivery class is a recommended assessment lane, not an approved schedule.** Core marks client work needed for the intended email-client experience. Optional or conditional lanes require separate approval and provider/platform feasibility checks. Provider-managed hosting, transport, business policy and retention must not be advertised as owned by Mail.
3. **Do not infer individual feature support from an aggregate domain row.** Each proposed item must eventually receive a trace to source, provider/platform prerequisites, implementation evidence, representative-device tests and release criteria.
4. **Security/privacy gates override proposed functionality.** Live `docs/acceptance/mail-security.json` controls current acceptance, not this crosswalk. A successful draft PR or Jasmine suite does not enable a release.
5. **No provider credentials or private message data should be used for ad hoc validation.** Use approved test accounts, synthetic messages, authorized connectors and safe test environments.

## Capability domains and acceptance evidence to gather

| # | Domain | Primary entries | Assessment lane (proposed) | Evidence required before claiming delivery |
|---:|---|---:|---|---|
| 1 | Email Account Management | 41 | Core / provider-dependent | Provider adapter contract, secure credentials, clean/returning-account login, cross-account isolation |
| 2 | Inbox Management and Organization | 48 | Core | Unified and per-account inbox behavior, flags/folders/labels, bulk actions, provider round trips |
| 3 | Email Reading and Message Viewing | 31 | Core / security-critical | HTML sanitization, remote-content opt-in, untrusted message, screen reader and invitation behavior |
| 4 | Email Composition and Sending | 49 | Core | Draft preservation, identities, sending acknowledgments, undo/schedule provider semantics, attachments |
| 5 | Productivity and Follow-Up Management | 29 | Core / integration-gated | Snooze/follow-ups, pending/done accuracy, Tasks contract and source-message linking |
| 6 | Email Search and Discovery | 33 | Core | Cross-account isolation, indexed/offline search consistency, provider differences and permission limits |
| 7 | Email Rules, Filters, and Automation | 31 | Core / provider-dependent | Idempotent rules, audit/preview, server-versus-client semantics, safe deletion/forwarding |
| 8 | Artificial Intelligence and Smart Assistance | 35 | Optional / separate approval | Model and architecture approval, per-action consent, sensitive-data limits, local/cloud transparency |
| 9 | Contacts and Address Book Management | 32 | Integration-gated | Authorized Contacts/CardDAV access, permissions, deduplication, recipient identity verification |
| 10 | Calendar, Events, Meetings, and Tasks | 36 | Integration-gated | Invitations, CalDAV/provider adapters, updates and timezones, Tasks/Calendar contract validation |
| 11 | Collaboration and Shared Email Management | 26 | Optional / separate approval | Mailbox delegation authority, roles, drafts/conflicts, isolation, auditability and recovery |
| 12 | Attachments and File Management | 34 | Core / security-critical | Traversal and filename defenses, safe preview, untrusted formats, size limits, offline cache |
| 13 | Wardveil Security and Email Threat Protection | 38 | Security foundation | Phishing/link/header evidence, tested renderer and attachment boundaries, no decorative-only claims |
| 14 | Email Encryption and Confidential Communication | 26 | Conditional / provider-dependent | TLS versus at-rest versus E2EE distinctions, key lifecycle, signing, interop and disclosure |
| 15 | Privacy Shield and Anti-Tracking Protection | 29 | Privacy foundation | Remote images blocked/defaults, telemetry inventories, link/tracker review, explicit third-party consent |
| 16 | Offline Email and Synchronization | 32 | Core / reliability-critical | Safe queue replay, provider-confirmed versus locally queued states, conflicts and restart recovery |
| 17 | Notifications and Alerts | 27 | Core / integration-gated | Sensitive previews, Notify approvals, per-account settings, mute/quiet hours and delivery semantics |
| 18 | Glaze User Interface and Personalization | 48 | Experience foundation | Rendered 1.7-line Glaze acceptance, keyboard/RTL/accessibility, responsive layouts and theme contrast |
| 19 | GoreeCloud Suite and External Integrations | 11 | Integration-gated | Written interfaces, least privileges, revocation, compatible providers, local/external ownership |
| 20 | Email Analytics and Communication Insights | 16 | Optional / privacy-gated | Local aggregation, no inferred recipient observation; tracking requires separate explicit approval |
| 21 | Business, Administration, and Enterprise Integration | 29 | Conditional / provider-dependent | Provider-managed policy boundaries, delegation, tenant isolation and honest admin capability claims |
| 22 | Advanced Technical and Desktop Capabilities | 35 | Platform foundation | Node-free isolated renderer, safe IPC/preload, provenance/signing, installer rollback, OS integration |
| 23 | Email Import, Export, Backup, and Recovery | 24 | Core / Everkeep-gated | Provider-authoritative coverage disclosure, portable export/import, integrity, recoverable migrations |
| 24 | Platforms and Cross-Device Experience | 34 | Platform-dependent | Independent platform scope; installed Linux desktop before unverified web/mobile/iOS claims |
| 25 | GoreeCloud Mail Architecture and Product Principles | 11 | Cross-cutting | Provider independence, account isolation, portability, authorization, transparent feature availability |

The `785` primary entries are the counts as indexed in the proposed catalog. They are not implemented-feature counts. Optional outbound tracking, collaboration services, advanced AI, mobile clients and provider-specific adapters are **not** default deliverables.

## Suggested, gate-driven work sequence (planning only)

**Foundation / fail-closed gates.** Resolve [P0 renderer isolation](https://github.com/GoreeCloud/mail/issues/2), [dependency and native-source provenance](https://github.com/GoreeCloud/mail/issues/4), provider authentication/OAuth flows, installed hostile-content/attachment tests, approved signed updates and rollback. Maintain account and user isolation plus Wardveil, Privacy Shield and Everkeep boundaries. Do not label the application production-ready based on source-only changes.

**Client baseline acceptance.** Verify supported provider login and removal, unified/per-account inboxes, message reading and composition, offline synchronization and recovery, search, attachment handling, notifications and desktop integrations. Define explicit supported-provider and platform matrices; separate provider-confirmed behavior from local UI state.

**Integrated workflows.** Validate GoreeCloud Contacts, Calendar, Tasks, Notify and Drive through approved capability contracts. Verify Glaze rendering and accessibility on actual supported client surfaces before treating UI consistency as accepted.

**Separately approved extensions.** Scope AI, team collaboration, advanced encryption, enterprise administration, analytics/tracking, mobile/web expansions and optional RSS/NNTP/chat only after architecture, product feasibility, security, privacy, consent, and provider-capability reviews.

## Verified development snapshot (not a feature-acceptance statement)

- Combined privacy/security code draft [PR #33](https://github.com/GoreeCloud/mail/pull/33) passed exact-head source-patch, static and Jasmine CI at `9c00d319` ([run 38086570127](https://github.com/GoreeCloud/mail/actions/runs/38086570127), 2,498 passing Jasmine specs).
- Combined IPC development draft [PR #37](https://github.com/GoreeCloud/mail/pull/37) passed all three exact-head CI jobs at `121200f336e68965350588032435ec5256cc59d8` ([run 38091614701](https://github.com/GoreeCloud/mail/actions/runs/38091614701), 2,498 passing Jasmine specs). This is isolated source/CI evidence; it does **not** resolve renderer P0 acceptance.
- At the verified snapshot, release acceptance remains `productionEligible: false` and `releaseEligible: false`; `mainRendererContextIsolation` and `runtimeDependencyAudit` remain blocked. Provider OAuth/SSO, hostile-content installed-desktop tests, Glaze accessibility, and signed installer/rollback remain unverified. Native source and SQLite migration is CI-only.
- **Recheck GitHub and `docs/acceptance/mail-security.json` before any status or acceptance update.** This dated snapshot is not a live status monitor.

## Trace record template for a future per-feature ledger

A feature can be marked accepted only with a corresponding record of: catalog section and entry; owning capability; client/platform/provider scope; required privacy/security/consent design; source PR/commit; unit, integration and installed-device test evidence; accessibility/localization review where applicable; exact-head CI; rollback/data migration proof where applicable; release-gate decision; and date/approver. Until then use **Proposed**, **Candidate**, **Blocked**, or **Unverified**; never automatically mark **Delivered**.

**Architecture boundary:** external providers own mailbox hosting and Internet email transport; GoreeCloud Mail owns only the approved client behavior, subordinate local state, and its authorized integration contracts.
