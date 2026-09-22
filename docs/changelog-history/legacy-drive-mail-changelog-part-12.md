# GoreeCloud Mail — Legacy Drive Changelog History Part 12

**Source:** legacy Drive `Change Log — Mail.docx` (`1KFedQv6vx9TiZYabLu7u07CNFc15oVJf`)  
**Source non-empty paragraphs:** 551–600 of 699  
**Migration note:** Paragraph text below is preserved in source order. Historical lifecycle, branch, PR, validation, and acceptance statements apply only to their original dated context and do not override current authoritative repository state.

---

Bounded Outgoing Attachment MIME — Merged Development Milestone

Merged PR #20 to main as cadb7338d400f1fbf157a59e9912b67672e69fac after CI run 33272800684 and Validate GoreeCloud Mail run 33272800719 completed successfully.

Added deterministic bounded multipart/mixed Gmail composition for explicit trusted attachment bytes/canonical base64, including bounded count/per-file/total sizes, filename and MIME-type validation, path/header-control rejection, UTF-8 filename parameters, wrapped base64 transfer encoding, and nesting of the existing sanitized multipart/alternative rich-body path.

Acceptance boundary: no Wardveil Security scan execution, user-facing attachment acquisition, inline-image/content-ID support, real-provider attachment acceptance, production deployment, release, or Stable qualification is established by this milestone.

Outgoing Gmail Attachment Wardveil Gate — Merged Development Milestone

Merged commit: 64e1f3840ea284241444b18e448b218cec5e799e.

Added fail-closed Wardveil Scan authorization before Gmail attachment send/draft writes. The existing MIME builder validates composition first; Wardveil then scans the exact attachment bytes, requires current authoritative digest-bound clean evidence, and the same authorized buffers are serialized into the provider MIME write. Missing/unavailable/invalid/expired or non-clean scan state blocks transport before Gmail client creation. Non-attachment writes and existing ambiguous-write reconciliation remain unchanged.

This does not establish durable outgoing scan provenance, quarantine execution, production Wardveil SLA, real-provider attachment acceptance, deployment, release, or Stable qualification.

August 29, 2026 at 4:16 PM CDT — Durable Outgoing Wardveil Scan Provenance

Change type: Security enforcement, durable application provenance, contract advancement, and source validation.

GoreeCloud Mail PR #22 advanced the canonical Wardveil attachment integration contract to 0.5.0 and added durable minimized application provenance for attachment-bearing Gmail send, draft-create, and draft-update decisions. Exact validated attachment bytes remain scanned before provider write; only current authoritative clean evidence may proceed; the exact authorized bytes remain the bytes serialized into Gmail MIME.

Outgoing clean Scan provenance must now be durably persisted before Gmail client creation. Persistence failure fails closed and prevents the provider path. The schema-1 private operation sidecar is atomically written with mode 0600, bounded to 128 KiB, bound to an opaque SHA-256 operation identity plus exact resource/content digests, and stores only bounded scan/correlation/producer/time/evidence metadata. It excludes attachment filenames and raw bytes, recipient addresses, provider credentials/tokens, raw account/user identifiers, and Wardveil caller secrets. Its local SHA-256 integrity value is corruption detection only and the application sidecar is not Wardveil Audit.

Exact PR #22 head ae050ac6c2174ff914905006d46fa33fd79d9d16 passed Mail CI #496 / workflow run 33275373075 and Validate GoreeCloud Mail #96 / workflow run 33275373125. PR #22 squash-merged as f34d8270110b3f8f5a4e54d025d3c20cdd60735a; tested and merged revisions share Git tree 54874233bc4ea0707751bb5a85f8963ff25219ac.

Acceptance boundary: source-validated only. This change does not establish production authenticated provenance-storage acceptance, Wardveil Audit persistence, production GoreeCloud Identity service credentials/signing-key lifecycle, deployment-appropriate replay protection, deployed Wardveil Scan application-consumer acceptance, real Gmail attachment interoperability, authorized quarantine execution, release, Stable qualification, or a broad Protected by Wardveil claim.

August 29, 2026 — Bounded Browser Compose Attachment Materialization Merged

Repository: GoreeCloud/goreecloud-mail.

Pull request: #23 — Add bounded browser compose attachment materialization.

