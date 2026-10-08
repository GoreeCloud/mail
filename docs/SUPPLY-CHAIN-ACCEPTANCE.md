# GoreeCloud Mail — Supply-chain acceptance

**Status:** Blocked. This is a review record, not evidence of production acceptance.

## Confirmed risks (2026-10-08)

- Run 37852000084 completed installation with 12 npm advisory findings (10 high, 2 moderate). Advisory identities, exploitability, and remediation are not yet reviewed.
- `scripts/postinstall.js` downloads a Mailsync archive from the inherited third-party S3 distribution endpoint when its submodule build is unavailable.
- The current downloader does not establish an expected SHA-256 digest or verified signature before decompressing the archive.
- The inherited `app/node_modules` install and Mailsync binary download may change independently of an exact source revision. A successful `npm ci` does not establish reproducible release provenance.

## Release-blocking acceptance criteria

1. Generate and review a complete software bill of materials, including separate root, app and native engine dependencies.
2. Triage each npm advisory against runtime reachability and the supported platforms. Document upgrades and tests, not blanket suppression.
3. Build Mailsync from pinned, audited source or obtain a signed artifact from a trusted, approved publisher. Pin immutable artifact digests for each distribution target.
4. Verify downloaded bytes against pinned digests **before** unpacking or executing anything; reject missing, mismatched, partial and unexpected platform artifacts.
5. Review archive extraction safety, permissions, file ownership and traversal/symlink behavior. Replace inherited download plumbing with atomic verified extraction.
6. Produce independently rebuildable installers, signed release provenance, license notices, dependency attestations and documented rollback.
7. Keep experimental or unverified binaries outside any production distribution or conformance claim.

## Validation

The companion dependency-audit CI job is intentionally fail-closed on high-severity npm advisories. It does **not** certify the native Mailsync engine. Passing JS audits alone is insufficient.

See issue #4 for tracking and draft PR #1 for integration readiness.
