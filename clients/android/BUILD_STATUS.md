# GoreeCloud Mail Android Client — Build Status

## Target artifacts

- Development APK now.
- Android App Bundle only after a later governed release-packaging tranche.

## Current state

- Native Android build root and `:app` module integrated on verified `main` through approved squash-merged PR #70 at `548a21c33318a7ab7cc7e6c43defccf048b065e5`. This is a disconnected Development source/build foundation only; independent post-merge push workflow/artifact acceptance and representative-device/runtime validation remain open.
- Kotlin / Jetpack Compose, compile/target SDK 36, minimum SDK 29, Java 17.
- Debug application identity is `com.goreecloud.mail.dev`.
- The Development manifest intentionally declares no `INTERNET` permission.
- Backup and cleartext traffic are disabled.
- Runtime account transport, background sync, push, secure storage, and attachment handling remain `NOT_IMPLEMENTED`.
- Platform Contract target is 0.4.
- Current mandatory design-system target is GLAZE UI V1.6 / 1.6.0, but application-level Glaze acceptance is false.
- Production acceptance and runtime connection are false.
- JVM tests cover capability and governance truthfulness.
- PR #70 exact-head CI passed unit tests, lint, Development APK assembly, APK identity verification, authority-boundary checks and source-bound artifact upload. The PR-head artifact was independently checksum-verified; new-main push evidence has not yet been independently verified.

## Open gates

GLAZE UI V1.6 migration/rendered acceptance, Identity/provider authentication, network transport, provider interoperability, offline state, Wardveil/Privacy Shield and other applicable platform-system runtime acceptance, representative devices, recovery/rollback, protected signing/provenance, Release Candidate, Production Acceptance, and Stable qualification remain open.
