# GoreeCloud Mail — Legacy Drive Changelog History Part 06

**Source:** legacy Drive `Change Log — Mail.docx` (`1KFedQv6vx9TiZYabLu7u07CNFc15oVJf`)  
**Source non-empty paragraphs:** 251–300 of 699  
**Migration note:** Paragraph text below is preserved in source order. Historical lifecycle, branch, PR, validation, and acceptance statements apply only to their original dated context and do not override current authoritative repository state.

---

Change type or category: Native backend development; durable attachment persistence; SQLite migration; retention metadata; account isolation; backup/recovery validation; testing; documentation.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; branch agent/initial-application-foundation; Draft PR #1; source-development environment only; no production runtime changes.

Summary and purpose: I continued GoreeCloud Mail by replacing the remaining process-local-only attachment metadata boundary with a durable SQLite metadata model. Attachment bytes remain in the private hardened object store, while ownership, message/provider relationships, integrity metadata, access timestamps, and optional expiry state can now survive process restart and participate in database backup/recovery.

Changes completed:

• Added docs/migrations/002-attachment-delivery.sql as repository-owned SQLite schema migration version 2.

• Added attachment_delivery_records with opaque object identifiers, GoreeCloud user and provider-account ownership, message and attachment identifiers, safe filename metadata, declared and sniffed MIME types, actual byte size, SHA-256 integrity digest, creation time, last-access time, and optional expiry time.

• Added owner/account and expiry indexes so attachment authorization and retention work can remain bounded as the cache grows.

• Updated server/sqlite-migrations.js to apply migration v2 after the immutable baseline schema inside the existing BEGIN IMMEDIATE migration boundary.

• Updated SqliteMailState construction to run repository migrations rather than directly executing only the baseline schema, ensuring new and reopened development databases converge on the current schema version.

• Added durable attachment metadata create, owner-scoped read, access-touch, removal, and bounded expired-record listing operations to server/sqlite-state.js.

• Public attachment metadata records omit the owning user identifier. Cross-user object-ID knowledge fails closed through the existing not-found state.

• Added retention metadata primitives without automatically deleting attachment bytes. Cleanup execution remains a separate higher-level operation so filesystem deletion and metadata deletion can be coordinated deliberately and recoverably.

• Expanded tests/sqlite-state.test.js with restart persistence, cross-user isolation, expiry-query behavior, access timestamp updates, and removal validation.

• Expanded tests/sqlite-maintenance.test.js for schema version 2, migration idempotency, attachment table existence, attachment metadata preservation through SQLite backup, and restored attachment readability.

• Updated Draft PR #1 to record the durable attachment-metadata milestone and remaining attachment work.

Validation state: Exact-head GitHub Actions CI run #204 / 32500219292 completed successfully on commit 627a558a3fcfdf1ae8467db17300f2e72c6d8b3c. Migration v2, durable attachment metadata, restart persistence, owner isolation, expiry queries, backup preservation, existing attachment/Gmail transport tests, and static secret-safety checks are green on this exact head. Production acceptance remains separate from source CI.

Security and privacy state: No real Gmail account, mailbox, attachment, provider credential, OAuth secret, DNS record, Caddy route, or production service was introduced. Attachment bytes are not stored in ordinary SQLite application state, reusable provider secrets remain in the separate credential-vault boundary, and attachment metadata remains user/account scoped.

Current state: Draft PR #1 remains open, mergeable, and intentionally draft. Durable attachment-delivery metadata is now source-validated. Remaining attachment priorities are isolated image/PDF preview execution, archive handling, retention cleanup execution that coordinates metadata with stored bytes, representative attachment acceptance, and controlled real-provider integration only after those boundaries are validated.

August 21, 2026 at 11:24 AM CDT — GoreeCloud Courier Feature Identity Adopted

Change type or category: Product identity; feature architecture; documentation.

Affected project and environment: GoreeCloud Mail; documentation and product naming; no production runtime changes.

