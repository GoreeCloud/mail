# GoreeCloud Mail — Legacy Drive Changelog History Part 08

**Source:** legacy Drive `Change Log — Mail.docx` (`1KFedQv6vx9TiZYabLu7u07CNFc15oVJf`)  
**Source non-empty paragraphs:** 351–400 of 699  
**Migration note:** Paragraph text below is preserved in source order. Historical lifecycle, branch, PR, validation, and acceptance statements apply only to their original dated context and do not override current authoritative repository state.

---

• After storage, Mail verifies that the stored SHA-256 equals both the provider-byte digest and accepted Wardveil evidence. Changed-during-scan or storage mismatch removes the new object and rejects the delivery record.

• Download authorization rechecks current clean evidence and digest binding rather than treating a prior clean result as permanent.

• The Mail Wardveil attachment contract advanced to version 0.3.0.

Validation and merge: Exact PR head 856049b149d31c8fc80ba0f902058bf8bfcc9348 passed Mail CI #278 / workflow run 33250577107 and Validate GoreeCloud Mail #16 / workflow run 33250577103. PR #8 was squash-merged as b16b3742c5d48ebf5e5f2376ce5a993a2593f653. The exact tested and merged revisions share Git tree e7b8127b19b5dc2f7274c82ba561b0c988a78e57.

Acceptance boundary: This milestone proves source-level application enforcement only. At this point durable scan provenance after service restart, deployed Mail execution against the hardened Wardveil service, production GoreeCloud Identity service credentials/key lifecycle, durable distributed replay protection, authorized quarantine execution, Audit/Security Center provenance, Privacy Shield acceptance, Everkeep treatment, and production deployment remained unaccepted.

August 29, 2026 at 6:48 AM CDT — Durable Wardveil Scan Provenance Across Mail Service Restart

Change type or category: Native security integration; durable security provenance; attachment lifecycle; restart safety; privacy minimization; source validation.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; PR #9; source-development environment only; no production runtime deployment.

Summary and purpose: I closed the process-restart provenance gap without turning Mail application state into Wardveil Audit. Current clean Wardveil Scan provenance can now survive service recreation through a private, minimized attachment-sidecar format while retaining original evidence validity and fail-closed behavior.

Changes completed:

• Added server/attachment-scan-provenance-store.js and direct storage tests.

• Added schema-version-1 JSON provenance sidecars under the private attachment root, bounded to 64 KiB, atomically written, and created with file mode 0600.

• Durable provenance is clean-only and stores only attachment-object binding, scan record ID, correlation ID, producer ID, observation time, validity deadline, SHA-256 content digest, and bounded evidence references.

• Raw attachment content, filenames/message bodies, provider credentials or tokens, Wardveil caller secrets, and unrestricted diagnostics are excluded.

• A SHA-256 integrity value detects corruption or uncoordinated modification before reuse. It is explicitly not represented as a production cryptographic signature or authenticated Wardveil Audit ledger.

• Restart authorization can rehydrate current clean provenance without issuing a new scan only while the original evidence is still valid and stored content remains digest-bound.

• Missing, malformed, oversized, wrong-object, corrupt, tampered, expired, or digest-mismatched provenance fails closed.

• Attachment deletion, expiry cleanup, and metadata-persistence rollback coordinate removal of both cached content and provenance.

• The Mail Wardveil attachment contract advanced to version 0.4.0. Automatic rescan after restart remains unimplemented because current durable provenance provides the bounded continuity path.

Validation and merge: Exact PR head 3cdd6596f38135f78542f9bcc2c525cb83f48f7c passed Mail CI #280 / workflow run 33250839472 and Validate GoreeCloud Mail #18 / workflow run 33250839490. PR #9 was squash-merged as 87f506bad7f704473e413b22f98dd56073db54ec. The exact tested and merged revisions share Git tree 90ae4b8dbfad54b1230e065bf8445ec886103490.

Acceptance boundary: Durable provenance is source-validated application-local security state, not production runtime acceptance. Production provenance-storage permission/lifecycle/corruption/recovery tests, deployed Wardveil Scan service execution, production Identity/key lifecycle, durable replay protection, live provider-byte binding and failure tests, authorized quarantine execution, Audit/Security Center provenance, Glaze UI security-state acceptance, Privacy Shield minimization, Everkeep backup/recovery treatment, and any broad Protected by Wardveil claim remain pending.

