# GoreeCloud Mail — Legacy Drive Changelog History Part 11

**Source:** legacy Drive `Change Log — Mail.docx` (`1KFedQv6vx9TiZYabLu7u07CNFc15oVJf`)  
**Source non-empty paragraphs:** 501–550 of 699  
**Migration note:** Paragraph text below is preserved in source order. Historical lifecycle, branch, PR, validation, and acceptance statements apply only to their original dated context and do not override current authoritative repository state.

---

.

August 29, 2026 at 10:43 AM CDT — External Provider Capability Authority, Gmail Scope Resolution, and Trusted Send/Draft Transport

Change type or category: Native provider architecture; account-scoped authorization; Gmail OAuth capability resolution; Gmail write transport; provider routing; retry safety; source validation; documentation reconciliation.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; PRs #10, #11, #12, and #13; Project Specification — Mail; source-development environment only. No production runtime deployment, real mailbox connection, DNS/MX change, or GoreeCloud email-provider service was introduced.

Purpose and architecture boundary: Continued development from the corrected architecture in which GoreeCloud Mail remains a first-party email client and communication experience over compatible external providers. External providers remain authoritative for mailbox hosting and Internet mail delivery. Self-hosted GoreeCloud Mail continues to mean the application/trusted backend only. This continuation did not add mailbox hosting, MX, inbound SMTP, GoreeCloud outbound Internet mail infrastructure, sender-reputation infrastructure, or provider-scale mail operations.

PR #10 validation and merge: The corrected native client capability-scope branch at exact head a1db76bf27a0e30200d0257e62869fda6419464f completed both required workflow gates: CI run 33258383247 and Validate GoreeCloud Mail run 33258383250 succeeded. PR #10, Document GoreeCloud Mail native client capability scope, was squash-merged with expected-head protection as ac15c06ccec6028f26cac3fa72af0ca4a775bfe6. This established the corrected client-only repository documentation and mandatory root specification/feature/benefit/objective documents on main.

Provider capability contract and PR #11: Expanded the existing MailProvider capability model into a normalized account-specific external-provider authority contract. The vocabulary now includes baseline mailbox/message/attachment access, folders/labels, mutation, search, synchronization, quota, send controls, sender identities, aliases/domains, provider rules, retention, and organization-policy primitives while explicitly excluding mailbox hosting, MX, inbound Internet mail, a GoreeCloud outbound Internet mail service, and sender-reputation operation. Missing capabilities normalize false, unknown names fail closed, and provider-dependent execution requires trusted capability authority rather than UI state or provider-brand assumptions.

Trusted account-scoped discovery: ProviderAccountService now resolves capabilities only after deriving the GoreeCloud user from trusted session state and confirming ownership of the opaque provider-account identifier. GET /api/mail/accounts/{accountId}/capabilities exposes only the normalized account result. Different accounts at the same provider may legitimately have different capability sets. An unconfigured resolver returns an all-false normalized set. Cross-user knowledge of an account identifier fails before the resolver executes.

Opaque account routing: GatewayMailProvider and the Gmail/IMAP-SMTP wrappers now route through /api/mail/accounts/{accountId}/... rather than browser-selected /providers/{provider}/... authority. The trusted backend resolves the stored provider after ownership checks. This direction covers mailbox, message, search, draft, send, synchronization, attachment, and future provider-dependent operations.

Execution enforcement: GmailAccountService requires the normalized account capabilities before invoking provider transport. Label listing, message listing, message retrieval, and attachment retrieval each have explicit capability requirements. A missing capability raises the bounded provider-capability-unavailable state and stops before the Gmail client factory or transport runs. ProviderGateway was also corrected to preserve bounded trusted-backend error codes through the same-origin client boundary without returning raw upstream provider bodies.

Capability-envelope integration fix: During development, the trusted capability endpoint returned the intended {accountId, provider, capabilities} envelope while GatewayMailProvider initially normalized the entire envelope as if it were the raw capability map. That would have converted every capability to false. The client was corrected to unwrap the capabilities field first, and an end-to-end client-to-trusted-API regression test now protects that contract.

