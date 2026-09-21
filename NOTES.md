# GoreeCloud Mail — Development Notes

## Current stabilization context

- Repository lifecycle remains Development; Production Acceptance, Release Candidate, deployment, and Stable qualification are not established.
- Canonical GitHub repository identity is `GoreeCloud/mail`.
- Authoritative `main` contains the current web/trusted-backend foundation. The older native Android PR stack is not accepted into `main` and must not be treated as current implementation authority.
- This current-main candidate migrates only the repository control plane to Platform Contract 0.4, declares all nine Integral Platform Systems, pins the accepted shared evaluator, corrects repository identity, and records current Official Stable GLAZE UI V1.6 / 1.6.0 as the migration target.
- The implemented web presentation remains historical V1.1 / 1.1.0 Development source; this candidate does not relabel it as V1.6-conformant.
- External mail providers remain authoritative for mailbox hosting, mailbox content, Internet delivery state, and provider-owned policy except where an approved provider interface explicitly delegates an operation.

## Active stabilization gates

- Stacked child `stabilize/android-session-binding-current-main-20260921` adds only a pure Mail-side session-binding readiness model on top of the green V1.6 source boundary. It references GoreeCloud Identity Draft PR #9 exact Development candidate `d6f0f47aa98a9f1bce5b27df5bbf52da71950c30`, validates exact non-secret principal/audience/account/client-instance/lifetime metadata, and still forces runtime readiness false because the Identity contract is contract-only and the native registration registry remains empty. No credential, network, provider, mailbox, or mutation authority is added.

- Stacked child `stabilize/android-glaze-v1.6-source-boundary-20260921` adds only a repository-local GLAZE UI V1.6 / 1.6.0 presentation source mapping on top of the green disconnected Android foundation. It binds the accepted shared release source, projects only local Android font-scale/animator/touch-exploration signals, forbids mail/provider/Identity/attachment/security state from optical context, keeps the optical adapter inactive, and leaves Mail-local rendered, assistive-technology, device, performance, Human Visual Excellence, production, release, and Stable acceptance open.

- Current child candidate `stabilize/android-native-foundation-current-main-20260921` rebuilds only the disconnected native Android foundation on top of the green Platform Contract 0.4 control-plane candidate. It uses Development identity `com.goreecloud.mail.dev`, requests no INTERNET permission, keeps all five runtime mail capabilities NOT_IMPLEMENTED, records GLAZE UI V1.6 / 1.6.0 as migration-required rather than accepted, and adds exact-head build/test/APK evidence. No provider/session transport, mailbox authority, runtime platform-system acceptance, release, or production authority is added.

- Fresh current-main GLAZE UI V1.6 migration and application-specific rendered, accessibility, responsive, representative-environment, rollback, Human Visual Excellence, release, and production acceptance.
- Accepted GoreeCloud Identity, Privacy Shield, Wardveil Security, Everkeep, Mesh, Manager, Policy, and Observability runtime integrations where applicable.
- Complete provider production interoperability, provider credential custody, account/session isolation, health/readiness, synchronization/offline behavior, recovery, upgrade/rollback, protected signing/provenance, deployment, Release Candidate, and Stable qualification.
- Recover native Android/Linux implementation only through bounded current-main tranches rather than wholesale promotion of stale stacked branches.

## Maintenance boundary

Use this file for repository-local implementation and maintenance observations. Promote durable requirements and authoritative decisions to their governed records. Do not store reusable credentials, OAuth tokens, provider secrets, encryption keys, signing secrets, or other sensitive values here.
