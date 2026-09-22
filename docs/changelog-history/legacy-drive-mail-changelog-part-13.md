# GoreeCloud Mail — Legacy Drive Changelog History Part 13

**Source:** legacy Drive `Change Log — Mail.docx` (`1KFedQv6vx9TiZYabLu7u07CNFc15oVJf`)  
**Source non-empty paragraphs:** 601–650 of 699  
**Migration note:** Paragraph text below is preserved in source order. Historical lifecycle, branch, PR, validation, and acceptance statements apply only to their original dated context and do not override current authoritative repository state.

---

.

2026-08-30 — Reply and Forward Compose Shortcuts — Development

Merged GoreeCloud/goreecloud-mail PR #28 to main as 71690aa6d8087626002bbacc16fd9784ed6d10d4 from exact tested head 65b9635795bba07df3c161d12a6587e0ad7060cc. Validate GoreeCloud Mail run #110 and CI run #552 passed.

Added reader-level Reply and Forward actions backed by deterministic plain-text compose context. Reply targets the selected sender and quotes the original body; Forward leaves recipients empty and builds a plain-text forwarded header. Existing Re:/Fwd: prefixes are not duplicated.

Security boundary: original attachments are not copied automatically and continue to require explicit selection through the existing Wardveil-gated compose path. Status: Development; Reply All, provider-thread semantics, production interoperability, deployment acceptance, and Stable qualification remain outside this milestone.

August 30, 2026 — Wardveil Mail Caller Provisioned on Target VPS

Change type or category: Target-runtime security configuration; Wardveil authenticated transport; Mail application-consumer prerequisite.

Affected environment: goreecloud-vps-01; deployed Wardveil Scan 053c7fd81db3011cf1d7b7b304d4b33413e97e4b; GoreeCloud Mail target acceptance for authoritative current main 71690aa6d8087626002bbacc16fd9784ed6d10d4 (direct descendant of acceptance-tooling merge bf7ccdee512d335d33e2877e7b5c459f8fe7286c).

Runtime result: the existing goreecloud-drive / scan-current caller remained unchanged. A separate goreecloud-mail / scan-current caller was added with only mail_attachment scope and active=true. The Wardveil caller registry remained root:root mode 0400. A separate Mail caller secret was created at /etc/goreecloud/mail/wardveil-scan.secret as a regular root-owned mode-0400 file; only safe metadata was emitted and no secret value was recorded.

Wardveil restart and probe: wardveil-scan.service restarted successfully, systemd InvocationID changed, the service returned healthy on the same exact 053c7fd... release, Scan remained on 127.0.0.1:8791, ClamAV remained on 127.0.0.1:3310, and a correctly signed goreecloud-mail mail_attachment clean control returned an authoritative clean result.

Current boundary: this closes the Mail caller-credential prerequisite only. The full Mail current-main 71690aa6d8087626002bbacc16fd9784ed6d10d4 target application-consumer matrix has not yet executed because Node.js >=22 is not installed on the VPS and no Mail acceptance release is staged. Real Gmail provider execution, production OAuth/credential custody, production Identity/key lifecycle, broad production runtime acceptance, and Protected by Wardveil claim authority remain unaccepted.

2026-08-30 — Functional Mailbox Navigation and Scoped Browser Search — Development

Merged GoreeCloud Mail PR #30 from exact tested head 72770ee37f87bd913368a532b5ccec43fc4186c3. Browser mailbox buttons now load their selected provider mailbox, active selection is stateful, stale mailbox responses are generation-guarded, reader selection resets on mailbox changes, and browser search filters only the currently loaded mailbox snapshot. The demo provider now exposes distinct Inbox/Starred behavior with in-memory flag state instead of returning every demo message for every mailbox.

Validation evidence: Validate GoreeCloud Mail #114 — success; CI #570 — success. Squash merge main SHA: 3b65edf03ab773eb818c344db4435543247c3a5d.

Classification: Development. No production provider acceptance, full mailbox parity, server-side mailbox-scoped search, signed release, or Stable claim.

2026-08-30 — Provider-Backed Reader Archive and Message Removal — Development

Merged PR #31 from exact tested head 8797af2d050af847090d3de47c03424a30de3189. Validate GoreeCloud Mail #116 and CI #578 both passed before squash merge. Main merge SHA: 33bdbb43f4834832be87f00c6c92ce6e996fdf4d.

Added capability-gated reader Archive and provider-backed message-removal controls. Successful mutations refresh mailbox metadata and force a fresh selected-mailbox read. The demo provider now maintains isolated in-memory Inbox, Archive, Trash, and Starred projections and has mutation-state tests.

