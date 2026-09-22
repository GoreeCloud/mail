# GoreeCloud Mail — Legacy Drive Changelog History Part 14

**Source:** legacy Drive `Change Log — Mail.docx` (`1KFedQv6vx9TiZYabLu7u07CNFc15oVJf`)  
**Source non-empty paragraphs:** 651–699 of 699  
**Migration note:** Paragraph text below is preserved in source order. Historical lifecycle, branch, PR, validation, and acceptance statements apply only to their original dated context and do not override current authoritative repository state.

---

Acceptance boundary: Exact-head Development source/CI acceptance only. Production provider read-state semantics, authenticated live-provider execution, deployment, signed release, representative native acceptance, complete Glaze UI 2.1 consumer conformance, and Stable qualification remain separate gates.

Loaded Unread-Only Mailbox Presentation — Exact-Head Development Acceptance

August 31, 2026. Draft PR #37 (`agent/loaded-unread-filter`) is accepted as source-validated Development evidence at exact head `a85b50e3d00fb760488344e8fe19dd8bcad0a181`.

The slice adds an explicit Unread only presentation toggle over the provider-derived message cards already rendered from the current loaded mailbox snapshot. It composes with the existing local mailbox search and refreshed provider read-state rendering while leaving the accepted `app.js` provider/read-state controller unchanged. The control performs no provider call, mailbox refresh, hidden search, network request, read-state mutation, unread-count mutation, background activity inference, or additional retention.

Validation evidence: Validate GoreeCloud Mail run 33420926385 / #126 succeeded on the exact head, including exact-revision verification, Wardveil attachment-security consumer/integration/runtime-tooling checks, Glaze attachment-security presentation checks, and security-tool compilation. CI run 33420926413 / #629 also succeeded on the same exact head, including the complete Node unit/provider-contract suite plus static environment-file and private-key-material guards. New regression coverage verifies that unread visibility is a pure loaded-state projection and that the rendered control contains no provider, `listMessages`, `setReadState`, fetch, or XMLHttpRequest authority.

Acceptance boundary: Development source validation only. PR #37 remains draft/unmerged. Production provider acceptance, complete current Stable Glaze UI rendered/accessibility acceptance, representative-device acceptance, deployment, signed release, and Stable qualification remain separate gates.

August 31, 2026 — Mail Revalidated Against Active Wardveil 95e2d8ca Runtime

Exact current Mail main 42f49b5bcc522263426e87e72b367fd230f1e920 / tree 0f831c2272a45c08f7e20d68aba80891b610723b was re-executed on goreecloud-vps-01 against active Wardveil Scan runtime 95e2d8cae5d317e7dfd96e74ca6ef7fcdddf28d4 using the existing accepted release and portable Node v22.23.2 executable SHA-256 3517c2df0b2f8cd7f422b4b8450ef81c6889f08eb03e281d6de9079b15e6a327.

The controlled-provider runtime application-consumer matrix passed all six cases: incoming clean download, incoming EICAR blocked before downloadable cache, outgoing clean send admitted, outgoing EICAR send blocked before provider-client construction/write, outgoing clean draft admitted, and outgoing EICAR draft blocked before provider-client construction/write. Clean paths retained exact-byte binding and private mode-0600 provenance; blocked EICAR paths produced no provider write and no clean provenance.

New private revision-pair evidence: /opt/goreecloud/mail/wardveil-acceptance/evidence/42f49b5bcc522263426e87e72b367fd230f1e920-wardveil-95e2d8cae5d317e7dfd96e74ca6ef7fcdddf28d4.json; observed_at=2026-08-31T20:45:45.873Z; SHA-256=36eaff6f8c44b052fbfa7b769711ae9ecf611c60b8228fdde606a6a415416180; owner/mode=root:root/0600. The evidence explicitly embeds Wardveil 95e2d8ca and records controlled_provider_boundary=passed, real_gmail_provider_execution=not_proven, production_runtime_acceptance=unaccepted, and protection_claim_authority=false.

Wardveil did not restart during the consumer revalidation: InvocationID remained 3561b90d5a2649118232f987442ae40c across the preceding Drive matrices and Mail run. The protected caller registry remained byte-identical at SHA-256 db61acbeb6afe0c317f50eb6eb67655f3557a4175bfcd0fffab825dddb7c9fde. Historical Mail evidence bound to Wardveil 053c7fd81db3011cf1d7b7b304d4b33413e97e4b remains unchanged. Separate Wardveil platform evidence establishes credential revocation and bounded capacity recovery for active Scan, but the frozen Mail harness's revoked_credential and capacity_exhaustion fields remain not_proven for the Mail-specific matrix. stale ClamAV signature-database acceptance, real Gmail provider execution, production service identity/key lifecycle, authorized Quarantine execution/readback, Wardveil Audit/Security Center provenance, Privacy Shield, Everkeep, Stable qualification, and overall production acceptance remain open.