Intermediate CI failure investigation: Gmail GitHub notifications surfaced failed CI on an intermediate provider-capability head, including commit 7e91b5628948a524d1f75ce35931ac2c552f5b1a. Inspection of CI run 33259075419 showed the provider contract vocabulary equality test failing because the runtime vocabulary had been expanded with mailboxAccess, messageRead, attachmentRetrieval, pushSync, storageQuota, senderIdentities, and providerRules before the machine-readable Courier contract had been updated with the same names. The contract was reconciled; this was a development-contract mismatch, not evidence of a production provider failure.

PR #11 squash-history reconciliation: After PR #10 was squash-merged, simply retargeting stacked PR #11 to main caused GitHub to present the pre-squash PR #10 lineage as a duplicated 62-commit/28-file history. I compared the original PR #10 head against the provider-capability branch, identified the intended 21-file delta, reused the exact intended Git tree e5266acfe5cd379ec9a94a821abc5bdf93e84e30, and created a new single commit directly parented on merged main ac15c06ccec6028f26cac3fa72af0ca4a775bfe6. The branch was moved to clean head b871bd2860db43332a8063579e849cc68978d782, preserving the intended source tree without duplicated history. Exact-head CI run 33260146746 and Validate GoreeCloud Mail run 33260146763 both succeeded. PR #11 was squash-merged as 7815c68ce57bc1a90088a23427a9ceb8cd919293.

Gmail OAuth-scope capability resolution and PR #12: Added server/gmail-capability-resolver.js and provider-capability dispatcher logic that derive effective account capabilities from OAuth scope metadata stored behind the user/account-scoped credential-vault boundary. Provider OAuth scope is necessary but not sufficient: an effective capability is true only when the account has provider authorization and GoreeCloud has the corresponding trusted implementation. Missing credential authorization and providers without an implemented resolver fail closed to all-false.

Least-privilege Gmail scope mapping: The resolver recognizes current Gmail full-mail, modify, readonly, labels, metadata, compose, send, and settings scope identifiers. A labels-only grant was initially treated as mailboxAccess during development; review found this could let the message-list guard pass even though gmail.labels does not authorize message reading. The model was corrected so labels-only establishes labels but not mailboxAccess, messageRead, or attachmentRetrieval. Gmail label listing now requires labels directly, while message listing requires mailboxAccess. A regression test proves labels-only can list labels but cannot list messages. At the PR #12 milestone, send and drafts remained false even when their scopes existed because trusted write transport had not yet been implemented.

PR #12 validation and merge: Exact head 7acd2790ccb875fd8551f970249457f02be9b9d1 passed CI run 33260436264 and Validate GoreeCloud Mail run 33260436273. PR #12, Resolve Gmail capabilities from granted OAuth scopes, was squash-merged as 562d2a8c93416db1dcf04074e2efd4e056a041ec. This establishes source-validated scope-derived development authority only; it does not prove a real Gmail authorization or mailbox connection.

Gmail send/draft transport and PR #13: Added server/gmail-message-builder.js with a bounded plain-text RFC-formatted message foundation. The builder requires at least one recipient, bounds recipient count and body/header/subject size, constrains mailbox-style address fields, rejects CR/LF/NUL header injection, normalizes CRLF, supports UTF-8 encoded-word subjects, emits text/plain UTF-8 MIME headers, and produces unpadded base64url raw content for the Gmail API.

Gmail API write transport: Extended GmailApiClient with messages.send, drafts.create, and drafts.update using the documented Gmail API JSON resource shapes. Normalized write results expose only bounded message/draft identifiers, thread identifiers, and label IDs; raw MIME content, bearer authorization, and unrelated upstream response fields are not returned.

Write replay safety: The existing provider request policy permits bounded retries for eligible read operations, but automatically retrying an ambiguous send could create duplicate mail. Gmail send, draft create, and draft update therefore force maxAttempts=1 even when surrounding request policy is configured for multiple attempts. Tests prove a retryable provider failure causes only one write attempt. Durable ambiguous-write reconciliation/idempotency remains a separate future requirement.

