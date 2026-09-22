# GoreeCloud Mail — Legacy Drive Changelog History Part 04

**Source:** legacy Drive `Change Log — Mail.docx` (`1KFedQv6vx9TiZYabLu7u07CNFc15oVJf`)  
**Source non-empty paragraphs:** 151–200 of 699  
**Migration note:** Paragraph text below is preserved in source order. Historical lifecycle, branch, PR, validation, and acceptance statements apply only to their original dated context and do not override current authoritative repository state.

---

• Added expired OAuth-state cleanup and preserved application-relative redirect validation.

• Expanded tests/sqlite-state.test.js with durable credential-reference persistence/non-disclosure tests, cross-user isolation, durable OAuth restart behavior, replay prevention, wrong-user rejection, expiration, and purge coverage.

• Updated README.md to document the expanded durable-state boundary and the continuing production encrypted-secret-store requirement.

Security and privacy state: No reusable Gmail access token, refresh token, OAuth client secret, authorization code, mailbox password, PKCE verifier secret, mailbox content, IMAP/SMTP credential, DNS record, Caddy route, production deployment, or email-server functionality was introduced. OAuth state is stored only by hash, and provider credential records contain only vault references rather than reusable secret values.

Validation state: GitHub Actions CI run #138 / 32478857812 completed successfully on commit 09ac38e5295dead3fdf5da2abe768adeaa300290 after the SQLite OAuth-state, credential-reference, and test changes. The subsequent README documentation commit d608b9daeb7153b4aa50dfaa4d8f6a5f06b963fb triggered CI run #140, which was queued when this entry was recorded. Production acceptance remains separate from source CI.

Current state: Draft PR #1 remains open and mergeable. Durable application state now covers provider accounts, credential-vault references, OAuth authorization state, synchronization cursors, mailbox state, and operation idempotency. Major remaining security and production priorities are an approved encrypted secret-store adapter, database migration/versioning and backup/restore acceptance, maintained restrictive HTML sanitization, and controlled real-provider integration only after those boundaries are validated.

August 21, 2026 at 7:06 AM CDT — Encrypted Provider Credential Vault Foundation

Change type or category: Native backend development; credential encryption; sensitive-information separation; provider authentication security; testing; documentation.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; branch agent/initial-application-foundation; Draft PR #1; source-development environment only; no production runtime changes.

Summary and purpose: I continued GoreeCloud Mail by implementing the first persistent encrypted credential-vault adapter for provider secrets. The goal is to move beyond the development-only in-memory credential vault while preserving the existing rule that reusable provider credentials remain separate from ordinary SQLite application state and browser-visible responses.

Changes completed:

• Added server/encrypted-file-credential-vault.js as a controlled self-hosted encrypted-file credential adapter.

• The adapter encrypts the complete vault payload with AES-256-GCM using a separately supplied 32-byte runtime encryption key.

• The encryption key is never written into the credential-vault file.

• Each persisted vault generation uses a fresh 96-bit initialization vector and authenticated encryption so an incorrect key or modified ciphertext fails decryption rather than producing usable credential data.

• Vault persistence uses a temporary file followed by atomic replacement and forces the resulting credential-vault file to mode 0600.

• Credential records remain scoped by GoreeCloud user and opaque provider-account identifier, and public credential descriptions continue to omit secret values.

• Added tests/encrypted-file-credential-vault.test.js covering ciphertext-at-rest non-disclosure, restart persistence, restrictive file permissions, user/account isolation, wrong-key authenticated-decryption failure, descriptor privacy, and persistent removal.

• Added docs/credential-vault.md documenting the encryption boundary, runtime key-custody requirements, backup and recovery requirements, future key-rotation direction, and the distinction between source-level implementation and production secret-storage acceptance.

• Updated Draft PR #1 to record the encrypted credential-vault milestone and the remaining target-host acceptance requirements.

Security and privacy state: No real Gmail access token, refresh token, OAuth client secret, IMAP/SMTP password, application password, mailbox content, or production encryption key was added to source control or Google Drive documentation. Automated tests use synthetic credential values and synthetic encryption keys. The application SQLite database continues to store only credential-vault references rather than reusable provider secret values.

Validation state: The encrypted-vault source and tests have triggered exact-head GitHub Actions CI run #146 / 32480416501 on commit d17d57900e899724b7b87ac818f7afc4fa193527. At the time of this change-log entry the run is queued, so this exact head is not yet recorded as CI-validated. Production acceptance remains separate regardless of source CI outcome.

Current state: Draft PR #1 remains open, mergeable, and intentionally draft. The next major security and persistence priorities are target-environment secret-key injection and ownership design, credential-vault backup/restore and key-rotation proof, SQLite schema migration/versioning and database backup/recovery tooling, maintained restrictive HTML-sanitizer integration, and controlled real-provider connectivity only after those boundaries are accepted.

August 21, 2026 at 7:16 AM CDT — Encrypted Credential-Vault Key Rotation Foundation

