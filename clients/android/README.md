# GoreeCloud Mail Android Client

This directory contains GoreeCloud Mail's first-party **integrated but disconnected Android Development foundation**, merged through PR #70 on verified `main` `548a21c33318a7ab7cc7e6c43defccf048b065e5`. It is source/build integration, not connected native-product or device acceptance.

## Current Development foundation

The Android client is intentionally a disconnected Development sidecar. It provides a buildable Kotlin/Jetpack Compose application shell targeting Android SDK 36 with minimum SDK 29 and Java 17, while preserving all runtime mail capabilities as unavailable.

Current foundation:

- Native Android `:app` module and launcher activity.
- Development application identity `com.goreecloud.mail.dev`.
- No `INTERNET` permission and no provider/session transport.
- Android backup disabled and cleartext traffic disabled.
- Explicit fail-closed capability state for account transport, background synchronization, push notifications, secure local storage, and attachment handling.
- Explicit Platform Contract 0.4 and bounded GLAZE UI V1.6 / 1.6.0 Android presentation source mapping pinned to accepted release source `a7180679ea851389e0f3004515f9a25f420e716d`.
- `glazeUiAccepted=false`, `productionAccepted=false`, and `runtimeConnected=false`; no source mapping can change these acceptance flags.
- JVM tests for capability/governance truthfulness and the bounded V1.6 presentation/context policy, with separate fail-closed source validation.
- Passing exact-head PR #70 CI that built and verified the Development APK and preserved source-bound artifact evidence. Independent exact-main post-merge push workflow and artifact verification remains open.

The disconnected Development shell now consumes a bounded local V1.6 presentation policy for local font-scale/reflow, reduced-motion, touch-assistance interaction floors, screen gutters, and card corner radii. It is **not** represented as full GLAZE UI V1.6-conformant or application-accepted: physical-device rendering, TalkBack and keyboard behavior, performance, current-optics parity, responsive form factors, Human Visual Excellence and rollback acceptance remain open. The optical adapter is deliberately not enabled.

## Authority boundary

External mail providers remain authoritative for mailbox hosting, mailbox content, delivery state, and Internet mail transport.

This foundation adds no mailbox credentials, GoreeCloud Identity runtime registration, OAuth/OIDC client, provider account, network transport, local authoritative mailbox, background synchronization, push token, attachment transfer, secure message store, or production signing authority.

## Next governed tranches

Recover future Android capabilities only through bounded current-main branches. Identity registration/session binding, provider-account contracts, authenticated transport, synchronization, storage, notifications, attachments, current GLAZE UI V1.6 migration, platform-system runtime acceptance, representative-device testing, recovery, signing/provenance, Release Candidate, Production Acceptance, and Stable qualification remain separate gates.