Provider-independent write routing: Added ProviderOperationService. The generic browser paths POST /api/mail/accounts/{accountId}/messages, POST /api/mail/accounts/{accountId}/drafts, and PUT /api/mail/accounts/{accountId}/drafts/{draftId} now route through the trusted owned provider account, then the registered provider service. Cross-user references fail before provider dispatch, and providers without a registered write implementation fail closed.

Gmail write capability enforcement: GmailAccountService gained send, createDraft, and updateDraft. The Gmail capability resolver now establishes send only when provider authorization permits send and implemented GoreeCloud send transport exists; gmail.send establishes send only, gmail.compose establishes send and drafts, and gmail.modify/full-mail can establish the implemented read-side capabilities plus send and drafts. readonly and labels-only remain non-writing.

Sender identity boundary: A caller-supplied From header is not accepted merely because an account can send. Explicit From requests additionally require senderIdentities. That capability remains false until GoreeCloud implements provider-confirmed Gmail send-as/sender-identity discovery and enforcement, so arbitrary caller sender identities fail before Gmail transport. This prevents the browser from treating a claimed From address as provider authority.

End-to-end write validation: Added tests covering message construction and header-injection rejection, Gmail API write request shapes and normalized responses, non-replay behavior, provider-independent dispatch, sender-identity gating, scope-derived capability behavior, and browser GatewayMailProvider -> trusted Mail API router -> ProviderOperationService -> GmailAccountService -> Gmail transport composition. Tests also prove gmail.send cannot create drafts and a user cannot send through another user's opaque account identifier.

PR #13 validation and merge: The implementation head daf7b6a60833d1e23c21673f2457abfae8dd538c passed the initial complete-code CI/Validate gates. Repository FEATURES.md was then reconciled to list account-scoped capability authority, Gmail scope resolution, and the bounded Gmail read/send/draft foundation as source-validated development capabilities while keeping rich composition and production work pending. The final exact head 6dab47790efae115637dc1186231db539c5125a2 passed CI run 33260917100 and Validate GoreeCloud Mail run 33260917096. PR #13, Add trusted Gmail send and draft transport foundation, was squash-merged as f1f4fa14520b53d34988e8902221848cc0b78a90.

Documentation synchronization: Project Specification — Mail was updated in place. Section 28's stale pending PR #11 implementation paragraph was reconciled to the final validated/merged state, and section 29, Provider Capability Resolution and Gmail Write Transport — August 29, 2026, was added with PR #10-#13 merge evidence, scope semantics, write safety, and current acceptance boundaries. Repository FEATURES.md and provider capability/write transport documentation were also reconciled. No new Courier identity standard was required because these changes implement existing Courier provider/client responsibilities without changing Courier's identity or product boundary.

Security and privacy state: Reusable provider credentials remain behind the credential-vault boundary and are not returned through the browser gateway. Account ownership remains session-derived. Gmail raw message bytes are constructed only inside trusted backend provider code. Cross-user access fails closed. Provider errors remain bounded. No production credential, real mailbox content, real send, OAuth secret, DNS/MX configuration, Caddy route, production Mail service, or GoreeCloud email-server functionality was introduced.

Current source state: Main is now at merged Gmail send/draft milestone f1f4fa14520b53d34988e8902221848cc0b78a90. Source-level external-provider capability negotiation, Gmail scope-derived capability authority, Gmail read transport, and bounded plain-text Gmail send/draft create/update foundations are merged and exact-head validated. Real-provider connectivity and production acceptance remain pending.

Remaining major provider work: controlled real Gmail authorization and mailbox acceptance; production OAuth consent/verification and credential/key custody; provider-confirmed sender/send-as identities; Gmail History API/incremental synchronization with durable cursor and full-resync fallback; rich HTML and multipart outgoing MIME; outgoing attachments and inline images; signatures and templates; safe reply/forward threading; ambiguous-write reconciliation/idempotency; provider mutation operations; production observability/rate-limit behavior; Microsoft Outlook, Yahoo, and IMAP/SMTP capability resolvers/execution paths; and target-environment acceptance. These remain external-provider client capabilities and do not change the no-mail-server roadmap.