Development boundary remains explicit: no bulk actions, undo/recovery workflow, durable demo state, production provider semantics acceptance, deployment approval, or Stable qualification.

2026-08-31 — Provider-Backed Move to Mailbox — Development

Added a reader Move control gated by the existing Mail provider Move capability. Valid destinations come from the provider mailbox list, and successful moves are followed by mailbox metadata and current-mailbox re-reads. Added demo-provider round-trip move coverage and responsive control styling.

Evidence: PR #32; exact tested head b96c84701c89eb99b49023d0df14e7535bf63651; Validate GoreeCloud Mail #118 success; CI #589 success; merged main SHA 0eb370ed63eca06ad1d1463a4f35fc3326715d43.

Status: Development. No production-provider or Stable acceptance claim.

August 31, 2026 — First Full Wardveil Target Matrix Exposed Live Evidence Clock Defect; PR #33 Corrected Source

Change type or category: Target-runtime application-consumer acceptance attempt; Wardveil integration; source defect correction; regression coverage; CI validation.

Affected project and environment: GoreeCloud Mail; goreecloud-vps-01; deployed Wardveil Scan 053c7fd81db3011cf1d7b7b304d4b33413e97e4b; frozen Mail target 33bdbb43f4834832be87f00c6c92ce6e996fdf4d; source correction PR #33.

Target preparation evidence: the frozen Mail target used Git tree 5ab87d80bfbe506beea6dae6754adef2328700be and source archive SHA-256 3c1ac6cf836eb5bc6f9080a661e04c369743719ad3a6ba49b12e22e3b71ddfaa. Portable official Node v22.23.2 used archive SHA-256 d60acfe00a2932254bb0ad20e01b0d74397a0875595de719654b214f4b03f307. The acceptance runner blob remained 2904c033cb7abc9f8a5e0bc90b222ff2cd1ad055 and the application harness blob remained 4eeb8a857e258d9d054a9158b7e4eddaa61593d7. Laptop regression, transfer checksums, target archive path-safety checks, exact Wardveil release/health/loopback checks, Mail caller-secret binding, Node installation, source blob validation, CLI load, and target-host regression all passed.

Runtime attempt result: the first live application-consumer case failed with `Wardveil Scan evidence for this attachment is invalid.` The command returned nonzero before an accepted Mail runtime evidence file was produced. No Mail acceptance `current` pointer was committed and transfer cleanup was not reached. Wardveil Scan itself remained healthy on the exact same deployed revision and was not restarted by the Mail acceptance attempt. This is therefore a failed Mail consumer acceptance attempt, not a Wardveil runtime failure and not production acceptance evidence.

Root cause: both AttachmentDeliveryService incoming validation and GmailOutgoingAttachmentSecurityGate outgoing validation sampled `Date.now()` before awaiting live Wardveil Scan, then rejected a valid authoritative `observed_at` generated after the scan because it appeared later than the stale method-entry timestamp. Synthetic tests had masked this behavior by deliberately backdating fake evidence.

Source correction: PR #33, `Fix live Wardveil evidence clock validation`, changed both validators so explicit finite `now` injection remains available for deterministic testing while default validation time is sampled after the live Scan response. Added regression tests delay the fake Scan response and generate evidence timestamps at response time, matching the target-host timing pattern.

PR #33 final governance evidence: rebased exact head 0ca9ef9e3c64b46d476ab34b63696a0f5b513600 on base 0eb370ed63eca06ad1d1463a4f35fc3326715d43; Validate GoreeCloud Mail workflow run 33396375134 passed; CI workflow run 33396375153 passed, including Static safety checks and Provider contract tests/full unit tests; no review submissions or unresolved review threads; expected-head squash merge produced authoritative main 42f49b5bcc522263426e87e72b367fd230f1e920 with Git tree 0f831c2272a45c08f7e20d68aba80891b610723b.

Current boundary: corrected target-environment execution remains pending. No runtime-validated Mail application-consumer claim is authorized yet. Real Gmail provider execution, production service identity/key lifecycle, revoked credentials, stale signatures, capacity/concurrency exhaustion, authorized Quarantine execution/readback, Wardveil Audit/Security Center provenance, Privacy Shield runtime acceptance, Everkeep recovery treatment, Stable qualification, overall production runtime acceptance, and broad `Protected by Wardveil` claim authority remain unproven or unaccepted.

August 31, 2026 — Wardveil Controlled-Provider Runtime Application-Consumer Acceptance