August 31, 2026 at 4:16 PM CDT — Loaded Message View Filter Model and Draft PR #38

Change type or category: Mail presentation architecture; loaded-message filtering; provider-authority preservation; tests; Development documentation.

Affected project and environment: GoreeCloud Mail; repository `GoreeCloud/goreecloud-mail`; branch `agent/loaded-message-filter-model`; Draft PR #38; stacked on `agent/loaded-unread-filter`; no production runtime change.

Purpose and previous state: The preceding validated Mail Development slice provided an unread-only presentation control over already-rendered messages. This continuation establishes a reusable filter model that can support a richer Glaze UI mailbox filter without implying that the browser searched or loaded the entire remote mailbox.

Changes completed:

• Added `web/message-view-filter.js` with stable All, Unread, Flagged, and Unread + Flagged filter values.

• Added normalization that falls back to All for unknown values.

• Added `shouldShowLoadedMessage`, which uses only provider-authoritative `unread` and `flagged` booleans already present on the loaded message model. Unread, Flagged, and combined filters fail closed when the required boolean is missing.

• Added bounded status-copy generation that explicitly says `current loaded mailbox view` for finite local filters.

• Added `tests/message-view-filter.test.js` covering normalization, filter combinations, missing-state behavior, and status copy.

• Added `docs/development/loaded-message-view-filter-model.md` documenting the authority boundary and the later rendered Glaze UI composition step.

• Opened Draft PR #38, `Add loaded message view filter model`, against the exact validated parent branch rather than bypassing the existing stacked Development line.

Validation and result: Exact head `fba7389e5ed9ee09b7ef167d1c328273ae4e5b15` completed `Validate GoreeCloud Mail` run 127 and `CI` run 634 successfully. The PR is open as a draft and the new slice is source-validated.

Security, privacy, and authority state: No provider search, new mailbox page request, provider credential access, network request, message mutation, read-state mutation, flag mutation, production deployment, or email-server behavior was added. The model is a local presentation projection only and does not claim server-complete filtered results.

Current state and follow-up: Draft PR #38 remains a Development slice. A later rendered step can replace the single-purpose unread control with a Glaze UI filter surface backed by this model while preserving pagination and provider capability boundaries. Production acceptance remains separate.

Development — Draft PR #39: rendered loaded-message view filters

Added a Glaze mailbox View control backed by the validated loaded-message filter model, with All loaded, Unread, Flagged, and Unread + flagged modes that compose with browser-local search. Filtering remains presentation-only over already-loaded cards; provider authority and mutation paths are unchanged. Exact-head Validate GoreeCloud Mail and CI workflows succeeded. Stable acceptance is not claimed.

September 2, 2026 — Loaded Read Message View and Filter Accessibility — Development

GoreeCloud Mail Draft PR #41 advanced to exact head `f594417f4abb5f8d22a177c22b44504db179163a`. The loaded-mailbox View control now includes Read in addition to All loaded, Unread, Flagged, and Unread + flagged. Read requires explicit provider-derived `unread === false`; absent state is not guessed. The existing filter surface retains its 48 px Glaze interaction floor and explicit Forced Colors system-color behavior. CI #658 / run `33596694607` and Validate GoreeCloud Mail #138 / run `33596694621` both succeeded on the documentation-complete head.

Authority remains local presentation only over the already-loaded mailbox snapshot. No provider search/fetch, pagination, flag/read-state mutation, mailbox-count mutation, credential access, or network request was added. Production provider, full Glaze UI/accessibility/device, deployment, release, and Stable acceptance remain pending

September 2, 2026 — Glaze UI 2.2 Loaded-Filter Accessibility — Development

Draft PR #41 reached exact head `b5f12ef4c16e586098a1240181e235e71b885602`. The loaded-message View control now preserves the 48 px normal floor and exposes an explicit 56 px Touch Assistance hook without inferring accessibility mode from coarse-pointer hardware. Reduced Transparency uses solid Light/Dark fallbacks, Increased Contrast strengthens boundary/focus treatment, and Forced Colors continues to use Canvas/CanvasText/Highlight. The Read filter remains a fail-closed projection requiring provider-derived `unread === false`.

Validation: CI #664 / run `33598196004` succeeded; Validate GoreeCloud Mail #141 / run `33598195974` succeeded. Authority remains presentation-only over the already-loaded mailbox snapshot. Complete Glaze UI 2.2 consumer/device/accessibility acceptance, production provider acceptance, deployment, release, and Stable qualification remain unaccepted.

