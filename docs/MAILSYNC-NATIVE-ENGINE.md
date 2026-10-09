# GoreeCloud Mail — Native Mail Engine Migration

**Status: active, not production-ready.** The initial upstream desktop application remains a Fork-to-Native foundation. This document describes a source-level migration step, not a completed replacement of Mailspring-Sync.

## Verified root cause

The imported app pins the `mailsync` submodule to Foundry376/Mailspring-Sync commit `675e9f22e4db4938786231fba9992f0cba489d3b`.

At `MailSync/main.cpp`, the non-debug executable checks whether the lowercased `argv[0]` contains a string calculated from inherited usage messages. The calculated string is `mailspring`. If absent, the engine returns **2** before processing migration requests. This intentionally inherited upstream product-name constraint matches GoreeCloud Mail CI run 37861621811 (Mailsync migration process exited 2).

The Linux release package contains a small `mailsync` shell launcher and a native `mailsync.bin` executable. Inspecting the shell launcher using `readelf` or `ldd` is not a valid native-engine dependency check.

## Controlled source modification

The GPLv3-licensed source can be modified and redistributed subject to its license and preservation of applicable provenance, notices and corresponding-source obligations. Nothing in this repository authorizes claiming an upstream endorsement.

The first GoreeCloud-specific source modification lives **inside GoreeCloud/mail**, at:

- `engine/patches/0001-remove-legacy-executable-name-lock.patch`
- `scripts/prepare-native-mailsync.sh`

The patch removes only the upstream release-mode product-name restriction and its obsolete dependency comment. The remainder of the engine is not declared ported or audited.

To prepare the source for an independently reviewed engine build:

```bash
git submodule update --init mailsync
bash scripts/prepare-native-mailsync.sh
```

The preparation script requires the exact pinned source revision and a clean engine worktree, verifies patch applicability, and then applies the tracked patch locally. It intentionally does **not** build the engine, fetch unverified binaries, alter another repository, sign an artifact or change the production install path.

## Release and validation gates

1. Choose a maintained, reproducible source build environment for supported platforms; pin dependencies and preserve GPLv3 source and modification notices.
2. Build the modified native engine from reviewed source, not the inherited downloaded release archive.
3. Inspect and authenticate artifact provenance, platform architecture, shared libraries and archive extraction behavior before distribution.
4. Run a sterile `--mode migrate` test with a GoreeCloud Mail data directory and confirm that the engine no longer exits with the inherited product-name status.
5. Verify data migrations, provider compatibility, account isolation, offline behavior, secure credential boundaries, installer update/rollback behavior and native smoke tests.
6. Remove any remaining hard-coded legacy cloud identity assumptions through explicit migration work, not compatibility naming tricks.
7. Regenerate and validate the applicable CI, signed-binary and software bill of materials evidence on an exact release candidate.

**No native rebuild or application-test pass is established by this patch.** Legacy archive downloading and dependency audit failures remain separate release blockers. See issues #3, #4 and draft pull requests #1 and #5.
