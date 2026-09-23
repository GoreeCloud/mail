# GoreeCloud Mail — Development Notes

## Current stabilization context

- Repository lifecycle remains Development; Production Acceptance, Release Candidate, deployment, and Stable qualification are not established.
- Canonical GitHub repository identity is `GoreeCloud/mail`.
- Authoritative `main` contains the current web/trusted-backend foundation. The older native Android PR stack is not accepted into `main` and must not be treated as current implementation authority.
- Authoritative `main` already contains the canonical `GoreeCloud/mail` Platform Contract 0.4 declaration, all nine Integral Platform Systems and the current accepted validator pin through merged PRs #68 and #69. V1.6 / 1.6.0 remains the required design-system target, not an accepted application migration.
- This new current-main-derived Draft branch proposes only the disconnected Android Development sidecar recovered selectively from historical PR #61; it adds no provider/session/network or production authority and is not integrated until a separate reviewed merge.
- The implemented web presentation remains historical V1.1 / 1.1.0 Development source; this candidate does not relabel it as V1.6-conformant.
- External mail providers remain authoritative for mailbox hosting, mailbox content, Internet delivery state, and provider-owned policy except where an approved provider interface explicitly delegates an operation.

## Active stabilization gates

- Fresh current-main GLAZE UI V1.6 migration and application-specific rendered, accessibility, responsive, representative-environment, rollback, Human Visual Excellence, release, and production acceptance.
- Accepted GoreeCloud Identity, Privacy Shield, Wardveil Security, Everkeep, Mesh, Manager, Policy, and Observability runtime integrations where applicable.
- Complete provider production interoperability, provider credential custody, account/session isolation, health/readiness, synchronization/offline behavior, recovery, upgrade/rollback, protected signing/provenance, deployment, Release Candidate, and Stable qualification.
- Recover native Android/Linux implementation only through bounded current-main tranches rather than wholesale promotion of stale stacked branches.

## Maintenance boundary

Use this file for repository-local implementation and maintenance observations. Promote durable requirements and authoritative decisions to their governed records. Do not store reusable credentials, OAuth tokens, provider secrets, encryption keys, signing secrets, or other sensitive values here.
