# GoreeCloud Mail Android Client — Build Status

## Target artifacts

- Development APK now.
- Android App Bundle only after a later governed release-packaging tranche.

## Current state

- Native Android build root and `:app` module established on the current-main recovery line.
- Kotlin / Jetpack Compose, compile/target SDK 36, minimum SDK 29, Java 17.
- Debug application identity is `com.goreecloud.mail.dev`.
- The Development manifest intentionally declares no `INTERNET` permission.
- Backup and cleartext traffic are disabled.
- Runtime account transport, background sync, push, secure storage, and attachment handling remain `NOT_IMPLEMENTED`.
- Platform Contract target is 0.4.
- Current mandatory design-system target is GLAZE UI V1.6 / 1.6.0, but application-level Glaze acceptance is false.
- Production acceptance and runtime connection are false.
- JVM tests cover capability and governance truthfulness.
- Exact-head CI must pass unit tests, lint, Development APK assembly, APK identity verification, and authority-boundary checks.

## Open gates

GLAZE UI V1.6 migration/rendered acceptance, Identity/provider authentication, network transport, provider interoperability, offline state, Wardveil/Privacy Shield and other applicable platform-system runtime acceptance, representative devices, recovery/rollback, protected signing/provenance, Release Candidate, Production Acceptance, and Stable qualification remain open.