Final accepted head: be070119303ff4ca3b6fb2a578241e5599de7f56.

Merged authoritative main: 56f7082e980709bca3500ceac0e62d154ac50f62.

Change: added a browser File-to-compose attachment materializer that preserves exact selected bytes in the existing server-compatible contentBase64 shape, mirrors Gmail message-builder attachment bounds, normalizes simple media types, rejects unsafe filenames, and fails closed on declared-versus-read size changes. The repository README was reconciled with the already-merged rich MIME, outgoing Wardveil gate, and durable minimized outgoing scan provenance state.

Security boundary: browser checks are not outgoing-mail security authority. The Development web shell remains demo-provider-backed, and attachment selection is intentionally not wired into the demo sender. Trusted attachment-bearing Gmail writes still require complete server message validation, exact-byte Wardveil authorization, current clean evidence, and durable outgoing provenance before provider client creation.

Troubleshooting: exact head a0be517ed5c28b0224c66b02842e047f58147f17 passed Validate GoreeCloud Mail run 33281899546 but failed CI run 33281899636 because the new aggregate-size test used two files that each crossed the per-file limit, correctly triggering the earlier guard. The fixture was repaired on the same branch to use three individually valid files whose combined bytes exceed the aggregate limit. Final exact head be070119303ff4ca3b6fb2a578241e5599de7f56 passed Validate GoreeCloud Mail run 33281965460 and CI run 33281965454 before merge.

Acceptance boundary: authenticated provider UI activation, complete gateway mailbox reads, real Gmail attachment interoperability, production OAuth custody, production Wardveil service acceptance, quarantine execution, deployment, signed release, and Stable qualification remain unaccepted

August 29, 2026 — Browser Compose Attachment Selection Preview Merged

Repository: GoreeCloud/goreecloud-mail. PR #24 added multiple-file selection and local attachment preview to the Development compose dialog by reusing the existing bounded browser materializer. Rejected files clear the selection and surface bounded validation errors; accepted selections display filename, size, and normalized media type only.

Exact head 78fe1995a4bd73c1fa72037f554095ffd03816b8 passed Validate GoreeCloud Mail run 33287929244 and CI run 33287929239. PR #24 was squash-merged as 24dcd99222c57a931e36833125b7d22018b45255.

Security boundary: attachment-bearing sends remain blocked in the demo provider. The UI does not bypass authenticated provider routing or the existing Wardveil-gated server-side attachment write authority. Production provider connectivity, OAuth/credential custody, Wardveil runtime acceptance, deployment, release, and Stable qualification remain pending.

August 30, 2026 — Authenticated Browser Gateway Composition Merged

Repository: GoreeCloud/goreecloud-mail. Pull Request #25 added an explicit browser provider runtime that defaults to the local demo provider and activates authenticated GatewayMailProvider composition only when Development deployment metadata supplies a non-secret opaque account identifier plus a same-origin root-relative gateway base. Browser configuration rejects cross-origin URLs, query/fragment-bearing gateway bases, and does not accept reusable provider passwords, access tokens, or refresh tokens.

Attachment-bearing demo sends remain fail closed. In configured gateway mode, outgoing attachments reuse the existing server-compatible filename/contentType/contentBase64 shape; the trusted server remains authoritative for complete message validation, exact-byte Wardveil Scan authorization, current clean evidence, and durable minimized outgoing scan provenance before Gmail provider client creation. Current browser/Gmail bounds remain 20 attachments, 10 MiB per attachment, and 20 MiB total.

Validation history: initial candidate a3a399ba2ec9f091e8dec5c7452ad0415c7b5daf passed Validate GoreeCloud Mail but failed the broader provider-contract suite because an existing reader source-contract test still required an obsolete Development status sentence. The assertion was reconciled to the current bounded reader statement without removing or weakening its attachment-security checks. Repaired exact head 316064d0669806862d2a1e740b02859fb4deb3c4 passed Validate GoreeCloud Mail workflow run 33289357790 and CI workflow run 33289357834. PR #25 was squash-merged with expected-head protection as 72f0b159031b9b04167593adb40aeec162129a48.