Summary and purpose: I adopted GoreeCloud Courier as the unified first-party mail technology and feature framework powering GoreeCloud Mail. Courier provides one coherent identity for the native mail capabilities while preserving the existing GoreeCloud Mail product name and established Glaze UI, Wardveil Security, and Privacy Shield identities.

Changes completed:

• Defined the official identity as: GoreeCloud Courier is the unified first-party mail technology and feature framework powering GoreeCloud Mail.

• Established Courier as the umbrella for native mail capabilities including mailbox organization, composition, synchronization, search, rules, attachments, accounts, and related provider-independent workflows.

• Established example capability naming such as Courier Inbox, Courier Compose, Courier Sync, Courier Search, Courier Rules, Courier Attachments, and Courier Accounts where descriptive sub-names improve clarity.

• Clarified that these names are capability groups under one Courier identity rather than separate applications or independent brands.

• Preserved Glaze UI as the design language, Wardveil Security as the security and protection identity, and Privacy Shield as the privacy identity.

• Preserved the GoreeCloud Mail product boundary: Courier does not turn GoreeCloud Mail into an email server or mail-hosting provider.

Documentation state: The authoritative Project Specification — Mail has been updated with a dedicated Courier Feature Identity section.

August 21, 2026 at 11:31 AM CDT — Courier Identity Standard and Source-Control Mirror Established

Change type or category: Product identity governance; source-control documentation; naming standardization.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; branch agent/initial-application-foundation; Google Drive Standards - 1; no production runtime changes.

Summary and purpose: I formalized the previously approved GoreeCloud Courier identity so its role, naming boundaries, capability families, relationship to Glaze UI, Wardveil Security, Privacy Shield, and Everkeep, and its provider-independent client-only boundary are governed consistently across documentation and source control.

Changes completed:

• Created Standard — Courier Identity as the authoritative product-capability identity and naming standard.

• Placed Standard — Courier Identity in Standards - 1 with the other GoreeCloud product and platform identity standards.

• Added GoreeCloud/goreecloud-mail/docs/courier.md as the repository source-control mirror for Courier identity and implementation guidance.

• Added GoreeCloud/goreecloud-mail/docs/courier.identity.json as a machine-readable identity manifest.

• Established Courier Inbox, Courier Compose, Courier Sync, Courier Search, Courier Rules, Courier Attachments, and Courier Accounts as approved initial capability-family naming direction.

• Explicitly prohibited renaming GoreeCloud Mail to Courier, presenting Courier as an email provider/server, or creating a separate Courier repository merely because Courier is a named capability identity.

• Preserved provider independence and the established responsibilities of Glaze UI, Wardveil Security, GoreeCloud Privacy Shield, and Everkeep.

Current state: Courier is now formally documented in the Mail project specification, a dedicated identity standard, the Mail change log, and the GoreeCloud Mail repository. Visual identity artwork or a canonical Courier mark has not yet been approved and should be handled as a separate visual-identity milestone.

August 23, 2026 at 3:38 AM CDT — Durable Attachment Delivery Wiring, Expiry Enforcement, and Coordinated Retention Cleanup

Change type or category: Native backend development; durable attachment persistence; retention execution; account isolation; cleanup reliability; testing; documentation.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; branch agent/initial-application-foundation; Draft PR #1; source-development environment only; no production runtime changes.

Summary and purpose: I connected the authorization-bound attachment delivery service to the durable attachment-metadata interface and implemented the previously pending retention-cleanup execution path. The goal is to make attachment ownership and expiry survive service recreation while ensuring expired or failed metadata operations do not leave accessible or orphaned attachment bytes.

Changes completed:

• Updated server/attachment-delivery-service.js to accept an optional durable state store while retaining process-local fallback semantics for isolated development.

• Retrieved attachment metadata can now be written through the durable attachment-delivery record interface with user, provider-account, message, attachment, integrity, creation, access, and optional expiry metadata while keeping filesystem paths out of ordinary SQLite state.
