# GoreeCloud Mail — Development Notes

## Current stabilization context

- Repository lifecycle remains Development; Production Acceptance, Release Candidate, deployment, and Stable qualification are not established.
- Canonical GitHub repository identity is `GoreeCloud/mail`.
- Authoritative `main` contains the web/trusted-backend foundation and the bounded disconnected Android Development source integrated by PR #70 at `548a21c33318a7ab7cc7e6c43defccf048b065e5`. Historical stacked Android PRs #60–#63 remain unmerged and do not independently confer current implementation authority.
- Authoritative `main` already contains the canonical `GoreeCloud/mail` Platform Contract 0.4 declaration, all nine Integral Platform Systems and the current accepted validator pin through merged PRs #68 and #69. V1.6 / 1.6.0 remains the required design-system target, not an accepted application migration.
- PR #70 integrated only the disconnected Android Development sidecar selectively recovered from historical PR #61; no provider/session/network or production authority was added. Its exact-head PR checks passed and the merged source was independently read back. Fresh exact-main push-check and artifact acceptance remain unverified.
- The implemented web presentation remains historical V1.1 / 1.1.0 Development source. The bounded Android source maps local presentation-only signals to current Stable GLAZE UI V1.6 / 1.6.0; neither web nor Android has Mail-local rendered/device/accessibility or full V1.6 application acceptance.
- External mail providers remain authoritative for mailbox hosting, mailbox content, Internet delivery state, and provider-owned policy except where an approved provider interface explicitly delegates an operation.

## Active stabilization gates

- The Android source also contains a pure Mail-side native session-binding metadata readiness model referenced to GoreeCloud Identity Draft PR #9's separately verified Development source candidate `b010bcc3610c3898f108340b8c978bb783418980` and schema `goreecloud.identity.native-application-session/v1`. Identity runtime remains contract-only and its native registration registry is empty. Exact Mail principal/audience/account/client-instance and lifetime checks may be structurally source-ready but do not authenticate a user, authorize a mailbox, activate provider transport or make runtime readiness true.

- Complete fresh GLAZE UI V1.6 application adoption beyond the bounded Android source presentation mapping, with rendered/keyboard/TalkBack, accessibility, responsive/form-factor, representative-device, rollback, Human Visual Excellence, release and production acceptance; migrate the separately historical web V1.1 presentation.
- Accepted GoreeCloud Identity, Privacy Shield, Wardveil Security, Everkeep, Mesh, Manager, Policy, and Observability runtime integrations where applicable.
- Complete provider production interoperability, provider credential custody, account/session isolation, health/readiness, synchronization/offline behavior, recovery, upgrade/rollback, protected signing/provenance, deployment, Release Candidate, and Stable qualification.
- Recover native Android/Linux implementation only through bounded current-main tranches rather than wholesale promotion of stale stacked branches.

## Maintenance boundary

Use this file for repository-local implementation and maintenance observations. Promote durable requirements and authoritative decisions to their governed records. Do not store reusable credentials, OAuth tokens, provider secrets, encryption keys, signing secrets, or other sensitive values here.