Acceptance boundary: Development source/build evidence only. Production Gmail/OAuth connectivity, production credential custody, production GoreeCloud Identity browser sessions, real-provider attachment interoperability, production Wardveil runtime acceptance, deployment, signed release, and Stable qualification remain separate gates.

.

Browser Compose Draft Action Merged

PR #26 merged from candidate head a3a9f648eeb7f7a6c92c18321c10e54a70ce3480 to main as b5074fd10996e38020208c9b294d99576c78953c after Validate GoreeCloud Mail run 33320333416 and CI run 33320333415 both succeeded.

Added an explicit browser Save draft action through provider.createDraft. Authenticated gateway drafts reuse the existing server-authoritative Wardveil-gated attachment path; attachment-bearing demo drafts remain blocked with bytes local. The current Gmail builder still requires a recipient. No production, release, or Stable claim.

2026-08-30 — Browser Compose Cc/Bcc Controls — Development

Merged GoreeCloud/goreecloud-mail PR #27 to main as 8f20cdbe964f987cd9e1e1a12c5d71e10bfe8708 after exact-head validation on ccd5b2dc6a1b24153c9d28182d244daa19e37dd8. Validate GoreeCloud Mail run #108 and CI run #540 passed.

Added multiple To-recipient support plus optional Cc and Bcc fields to the browser composer. Non-empty Cc/Bcc values now pass through the existing provider-independent draft/send payloads while preserving the current authenticated gateway and attachment-security boundaries.

Status: Development. No claim of production provider interoperability, production credential custody, deployment acceptance, or Stable qualification

August 30, 2026 — Wardveil Runtime Application-Consumer Acceptance Tooling Merged

Repository: GoreeCloud/goreecloud-mail.

Pull request: #29 — Add Mail Wardveil runtime application-consumer acceptance.

Exact validated PR head: 4b5dd26b9289d1879e013dd11a5dbabca9834d5b.

Validation: CI #558 / workflow run 33354238080 — success; Validate GoreeCloud Mail #111 / workflow run 33354238060 — success. The dedicated runtime-tooling validator, existing Wardveil attachment-security validation, complete Node test suite, Glaze checks, and static secret-safety checks passed. No review submissions or unresolved review threads were present.

Merged authoritative main: bf7ccdee512d335d33e2877e7b5c459f8fe7286c, squash-merged with expected-head protection.

Change: added a source-controlled target-environment Wardveil application-consumer acceptance harness and CLI. The harness composes the real Mail AttachmentDeliveryService, GmailAccountService, GmailOutgoingAttachmentSecurityGate, Gmail MIME construction path, durable incoming/outgoing provenance stores, and WardveilScanClient contract. It defines incoming clean and EICAR controls plus outgoing Gmail send and draft clean/EICAR controls.

Acceptance design: provider I/O inside this runner is deliberately controlled and non-networked. A target run can therefore prove Mail application enforcement against the deployed Wardveil Scan service without pretending to prove a real Gmail mailbox write. Clean incoming content must be scanned before downloadable storage, remain exact-byte bound, persist private mode-0600 clean provenance, authorize download, and clean up coherently. Incoming EICAR must fail closed before downloadable cache/provenance. Clean send/draft controls must reach the controlled provider only after live Wardveil authorization, exact authorized MIME bytes, and mode-0600 durable outgoing provenance. EICAR send/draft controls must fail before provider-client creation or provider write and must not create clean provenance.

Credential and evidence boundary: the target command accepts the Wardveil caller secret only from a root-owned regular non-symlink file with mode 0400 or 0600, never prints it, and creates sanitized evidence exclusively with mode 0600. Shared evidence explicitly excludes raw attachment bytes, provider credentials, and the Wardveil caller secret.

Current state: source/tooling acceptance is complete at exact Mail main bf7ccdee512d335d33e2877e7b5c459f8fe7286c. Target-environment execution against the deployed Wardveil Scan runtime remains pending. A successful controlled-provider run will not establish real Gmail provider execution, production GoreeCloud Identity service identity/key lifecycle, revoked-credential behavior, stale signatures, capacity/concurrency exhaustion, authorized Quarantine execution/readback, Wardveil Audit/Security Center provenance, Privacy Shield runtime acceptance, Everkeep recovery treatment, Stable qualification, overall production runtime acceptance, or a broad Protected by Wardveil claim.