August 29, 2026 at 9:36 AM CDT — First-Party Mail Platform Scope Expansion and Native Capability Contract

Project: GoreeCloud Mail

Change Category: Product architecture, authoritative specification reconciliation, repository governance, Courier identity, native service-mode foundation, validation

Purpose

Reconcile GoreeCloud Mail with the newly approved native built-in feature and capability target that defines Mail as GoreeCloud's first-party email and communication platform rather than permanently limiting the product to an external-provider client. Preserve existing provider interoperability and current source-validated work while creating an explicit architecture path for GoreeCloud-hosted mail service capabilities without overstating runtime readiness.

Previous State

The authoritative Project Specification — Mail and Standard — Courier Identity explicitly defined GoreeCloud Mail as a client-only application that would not operate mailbox hosting, MX, SMTP delivery, or an independent mail service. The repository README and Courier manifest mirrored that boundary, including `emailServer: false`. The repository also lacked the required root SPECIFICATIONS.md, FEATURES.md, BENEFITS.md, and COMPETITIVE-OBJECTIVES.md documents. Current implementation evidence remained focused on the provider/client foundation, durable application state, Privacy Shield controls, and Wardveil Scan attachment-delivery enforcement/provenance.

Material Changes

1. Updated the authoritative Project Specification — Mail in Google Drive in place. The specification now defines two explicit operating modes: GoreeCloud-hosted service mode and external-provider interoperability mode. Existing external-provider work remains supported. Hosted mailbox, MX, inbound/outbound transport, custom-domain, alias, retention, administration, and related provider-level authority are approved product targets only as they are independently implemented and accepted.

2. Added section `27. Native Built-In Feature and Capability Target — August 29, 2026` to the Mail project specification. It records the approved capability domains for core inbox, organization, search, rules/automation, productivity, composition/sending, send controls, writing assistance, intelligent Mail, secure email, threat protection, privacy controls, account administration, deep GoreeCloud integration, hosted-service direction, and Mail's platform-service role.

3. Reconciled the authoritative Standard — Courier Identity in Google Drive. Courier remains the internal unified first-party mail capability framework under GoreeCloud Mail and is not a separate application, company, provider brand, or repository. Courier can now govern both GoreeCloud-hosted mail-service capabilities and compatible external-provider interoperability with explicit mode-specific authority.

4. Created GitHub branch `agent/mail-platform-capability-expansion` from exact prior main revision `87f506bad7f704473e413b22f98dd56073db54ec`.

5. Added native `server/mail-platform-capabilities.js` with explicit `goreecloud-hosted` and `external-provider` modes, capability inventories, fail-closed unsupported-mode handling, capability enforcement, and account-routing normalization that prevents hosted and provider identifiers from being silently mixed.

6. Added `tests/mail-platform-capabilities.test.js` covering hosted service capabilities, external-provider authority limits, fail-closed unknown modes, and identifier isolation between modes.

7. Updated `package.json` description from an email-client foundation to a GoreeCloud email and communication platform foundation.

8. Rebuilt repository `README.md` product-role and architecture sections so target scope, source-validated foundation, hosted-service requirements, Wardveil enforcement, platform-system obligations, and production limitations are accurately separated.

9. Added the four previously missing mandatory root repository documents: `SPECIFICATIONS.md`, `FEATURES.md`, `BENEFITS.md`, and `COMPETITIVE-OBJECTIVES.md`. These documents use explicit target/source-validated/acceptance language and do not present the approved feature inventory as already deployed.

10. Updated `docs/courier.md` and `docs/courier.identity.json`. The machine-readable Courier manifest is now schema version 2 with `supportsHostedMailService: true`, `supportsExternalProviderInteroperability: true`, and `hostedMailServiceProductionAccepted: false` instead of the stale client-only `emailServer: false` assumption.

11. Opened GitHub pull request #10, `Expand GoreeCloud Mail into first-party mail platform`, against `main` at exact head `713b8a3a9b41fd528d503c86b1bb1c8032fb00f0`.

Files and Documents Affected

Google Drive:

- GoreeCloud/Projects/Project Specification — Mail

- GoreeCloud/Standards/.../Standard — Courier Identity

- GoreeCloud/Changelogs/Change Log — Mail

GitHub repository `GoreeCloud/goreecloud-mail` branch `agent/mail-platform-capability-expansion`:

- README.md

- SPECIFICATIONS.md

- FEATURES.md

- BENEFITS.md