The corrected target-environment Mail Wardveil matrix completed successfully on goreecloud-vps-01 at exact Mail revision 42f49b5bcc522263426e87e72b367fd230f1e920 / Git tree 0f831c2272a45c08f7e20d68aba80891b610723b against exact deployed Wardveil Scan revision 053c7fd81db3011cf1d7b7b304d4b33413e97e4b. The accepted Mail source archive SHA-256 was ebc835116fd78d6832e3392d0adb6b154e515b6cfdae3bca54ec89088eb6b75e. Portable Node v22.23.2 was reused from the exact verified Mail acceptance runtime; its executable SHA-256 was 3517c2df0b2f8cd7f422b4b8450ef81c6889f08eb03e281d6de9079b15e6a327.

The target host revalidated the five pinned security-critical Git blobs from PR #33/PR #29 and all four target-host regression tests passed. The live application-consumer matrix passed incoming clean delivery/download, incoming EICAR fail-closed before downloadable cache, outgoing clean send admission, outgoing EICAR send fail-closed before provider-client construction/write, outgoing clean draft admission, and outgoing EICAR draft fail-closed before provider-client construction/write. Clean incoming/outgoing paths preserved private mode-0600 minimized provenance, and blocked EICAR paths created no clean provenance or provider write.

Private sanitized evidence: /opt/goreecloud/mail/wardveil-acceptance/evidence/42f49b5bcc522263426e87e72b367fd230f1e920.json. observed_at=2026-08-31T13:48:13.097Z. SHA-256=97e49f93aa04dce14c924699411355d3633d9c955264ef15e9539b2ac3bf031f. Evidence owner/mode: root:root / 0600. The accepted release pointer /opt/goreecloud/mail/wardveil-acceptance/current was promoted only after evidence validation and post-run Wardveil health/loopback checks passed.

Acceptance boundary: this advances GoreeCloud Mail to Runtime validated for the bounded controlled-provider Wardveil application-consumer scope only. real_gmail_provider_execution=not_proven; production_service_identity=not_proven; revoked_credential=not_proven; stale_signatures=not_proven; capacity_exhaustion=not_proven; authorized_quarantine_execution=not_proven; production_runtime_acceptance=unaccepted; protection_claim_authority=false. No broad Protected by Wardveil claim is authorized.

2026-08-31 — Mail Read-State Provider Mutation Foundation — Development

Repository: GoreeCloud/goreecloud-mail. Draft PR #34 on branch agent/read-state-foundation at exact head 6be028e63af0f2057c96995988f78f43e41a8cd1.

Change: added setReadState(messageId, read) to the required provider-independent Mail contract, implemented read/unread mutation and mailbox unread-count updates in the local Development demo provider, and added the account-scoped same-origin gateway request shape for PUT /messages/{id}/read-state. Tests cover demo round-tripping and encoded gateway routing.

Validation: CI run #606 and Validate GoreeCloud Mail run #123 completed successfully on the exact PR head.

Acceptance boundary: Development source validation only. The browser reader does not yet expose a read/unread action, and deployed provider/gateway backends must advertise readState only when their authoritative mutation path exists and is accepted. No production-provider, deployment, release, or Stable claim.

2026-08-31 — Capability-Gated Reader Read-State Action Contract — Development

Draft PR #35, stacked on PR #34, reached exact head 0ce6a1342d17351a087a084f757c3db381023839. Added deterministic Mark read / Mark unread presentation and target-read derivation plus exposure gating that requires a selected message, no message mutation already in flight, and the active provider's readState capability. The contract creates no browser-local read authority, optimistic unread-count authority, or automatic mark-read-on-open behavior.

Validation: Validate GoreeCloud Mail run #124 / workflow run 33408131325 and CI run #611 / workflow run 33408131326 both completed successfully on the exact head.

Acceptance boundary: the rendered reader button and provider invocation remain a separate integration step. Production provider/backend read-state acceptance, deployment, signed release, and Stable qualification remain separate gates.

Rendered Provider Read-State Control — Exact-Head Development Acceptance

Repository: GoreeCloud/goreecloud-mail. Draft PR #36 on branch agent/rendered-read-state-control at exact head 18093b50e6430a9b2791fe4da6fe4a3917970cc7.

Change: Wired the existing capability-gated Mark read / Mark unread contract into the rendered reader. The control appears only when the selected provider advertises readState, shares the existing message-mutation in-flight lock, invokes only setReadState(messageId, targetRead), then refreshes mailbox metadata/current mailbox and reopens the message from provider-authoritative state. Opening a message still does not automatically mark it read, and the browser does not become unread-count authority.

Validation: Validate GoreeCloud Mail run #125 / workflow run 33411058365 succeeded. CI run #616 / workflow run 33411058393 succeeded, including provider/unit tests, static secret/env/browser-host/innerHTML guards, Wardveil and Glaze attachment-security validators, runtime-tooling validators, and exact-revision verification.
