# GoreeCloud Mail Android Client

This directory contains the first-party native Android application line for GoreeCloud Mail.

## Current Development foundation

The Android client now includes a Kotlin/Jetpack Compose `:app` module targeting SDK 36 with minimum SDK 29 and Java 17. The current shell provides a launchable mailbox interface and a truthful runtime-capability model, but it deliberately remains disconnected from production mail services.

Current implemented foundation:

- Native Android application module and launcher activity.
- Compose-based Development mailbox surface.
- Explicit capability state for account transport, background synchronization, push notifications, secure local storage, and attachment handling.
- Fail-closed Development behavior: no `INTERNET` permission and no backend/account authority is claimed.
- Android backup disabled for the current shell.
- Unit coverage proving the Development shell does not advertise unavailable runtime capability.
- Gradle caching, parallel execution, and incremental Kotlin compilation enabled.

## Next Android work

The next implementation tranches should add, independently and with explicit acceptance evidence:

- GoreeCloud Mail account/session binding.
- Provider-independent mail transport and synchronization.
- Protected local message/index storage.
- Background work and push notification boundaries.
- Attachment download/open/share policy.
- Offline queueing and conflict handling.
- Wardveil Security and Privacy Shield acceptance.
- Everkeep recovery/restore behavior where applicable.
- Glaze UI V1.3 application-level migration and accessibility acceptance.
- APK/AAB CI, SBOM/provenance, protected signing, representative-device validation, and release acceptance.

Signing material and reusable secrets must remain outside GitHub and outside source-controlled application configuration.
