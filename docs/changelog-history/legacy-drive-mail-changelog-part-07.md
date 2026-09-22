# GoreeCloud Mail — Legacy Drive Changelog History Part 07

**Source:** legacy Drive `Change Log — Mail.docx` (`1KFedQv6vx9TiZYabLu7u07CNFc15oVJf`)  
**Source non-empty paragraphs:** 301–350 of 699  
**Migration note:** Paragraph text below is preserved in source order. Historical lifecycle, branch, PR, validation, and acceptance statements apply only to their original dated context and do not override current authoritative repository state.

---

• Added configurable positive attachment TTL handling and fail-closed expiry checks during download authorization.

• Download authorization now derives the attachment path only from the trusted storage root and a validated opaque object identifier, rechecks user ownership through durable state, and records the access timestamp.

• Added cleanupExpired to process bounded expired-record batches, remove stored attachment bytes, and then remove the matching durable metadata record.

• Added rollback cleanup when durable metadata persistence fails after attachment bytes have been written so a failed database write does not leave an orphaned object behind.

• Extended tests/attachment-delivery-service.test.js with durable service-recreation behavior, access timestamp recording, expiry denial, byte-and-metadata cleanup, and persistence-failure rollback coverage while retaining cross-user denial and ownership-scoped removal tests.

• Updated Draft PR #1 to record the durable attachment-delivery wiring and retention-cleanup milestone.

Security and privacy state: No real Gmail account, mailbox content, attachment, access token, refresh token, OAuth secret, IMAP/SMTP credential, DNS record, Caddy route, production service, or email-server functionality was introduced. Tests use synthetic provider bytes, synthetic user/account identifiers, and temporary attachment directories only. Attachment metadata continues to exclude reusable provider secrets and persisted filesystem paths.

Validation state: Source changes are committed at exact head 3e538a5528770439ffa8f4b8d45250570c050bf3. GitHub Actions CI run #212 / 32628786885 was queued when this entry was recorded, so this exact head is not yet recorded as CI-validated. Production acceptance remains separate from source CI.

Current state: Draft PR #1 remains open, mergeable, and intentionally draft. Retention cleanup execution is now implemented at source level. Remaining attachment priorities include isolated PDF/image preview execution, archive handling, representative attachment acceptance, target-host storage/recovery rehearsal, and controlled real-provider integration only after those boundaries are validated.

Platform-Wide Native Application Governance Reconciliation

I updated this project's authoritative direction to require native-from-the-ground-up GoreeCloud-owned application development, permit only narrowly bounded critical foundational dependencies, and require current Glaze UI, Wardveil Security, Privacy Shield, and Everkeep integration as mandatory Stable gates. This entry records documentation and governance reconciliation only; it does not claim that the repository, artifacts, deployment, or runtime have already completed the native rebuild or all four current integrations.

August 27, 2026 — Wardveil Attachment Scanning Consumer

Change type or category: Native security integration; attachment scanning; Wardveil Security; fail-closed evidence handling; quarantine handoff; CI validation.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; PR #3; source-development environment only; no production runtime deployment.

Summary and purpose: I added GoreeCloud Mail's first executable Wardveil Scan consumer for attachment security while keeping Mail independent from ClamAV or any other scanner engine. Mail consumes Wardveil scan evidence rather than connecting directly to clamd.

Changes completed:

• Added reference/mail_attachment_security.py and a Mail-specific Wardveil attachment-scan contract.

• Bound scan evidence to the canonical mail_attachment resource scope and the exact SHA-256 digest of the attachment bytes.

• Allowed open/download only when scan evidence is authoritative, current, correctly scoped, digest-matched, and clean.

• Suspicious attachments are held for review without being promoted to confirmed malware.

• Malicious attachments are blocked and produce a non-destructive Wardveil Quarantine handoff; Mail does not delete or quarantine content directly.

• Unknown, unsupported, stale, mismatched, future-dated, or unverifiable evidence fails closed rather than being treated as clean.

• Added 10 dependency-free attachment-security tests, integration-contract validation, exact-revision CI, and README/documentation updates.

Validation and merge: GoreeCloud Mail CI run #1 completed successfully on exact PR head 6b2a25e5360695401b69f446d35e25b4038d8ffa. PR #3 was squash-merged into main as de4b0844c4973a80c11854318956d50536ddbb9e.

Security and privacy boundary: Shared Wardveil evidence excludes raw attachment bytes and provider credentials or tokens. Provider-side message state remains provider-owned unless an explicitly authorized provider adapter supplies execution evidence. Quarantine remains distinct from deletion.

Current state: The source consumer is merged and validated, but production acceptance remains pending. Required remaining evidence includes deployed authenticated Mail-to-Wardveil communication, live scanner health, controlled clean/malicious/suspicious/failure tests, verified provider attachment retrieval and digest binding, authorized quarantine execution, Glaze UI security-state acceptance, Privacy Shield validation, and applicable Everkeep behavior.

August 28, 2026 — Application Foundation Reconciled with Current Platform Security Contracts

The long-running GoreeCloud Mail application-foundation branch was reconciled with current main without discarding either line of work. Current-main Wardveil, Glaze UI, platform-conformance, provider-architecture, branding, and validation artifacts were merged into the executable client/server foundation, with the foundation README retained as the only conflict resolution and then updated to expose the required Wardveil attachment-scanning boundary. Mail also added an executable browser attachment-security presentation mapper that enables open/download only for authoritative current clean evidence with evidence references and otherwise fails closed to held, blocked, or verification-unavailable states. The UI copy avoids absolute safety claims. Exact head f5c2746339e2837d4e3c5ed734828b260e3fbea1 passed CI #258 and Validate GoreeCloud Mail #9. With no unresolved review threads, pull request #1 was promoted from Draft and merged with expected-head protection to main as 9a7b01433002939f774fbbe777ad5d86770708b8.