Source-Validated Development Update — Gmail Send Reconciliation and User Manual

GoreeCloud Mail merged bounded ambiguous Gmail send reconciliation while preserving its single-attempt provider-write rule. Reconciliation-enabled sends use a server-owned deterministic RFC Message-ID; an ambiguous temporary send outcome is checked through an exact Gmail Sent lookup rather than replaying the write. Exactly one match confirms the send, while zero/multiple matches or reconciliation-read failure produce non-retryable provider-write-outcome-unknown.

Exact functional head 0d5a38631871fa848871820f07be67400182102a passed CI run 33261785828 and Validate GoreeCloud Mail run 33261785873 and was integrated to main as 40c96dd8dd742859a26906f94a5b77b3986c0661.

The repository README and Development USER-MANUAL.md were then reconciled on exact head 86e6c2241bb8e8cf1ddc6d58a3c18cfb53bf5093. CI run 33262445440 and Validate GoreeCloud Mail run 33262445518 passed before integration to main as d6a94cf61311fe633afa0575546037dd264cb9c2. The validator remained fail closed: a first documentation attempt that removed required Wardveil README wording was rejected, and the required security contract text was restored rather than weakening validation.

Draft create/update ambiguity, durable cross-process operation journals/offline replay, real Gmail timing/search-consistency acceptance, production OAuth and credential custody, complete sender identities, rich MIME/outgoing attachments, deployment, signed release, and Stable qualification remain separate gates.

2026-08-29 — Gmail draft ambiguous-write reconciliation

Repository: GoreeCloud/goreecloud-mail

Pull request: #18 — Add Gmail draft write reconciliation

Validated candidate head: 302c02a175a6245387c2f99bfedcdbcab1f14a75

Validation: Validate GoreeCloud Mail #88 / workflow run 33266853972 — success; CI #467 / workflow run 33266853973 — success.

Merged authoritative main: 798c363e8e9446467b2e1f08d7f473080639d931

Change: extended the existing deterministic server-owned RFC Message-ID reconciliation model to Gmail draft create/update while keeping provider writes single-attempt. Ambiguous temporary/rate-limited/unknown outcomes perform a bounded exact-Message-ID draft search; create requires exactly one match and update additionally requires the exact intended draft ID. Zero/multiple/wrong-ID/reconciliation-read failures return non-retryable provider-write-outcome-unknown rather than replaying or falsely claiming success.

Acceptance boundary: source/CI validated Development behavior only; real Gmail timing/search-consistency, production OAuth/credential custody, rich outgoing MIME/attachments, production deployment, signed release, and Stable qualification remain unaccepted

Sanitized Rich Gmail Composition — Merged Development Milestone

Repository: GoreeCloud/goreecloud-mail

Pull request: #19 — Add sanitized rich Gmail composition

Validated candidate head: 72d6f372bc359a2e4a8899e6cf88edadfce160b5

Validation: CI workflow run 33270928834 — success; Validate GoreeCloud Mail workflow run 33270928827 — success.

Merged authoritative main: 5725410387b45a17bc6abb5299d57059a7ecca00

Change: added optional sanitized HTML composition alongside the plain-text fallback and deterministic UTF-8 multipart/alternative MIME construction. The existing restrictive first-party sanitizer removes executable/embedded markup, event handlers, inline styles, and automatic remote-resource loading while retaining safe bounded links and the established header-injection, recipient, sender, reply, threading, and reconciliation Message-ID protections. Text and HTML source bodies have independent one-megabyte limits.

Acceptance boundary: source/CI validated Development behavior only; outgoing file attachments, inline images, CSS-rich editor controls, signatures/templates, production OAuth custody, real-provider MIME acceptance, deployment, signed release, and Stable qualification remain unaccepted.

.
