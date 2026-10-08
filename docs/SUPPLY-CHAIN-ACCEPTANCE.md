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

## Audit evidence: October 8, 2026

The dependency-audit job in PR #5 exited nonzero with twelve findings (ten high, two moderate).

| Dependency family | Advisory | Evidence-based disposition |
| --- | --- | --- |
| `braces` via `micromatch`, `fast-glob`, `globby`, TypeScript ESLint | GHSA-vfj7-8cjw-p6xm | High. The suggested `npm audit fix --force` crosses a major parser version; stage and test a deliberate toolchain upgrade. |
| `http-cache-semantics` | GHSA-ch52-4w7c-c8xp | High. `npm audit fix` is advertised; identify the exact parent and lockfile change before applying. |
| `highlight.js` through `devtron` | GHSA-7wwv-vh3v-89cq | Moderate. No automated fix advertised; review whether obsolete developer tooling can be removed safely. |

The root package currently places build and developer tools in `dependencies`. The `--omit=dev` audit therefore includes tools that should be classified and analyzed separately. Do not dismiss a finding merely because it comes from developer tooling: build-chain exposure still affects released artifact integrity.

A green audit is not enough on its own. The installed engine is downloaded from an upstream distribution and the existing postinstall does not pin an expected archive digest.

**Verification:** Advisory identity and dependency paths were extracted from CI run 37856853053. No dependency upgrades or Mailsync integrity improvements have yet been verified.

## Development downloader controls (not release acceptance)

The `scripts/postinstall.js` downloader now waits for the downloaded archive file to finish writing and for extraction to complete. Network, HTTP, over-size, interrupted download, and extraction errors fail the install. Downloads use a temporary path before being moved to the archive name.

For candidate releases, set `GOREECLOUD_MAIL_RELEASE_MODE=1` and an independently approved 64-character `GOREECLOUD_MAIL_MAILSYNC_SHA256`; missing or mismatched configured digests fail closed. The SHA-256 value must come from a trusted build/provenance process, not simply from the archive downloaded in the same run.

**Limitations:** This is not a production approval. Archive path traversal, symlink handling, executable trust, target file replacement, platform packaging, and approved publisher attestation remain unverified. Existing development/CI downloads can still use the inherited upstream archive without an expected digest; keep that artifact out of releases until independently verified.