Acceptance boundary: the merge establishes the development source foundation on main only. It does not establish real-provider connectivity, target-host secret-store acceptance, production sanitizer acceptance, database recovery acceptance, operational Wardveil quarantine-executor acceptance, native packaging, target-environment acceptance, or production deployment.

August 28, 2026 — Wardveil Attachment Decisions Wired into Mail Reader

GoreeCloud Mail moved the reviewed Wardveil/Glaze attachment-security presentation contract into the actual development message reader. The reader now renders attachment security state, evidence, and action availability through presentAttachmentSecurity using DOM text APIs; Open and Download remain disabled unless authoritative current clean evidence permits them. The local demo provider exercises both clear and held states, and even an authorized demo action stops at an explicit unconnected-transport boundary instead of simulating delivery. Dedicated attachment-security styles and Node tests cover accessible markup, fail-closed button wiring, demo decision states, and the no-innerHTML boundary. Exact pull-request head 9aa3e1102480ce848dcb33f5b26069606b0b3582 passed CI #267 and Validate GoreeCloud Mail #11. Pull request #5 was merged with expected-head protection to main as 866aedf1a4ce3cdee4cd05ed519e6f79f77c4578.

Acceptance boundary: this is development-reader integration only. It does not connect real provider attachments, execute downloads or previews, establish production Wardveil runtime acceptance, approve a quarantine executor, complete native packaging, or authorize deployment.

August 29, 2026 at 6:31 AM CDT — Hardened Wardveil Scan Consumer Transport

Change type or category: Native security integration; Wardveil Scan authenticated transport; attachment security; exact-source validation; application-consumer adoption evidence.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; source integration only; no Mail production runtime deployment or production protection acceptance.

Implementation: GoreeCloud Mail added server/wardveil-scan-client.js as the concrete application-side client for the hardened Wardveil Scan 0.1.0 transport. Requests are restricted to explicit IPv4 loopback HTTP /v1/scan, redirects are refused, and the request signature binds caller ID, key ID, timestamp, nonce, action, mail_attachment resource identity, correlation ID, exact byte length, and SHA-256 content digest. Responses are size-bounded and must preserve exact resource, digest, correlation, authoritative producer, and scope binding. Mail remains engine-independent and never connects directly to ClamAV.

Contract reconciliation: The Mail attachment consumer contract advanced to 0.2.0. The canonical application record field is scan_record.result; the older scan_result field now fails closed. Clean remains usable only with current authoritative evidence and exact content binding. Suspicious remains held for review. Malicious remains blocked and may create only a non-destructive Wardveil Quarantine handoff requiring explicit executor authority. Unknown and unsupported remain blocked/unverified.

Validation and merge: Exact Mail head 3aa6b36902397745fc2ba83273f10698167b4e33 passed Mail CI run #275 / workflow run 33250097176 and Validate GoreeCloud Mail run #13 / workflow run 33250097184. The initial draft PR #6 wrapper was closed without source change after the available ready-for-review connector mutation failed at the GitHub schema layer. The identical tested branch was reopened as non-draft PR #7 and squash-merged with expected-head protection as 93c103222cfd254f7950fb5b176172901a354dfb. The tested and merged revisions share exact Git tree 31c0087d527ca111c5da4b67f126d69f22475c39.

Wardveil adoption evidence: Wardveil Security PR #98 refreshed the canonical Mail consumer-source evidence to the current signed transport and restored explicit Mail and Drive consumer-evidence validators to the Foundation CI workflow. Exact Wardveil head 73395f92e83601a84259b079396d3aed60c142dd passed Foundation run #292 / workflow run 33250248494 and authenticated Scan transport run #13 / workflow run 33250248510. PR #98 was squash-merged as e6d3e8bb7eed3bfd68b833b3f5306050563c7762; tested and merged Wardveil revisions share Git tree 9f09fa3aeaeef4809920076ce9320f5e252b1aba.

Acceptance boundary: Production runtime remains unaccepted. This milestone does not prove deployed Mail execution against Wardveil Scan, production GoreeCloud Identity service credentials or signing-key lifecycle, distributed durable replay protection, provider byte-binding acceptance, authorized quarantine execution, full negative/failure-path runtime acceptance, Security Center/Audit provenance acceptance, Privacy Shield runtime acceptance, applicable Everkeep acceptance, or a broad Protected by Wardveil claim.

August 29, 2026 at 6:38 AM CDT — Wardveil Scan Enforced in Trusted Attachment Delivery

Change type or category: Native security integration; Wardveil Scan application enforcement; attachment delivery; fail-closed content handling; source validation.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; PR #8; source-development environment only; no production runtime deployment.

Summary and purpose: I moved Wardveil Scan from a hardened standalone Mail transport/client boundary into the actual trusted attachment-delivery path. The purpose is to ensure provider attachment bytes cannot become a downloadable Mail cache object merely because a security presentation exists; the application service itself must obtain and enforce a current authoritative Wardveil decision bound to the exact content.

Changes completed:

• AttachmentDeliveryService now requires a Wardveil Scan client.

• Exact provider attachment bytes are submitted to Wardveil with lifecycle action download before downloadable storage is accepted.

• Only a current authoritative clean result with exact resource, scope, evidence, validity, correlation, and SHA-256 content binding may continue.

• Malicious, suspicious, unknown, unsupported, invalid, expired, and scanner-unavailable outcomes fail closed before downloadable storage.

• A malicious result may expose a bounded non-destructive quarantine-required decision, but Mail does not execute quarantine directly.
