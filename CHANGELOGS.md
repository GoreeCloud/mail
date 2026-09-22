# GoreeCloud Mail — Changelogs

**Record type:** Authoritative repository changelog index and current change history  
**Repository:** `GoreeCloud/mail`  
**Lifecycle:** Development / nonconformant  
**Migration state:** Candidate on `migration/repository-feature-records-20260922`; becomes authoritative only after accepted merge to `main`.  
**Current baseline:** `096f53da62c92567cd2fe949fe40a4f6e946a68c`.  
**Governing standard:** Standard — Repository Feature Tracking and Changelog Governance v1.0.

## Authority and interpretation

After accepted migration, this file becomes the repository-local changelog authority. Historical Mail chronology formerly stored in Google Drive is preserved in fourteen contiguous files under `docs/changelog-history/`.

The historical archive preserves all 699 non-empty paragraphs from `Change Log — Mail.docx` in source order. Historical Draft/candidate/lifecycle statements apply only to their original dated context and do not override current authoritative `main`.

Open or unmerged pull requests are not accepted changes. The current direct-main Draft line through PRs #60–#63 and older open Draft stacks remain candidate-only.

## Historical Drive archive

Legacy source:
- `Change Log — Mail.docx`
- Drive file ID `1KFedQv6vx9TiZYabLu7u07CNFc15oVJf`

Migrated repository archive:
- [`legacy-drive-mail-changelog-part-01.md`](docs/changelog-history/legacy-drive-mail-changelog-part-01.md) — source non-empty paragraphs 1–50 of 699
- [`legacy-drive-mail-changelog-part-02.md`](docs/changelog-history/legacy-drive-mail-changelog-part-02.md) — paragraphs 51–100
- [`legacy-drive-mail-changelog-part-03.md`](docs/changelog-history/legacy-drive-mail-changelog-part-03.md) — paragraphs 101–150
- [`legacy-drive-mail-changelog-part-04.md`](docs/changelog-history/legacy-drive-mail-changelog-part-04.md) — paragraphs 151–200
- [`legacy-drive-mail-changelog-part-05.md`](docs/changelog-history/legacy-drive-mail-changelog-part-05.md) — paragraphs 201–250
- [`legacy-drive-mail-changelog-part-06.md`](docs/changelog-history/legacy-drive-mail-changelog-part-06.md) — paragraphs 251–300
- [`legacy-drive-mail-changelog-part-07.md`](docs/changelog-history/legacy-drive-mail-changelog-part-07.md) — paragraphs 301–350
- [`legacy-drive-mail-changelog-part-08.md`](docs/changelog-history/legacy-drive-mail-changelog-part-08.md) — paragraphs 351–400
- [`legacy-drive-mail-changelog-part-09.md`](docs/changelog-history/legacy-drive-mail-changelog-part-09.md) — paragraphs 401–450
- [`legacy-drive-mail-changelog-part-10.md`](docs/changelog-history/legacy-drive-mail-changelog-part-10.md) — paragraphs 451–500
- [`legacy-drive-mail-changelog-part-11.md`](docs/changelog-history/legacy-drive-mail-changelog-part-11.md) — paragraphs 501–550
- [`legacy-drive-mail-changelog-part-12.md`](docs/changelog-history/legacy-drive-mail-changelog-part-12.md) — paragraphs 551–600
- [`legacy-drive-mail-changelog-part-13.md`](docs/changelog-history/legacy-drive-mail-changelog-part-13.md) — paragraphs 601–650
- [`legacy-drive-mail-changelog-part-14.md`](docs/changelog-history/legacy-drive-mail-changelog-part-14.md) — paragraphs 651–699

Together these files preserve the complete non-empty Drive chronology, including source milestones, failed/corrected validation attempts, Draft candidate evidence, provider boundaries, Wardveil/Privacy Shield work, GLAZE UI transitions, and release-boundary statements.

## Current repository changelog

### September 22, 2026 — Repository feature/changelog governance migration candidate
- Add root `IMPLEMENTED-FEATURES.md`, `PLANNED-FEATURES.md`, and `CHANGELOGS.md`.
- Preserve all 699 non-empty legacy Drive changelog paragraphs across fourteen contiguous repository historical-provenance files.
- Reconcile the former root `FEATURE-ROADMAP.md` and broader Drive roadmap into evidence-backed implemented/open records.
- Explicitly disposition every legacy FR identifier.
- Correct active feature/changelog governance records to live repository identity `GoreeCloud/mail`; the old `GoreeCloud/goreecloud-mail` identity remains only where historical or stale-source provenance is explicitly described.
- Update the current GLAZE UI planning target to verified Official Stable V1.6 / `1.6.0` without relabeling accepted Mail source as V1.6-complete.
- Add a repository-governance regression check requiring the new root records, all fourteen archive parts, their contiguous source-range markers, and absence of the retired root roadmap filename.
- No provider behavior, mailbox authority, authentication/session runtime, Android runtime, permission, network behavior, platform-system runtime authority, Production Acceptance, Release Candidate, or Stable state is changed by this governance migration.
- Drive sources remain migration sources until this candidate is accepted, authoritative `main` is read back, post-merge validation passes, and the deletion gate is satisfied.

### September 9, 2026 — Root feature-roadmap control added
- Accepted `096f53da62c92567cd2fe949fe40a4f6e946a68c` added the legacy root `FEATURE-ROADMAP.md` control file.
- That file is now subject to retirement under the repository-native feature/changelog governance standard.

### September 8, 2026 — Platform Contract 0.2 accepted on main
- PR #49 merged as `dcf60bd619a080baf9b9454a164f0b9e7297cf75`.
- Added the accepted Mail Platform Contract 0.2 declaration while preserving Development/nonconformant status and explicit release blockers.
- The accepted manifest still contains the pre-rename repository namespace and an older GLAZE UI plane; current direct-main Draft PR #60 proposes control-plane reconciliation but remains unmerged.

### September 8, 2026 — Wardveil scan input bounds hardened
- PR #48 merged as `9803fba4aacebad4dea6ab2e866791602b90b5f2`.
- Wardveil scan inputs were restricted to bounded binary content before hashing/signing/transport, with fail-closed regression coverage.

### September 2, 2026 and earlier — migrated Drive chronology
See the fourteen-part complete historical archive linked above. It preserves the source chronology and original status/evidence language through its final September 2 Development entries.

## Drive retirement gate

The mapped Drive roadmap and changelog must not be deleted until:
1. this migration is accepted through the repository workflow;
2. applicable exact-head checks pass;
3. the three root records and fourteen-part historical archive are read back from authoritative `main`;
4. retired root `FEATURE-ROADMAP.md` is confirmed absent;
5. directly affected repository references/governance are reconciled; and
6. applicable post-merge validation passes on the accepted revision.

Only after those gates pass may these two mapped legacy Drive sources be permanently deleted:
- roadmap `FEATURE-ROADMAP.docx` — `1C9HNOKLlRFBEiomCA6Uf-2TmJMDyEvoy`
- changelog `Change Log — Mail.docx` — `1KFedQv6vx9TiZYabLu7u07CNFc15oVJf`

After deletion, independently verify both IDs return not found, then record the retirement event in a narrow follow-up change.

## Maintenance rule

Record meaningful implementation, architecture, security/privacy, migration, compatibility, lifecycle, deployment, recovery, release, and correction events here with exact evidence when relevant. Preserve historical facts; do not rewrite old evidence to match later architecture.
