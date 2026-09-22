# GoreeCloud Mail — Legacy Drive Changelog History Part 10

**Source:** legacy Drive `Change Log — Mail.docx` (`1KFedQv6vx9TiZYabLu7u07CNFc15oVJf`)  
**Source non-empty paragraphs:** 451–500 of 699  
**Migration note:** Paragraph text below is preserved in source order. Historical lifecycle, branch, PR, validation, and acceptance statements apply only to their original dated context and do not override current authoritative repository state.

---

• Added source tests that require exact agreement between the runtime capability vocabulary and the machine-readable contract and explicitly prohibit mailboxHosting, mx, inboundInternetMail, outboundInternetMailService, and senderReputationOperation from becoming Courier provider capabilities.

• Rebuilt docs/provider-interface-contracts.md around the current client-only authority model and added docs/provider-capability-contract.md with feature-gating rules and examples.

• Opened PR #11, Add fail-closed external provider capability contract, against the corrected PR #10 branch so the documentation correction lands before the provider-capability implementation.

Architecture boundary: GoreeCloud Mail remains an external-provider email client and GoreeCloud communication experience. External providers remain authoritative for mailbox hosting and Internet mail transport. This milestone introduces no hosted mailbox, MX, inbound SMTP service, GoreeCloud outbound Internet mail service, sender-reputation operation, or other mail-server functionality.

Validation state: PR #11 exact head 4a7d3cef6212d899dc81bc7e13ac0ed572d6babb triggered CI run 33258601814 and Validate GoreeCloud Mail run 33258601819. Both were queued when this entry was recorded, so this exact head is implemented on a development branch but is not yet recorded as source-validated. Production acceptance remains separate.

Current state and follow-up: PR #11 is intentionally stacked on PR #10. PR #10 must first complete exact-head validation and merge. PR #11 should then be retargeted or reconstructed cleanly on current main as necessary, followed by exact-head validation before merge. The next provider work should continue through provider-specific capability mapping and authorized provider execution rather than any GoreeCloud-hosted mail-server path

August 29, 2026 at 9:54 AM CDT — Trusted Account-Scoped Provider Capability Discovery

Change type or category: Trusted backend development; provider authorization boundary; account-scoped feature discovery; fail-closed capability handling; tests and documentation.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; branch agent/provider-capability-contract; stacked PR #11; source-development environment only; no production runtime change.

Summary and purpose: I extended the external-provider capability contract into the trusted backend so browser-visible feature availability is derived from the authenticated GoreeCloud user and stored provider-account relationship rather than from caller-supplied provider names or capability claims.

Changes completed:

• Extended ProviderAccountService with account-scoped capability resolution. Trusted session identity is derived first, provider-account ownership is verified second, and only then may the injected capability resolver run.

• Added GET /api/mail/accounts/{accountId}/capabilities to the trusted Mail API router.

• Capability results are normalized through the shared Courier provider vocabulary before being exposed and omit the internal owning user identifier.

• Two accounts at the same provider may expose different capability sets because authorization scopes, account type, organization policy, provider configuration, or feature availability can differ.

• When no trusted resolver is configured, capability discovery returns an all-false normalized capability set rather than guessing provider support.

• Cross-user knowledge of an opaque provider-account identifier fails with the existing provider-account-not-found boundary before the capability resolver executes.

• Expanded mail-api-router tests to prove account-specific capability differences, normalization, caller-isolation behavior, all-false default behavior, and resolver non-execution on unauthorized access.

• Updated docs/provider-capability-contract.md to document the trusted discovery route and backend authority rules.

Architecture boundary: This remains a client-only external-provider capability system. It establishes what GoreeCloud Mail is authorized to do through an external provider account; it does not create mailbox-hosting or Internet mail-server authority.

Validation state: Current PR #11 exact head is d46c0662bfb77eec6b4c0bf27a37b49a24a6e77a. GitHub CI run 33258808448 and Validate GoreeCloud Mail run 33258808367 were queued when this entry was recorded. The source is implemented on the development branch but is not yet recorded as source-validated or merged

August 29, 2026 at 9:58 AM CDT — Account-Scoped Client Gateway Routing

