# GoreeCloud Mail Android Client

This directory contains the current-main recovery line for GoreeCloud Mail's first-party native Android client.

## Current Development foundation

The Android client is intentionally a disconnected Development sidecar. It provides a buildable Kotlin/Jetpack Compose application shell targeting Android SDK 36 with minimum SDK 29 and Java 17, while preserving all runtime mail capabilities as unavailable.

Current foundation:

- Native Android `:app` module and launcher activity.
- Development application identity `com.goreecloud.mail.dev`.
- No `INTERNET` permission and no provider/session transport.
- Android backup disabled and cleartext traffic disabled.
- Explicit fail-closed capability state for account transport, background synchronization, push notifications, secure local storage, and attachment handling.
- Explicit Platform Contract 0.4 and GLAZE UI V1.6 / 1.6.0 source mapping bound to accepted release source `a7180679ea851389e0f3004515f9a25f420e716d`.
- `glazeUiAccepted=false`, `productionAccepted=false`, and `runtimeConnected=false`.
- JVM tests proving capability and governance truthfulness.
- Exact-head CI that builds and verifies the Development APK.

The current UI now consumes a bounded local V1.6 presentation policy for font-scale, reduced-motion, touch-assistance, gutter, and surface-radius behavior. It is **not** represented as fully GLAZE UI V1.6-conformant or application-accepted; rendered, assistive-technology, physical-device, performance, and Human Visual Excellence acceptance remain open.

## Authority boundary

External mail providers remain authoritative for mailbox hosting, mailbox content, delivery state, and Internet mail transport.

This foundation adds no mailbox credentials, GoreeCloud Identity runtime registration, OAuth/OIDC client, provider account, network transport, local authoritative mailbox, background synchronization, push token, attachment transfer, secure message store, or production signing authority.

## Next governed tranches

Recover future Android capabilities only through bounded current-main branches. Identity registration/session binding, provider-account contracts, authenticated transport, synchronization, storage, notifications, attachments, current GLAZE UI V1.6 migration, platform-system runtime acceptance, representative-device testing, recovery, signing/provenance, Release Candidate, Production Acceptance, and Stable qualification remain separate gates.