.

September 2, 2026 — Glaze UI 2.2 Loaded-Filter Reflow Hardening — Development

Draft PR #41 advanced to exact head `22fb23336ccc5a2a81bee6457b259158e75222b4`. The loaded-message search/filter group now wraps instead of requiring one uninterrupted row; at 720 CSS pixels and below the controls stack and use the available width. The filter wrapper and native select use shrink-safe `min-width: 0` / `max-width: 100%` behavior, the former 168 px select cap is removed, and at 360 CSS pixels and below the filter label/select pair may stack vertically while preserving the existing 48 px normal and explicit 56 px Touch Assistance interaction floors.

Validation: CI #670 / run `33610018477` succeeded; Validate GoreeCloud Mail #144 / run `33610018425` succeeded on the exact head. Existing Reduced Transparency, Increased Contrast, Forced Colors, and explicit provider-derived Read-filter fail-closed behavior remain intact. Authority remains presentation-only over the already-loaded mailbox snapshot.

Acceptance boundary: source/CI Development evidence only. Rendered 200% text/zoom reflow acceptance remains unproven. Complete Glaze UI 2.2 consumer acceptance, wired Touch Assistance preference authority, Reduced Motion, RTL/localization, complete keyboard/screen-reader acceptance, representative-device/provider acceptance, deployment, release, and Stable qualification remain separate gates.

September 2, 2026 — Loaded-Filter Accessibility Relationship Hardening — Development

Draft PR #41 advanced to exact head `4ce8c5b9d6471ec3658c121b9c50a2e9925b5642`. The loaded-message View select now explicitly declares `aria-controls="messageList"` while retaining `aria-describedby="messageViewFilterStatus"`. The bounded result-status node remains a polite `role="status"` live region and is now explicitly atomic with `aria-atomic="true"` and text-only relevance, so the complete current-loaded-view result sentence is exposed as one semantic update. Source regression coverage locks these filter/list/status relationships.

Validation: CI #676 / run `33612644798` succeeded and Validate GoreeCloud Mail #147 / run `33612644797` succeeded on the exact head. Provider state remains authoritative and no provider search, fetch, pagination, message mutation, mailbox-count authority, analytics, tracking, credential, or network behavior was added.

Acceptance boundary: source/CI Development accessibility-semantics evidence only. Actual screen-reader/browser behavior, complete keyboard accessibility, rendered 200% text/reflow, wired Touch Assistance preference authority, Reduced Motion, RTL/localization, complete Glaze UI 2.2 consumer acceptance, representative-device/provider production acceptance, deployment, release, and Stable qualification remain separate gates.

September 2, 2026 — Loaded-Filter Accessibility and Approved AGPL-3.0-only Reconciliation — Development

GoreeCloud Mail Draft PR #41 advanced to exact final head `840f3bb23c62221a32652045026ee0cdd28a9238`. The previously validated loaded-message View behavior remains unchanged: All loaded, Unread, Read, Flagged, and Unread + flagged operate only over the current loaded mailbox snapshot; Read still requires explicit provider-derived `unread === false`; the 48 px normal and explicit 56 px Touch Assistance floors, Reduced Transparency/Increased Contrast/Forced Colors behavior, narrow-width and large-text reflow safeguards, and the filter/list/status accessibility relationships remain intact.

The branch also inherited GoreeCloud Mail's already-approved AGPL-3.0-only legal state from verified authoritative-main commit `5cd3a9fcc8da76b8703da08305c03abb2ae86737`. PR #41 predated that licensing commit, so this reconciliation did not select or change the project license. Root `LICENSE` now identifies `AGPL-3.0-only`, package metadata declares the same SPDX identifier, and README points to the approved root license instead of describing license selection as pending. The canonical Project Specification already records GNU Affero General Public License v3.0 only as the approved Mail license.

Exact-head validation: CI #682 / workflow run `33673435260` succeeded and Validate GoreeCloud Mail #150 / workflow run `33673435311` succeeded on exact head `840f3bb23c62221a32652045026ee0cdd28a9238`.

Authority remains presentation-only for the loaded-message filter. No provider search, fetch, pagination, read-state/flag mutation, mailbox-count authority, analytics, tracking, credential access, or network request was added. The license reconciliation adds no runtime authority or deployment behavior.

Status remains Development. Actual screen-reader/browser acceptance, rendered 200% text/reflow acceptance, wired platform Touch Assistance preference authority, Reduced Motion, RTL/localization, complete keyboard accessibility, complete Glaze UI 2.2 consumer acceptance, representative-device/provider production acceptance, deployment, signed release, production acceptance, and Stable qualification remain separate gates.