Change type or category: Client/backend authority boundary; provider routing; account isolation; documentation reconciliation; tests.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; branch agent/provider-capability-contract; stacked PR #11; source-development environment only; no production runtime change.

Summary and purpose: I removed provider-name authority from the browser gateway contract. Client provider operations now carry the opaque GoreeCloud provider-account ID so the trusted backend, not the browser path, determines which external provider and authorization apply.

Changes completed:

• GatewayMailProvider now requires accountId and builds /accounts/{accountId}/... paths instead of /providers/{providerId}/... paths.

• GmailMailProvider and ImapSmtpMailProvider wrappers now accept and carry only the opaque provider-account ID through the shared gateway boundary; they no longer embed provider-name routing authority.

• Updated gateway tests to prove account and message identifiers are encoded, capability discovery uses the account-scoped path, wrappers do not expose providerId state, and construction fails without an account ID.

• Reconciled docs/provider-backend-contract.md so the trusted backend contract now defines /api/mail/accounts/{accountId}/... as the normalized provider-operation routing direction, documents account-scoped capability discovery, and explicitly preserves the client-only Mail-server boundary.

Security and authority result: Changing a browser path or wrapper type cannot authorize a different provider account. The backend must first resolve the opaque account under the authenticated user, verify its stored provider type and authorization/capabilities, and only then invoke provider-specific transport. Provider-native identifiers remain subordinate to the GoreeCloud account boundary.

Validation state: Current PR #11 exact head is df3f815c319202b4d5f5bf02a4556a0994dc3c41. GitHub CI run 33258963590 and Validate GoreeCloud Mail run 33258963581 were queued when this entry was recorded. This exact head is implemented but is not yet recorded as source-validated or merged

August 29, 2026 at 10:05 AM CDT — Provider Capability Enforcement Before Gmail Transport

Change type or category: Trusted provider execution; fail-closed authorization; baseline capability vocabulary; Gmail transport guardrails; provider adapter documentation.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; branch agent/provider-capability-contract; stacked PR #11; source-development environment only; no production provider connection or runtime change.

Summary and purpose: I advanced the provider-capability contract from discovery and UI gating into trusted execution enforcement so provider-dependent actions cannot bypass a missing capability by calling the backend directly.

Changes completed:

• Expanded the shared Courier capability vocabulary with baseline provider authority: mailboxAccess, messageRead, attachmentRetrieval, pushSync, storageQuota, senderIdentities, and providerRules in addition to the existing advanced provider-dependent capabilities.

• Updated the machine-readable contract so its capability list remains exactly aligned with the runtime vocabulary while continuing to prohibit hosted-mail/MX/provider-service authority.

• Changed ProviderCapabilityUnavailableError to an account-scoped bounded ProviderError with code provider-capability-unavailable, status 400, retryable=false, required capability, and opaque account context rather than provider-brand authority.

• Added ProviderAccountService.requireCapabilities() so a trusted service can resolve one account capability set and require a non-empty set of capabilities before transport execution.

• Applied capability enforcement to the existing Gmail account service. Label listing now requires mailboxAccess + labels; message listing requires mailboxAccess; full-message retrieval requires messageRead; attachment retrieval requires mailboxAccess + attachmentRetrieval.

• Wrong-provider checks occur before capability resolution, and missing capability state prevents Gmail client creation/transport invocation.

• Added Gmail account-service tests proving transport does not run on missing capabilities, cross-user references remain blocked, and non-Gmail accounts fail before capability resolution.

• Reconciled docs/provider-adapter-architecture.md and docs/provider-capability-contract.md with account-scoped routing, execution enforcement, Gmail/Microsoft/Yahoo/IMAP-SMTP adapter directions, and the client-only mail-server boundary.

Architecture result: Provider feature visibility and provider execution now share the same account-scoped capability model. UI gating remains a usability layer; trusted backend enforcement is the authorization boundary for provider-dependent actions.

Validation state: Current PR #11 exact head is 6e250660477b9138a87268f6d56b062c7a6971e0. GitHub CI run 33259293480 was queued and Validate GoreeCloud Mail run 33259293432 was pending when this entry was recorded. The branch is implemented but is not yet recorded as source-validated or merged.

.

.

.
