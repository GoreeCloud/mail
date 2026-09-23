# GoreeCloud Mail Android Client

Target artifacts:

- APK
- Android App Bundle

Current state:

- Native Android application module established under `clients/android/app`.
- Development shell uses Kotlin, Jetpack Compose, SDK 36, minimum SDK 29, and Java 17.
- Launcher activity and disconnected mailbox surface are implemented.
- Runtime capability state is explicit for account transport, background sync, push notifications, secure local storage, and attachment handling.
- All network/data capabilities remain fail-closed and `NOT_IMPLEMENTED`; the manifest intentionally declares no `INTERNET` permission.
- Android backup is disabled for the Development shell.
- JVM tests cover capability truthfulness.
- Gradle wrapper/build-environment validation, instrumentation testing, signing, SBOM/provenance, representative-device acceptance, and release acceptance remain pending.
- Signing keys must remain outside GitHub.