Change type or category: Native backend development; credential encryption; key rotation; sensitive-information separation; testing; documentation.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; branch agent/initial-application-foundation; Draft PR #1; source-development environment only; no production runtime changes.

Summary and purpose: I extended the encrypted provider credential-vault foundation with an explicit key-rotation operation so an existing encrypted vault can be re-encrypted under a replacement runtime key without exposing provider secrets or moving them into ordinary SQLite application state.

Changes completed:

• Added rotateEncryptionKey to server/encrypted-file-credential-vault.js.

• Rotation parses and validates the replacement 32-byte key, re-encrypts the current credential set under that key, persists the replacement encrypted envelope before changing the active in-memory key, and continues to use a fresh AES-256-GCM initialization vector and atomic file replacement.

• Preserved mode 0600 on the rotated vault file and retained the rule that the encryption key itself is never written into the credential-vault file.

• Expanded tests/encrypted-file-credential-vault.test.js to prove that the previous key can no longer reopen a rotated vault, the replacement key recovers the same credential data, the rotated file remains mode 0600, and plaintext credential values plus scoped account/user identifiers remain absent from ciphertext-at-rest.

• Updated Draft PR #1 to record the key-rotation capability and distinguish source-level rotation support from a production key-custody and rollback procedure.

Security and privacy state: No real provider credential, production encryption key, Gmail access token, refresh token, OAuth client secret, IMAP/SMTP password, mailbox content, DNS record, Caddy route, production deployment, or email-server functionality was introduced. Tests use synthetic keys and synthetic credential values only.

Validation state: The key-rotation source and tests are committed at exact head 4f09e073c67c3bd3be30300ba2a186af98a18c58. GitHub Actions CI run #150 / 32480982289 was queued when this entry was recorded, so this exact head is not yet recorded as CI-validated. Production acceptance remains separate regardless of source CI outcome.

Current state: Draft PR #1 remains open, mergeable, and intentionally draft. Remaining secret-storage work includes target-host key injection and ownership, documented rotation rollback/recovery, credential-vault backup/restore proof, compromise response, and runtime acceptance. SQLite migration/versioning, database backup/recovery tooling, maintained restrictive HTML-sanitizer integration, and controlled real-provider connectivity also remain pending.

August 21, 2026 at 8:29 AM CDT — SQLite Schema Versioning, Migration Framework, Backup Snapshot, and Recovery Verification

Change type or category: Native backend development; durable persistence; database migration governance; backup and recovery; integrity verification; testing; documentation.

Affected project and environment: GoreeCloud Mail; GoreeCloud/goreecloud-mail; branch agent/initial-application-foundation; Draft PR #1; source-development environment only; no production runtime changes.

Summary and purpose: I continued GoreeCloud Mail by adding explicit SQLite schema versioning and a controlled database backup/recovery foundation. The work is intended to make future schema evolution auditable and recoverable before any real-provider mailbox is connected.

Changes completed:

• Added server/sqlite-migrations.js with an ordered repository-owned migration list, schema_migrations tracking, monotonic version reporting, and BEGIN IMMEDIATE transaction handling so failed migrations are rolled back rather than represented as applied.

• Established durable SQLite schema version 1 as baseline-mail-state. The baseline remains idempotent so earlier development databases can be adopted without destructive table recreation.

• Added schema_migrations to docs/persistence-schema.sql while continuing to exclude reusable provider secrets from ordinary application tables.

• Added server/sqlite-backup.js. Backup creation refuses source overwrite and pre-existing destinations, requests a WAL checkpoint, creates a consistent snapshot using VACUUM INTO, and immediately verifies the result with PRAGMA integrity_check and schema-version reporting.

• Added tests/sqlite-maintenance.test.js covering one-time migration application, baseline version reporting, backup integrity, restored provider-account and synchronization-state readability, source-overwrite refusal, and existing-destination refusal.

• Added docs/database-maintenance.md defining migration immutability, pre-migration backup expectations, recovery verification, private backup handling, retention direction, and remaining target-host acceptance requirements.

• Updated README.md and Draft PR #1 to reflect the migration, backup, and recovery milestone.

Security and privacy state: Application database backups may contain private account and synchronization metadata even though reusable provider credentials remain excluded. The documentation therefore explicitly prohibits publication of backups through web roots, static hosting, source control, or public backup paths. No real Gmail token, OAuth secret, mailbox, IMAP/SMTP credential, DNS record, Caddy route, production deployment, or email-server functionality was introduced.

Validation state: GitHub Actions CI run #162 / 32487356798 completed successfully on migration/backup source head 684ad02cbafe2c031e94de2ed4b7a7cd35bc522f. The README reconciliation head 9b5a6f933009daa15011fb14a046f85620e39764 triggered exact-head CI run #164 / 32487442654 and was queued at the time of this entry. Production backup/recovery acceptance remains separate from source CI.
