# GoreeCloud Mail — Development Notes

## Current stabilization context

- Repository lifecycle remains Development; Production Acceptance, Release Candidate, deployment, and Stable qualification are not established.
- Canonical GitHub repository identity is `GoreeCloud/mail`.
- This branch starts from authoritative `main` `ae086ae5dceeb789b6d0d64d641fb88f0a92c717`, after the repository-native `IMPLEMENTED-FEATURES.md`, `PLANNED-FEATURES.md`, and `CHANGELOGS.md` migration and verified Drive retirement.
- The retired `FEATURE-ROADMAP.md` model is not restored by this stabilization work.
- The current-main restack changes only the repository control plane to Platform Contract 0.4, declares all nine Integral Platform Systems, pins the accepted shared evaluator, corrects repository identity, and records current Official Stable GLAZE UI V1.6 / 1.6.0 as the required migration target.
- The implemented web presentation remains historical V1.1 / 1.1.0 Development source; this branch does not relabel it as V1.6-conformant.
- The disconnected native Android work in PRs #61–#63 remains unmerged Development work and is not represented as current-main runtime authority.
- External mail providers remain authoritative for mailbox hosting, mailbox content, Internet delivery state, and provider-owned policy except where an approved provider interface explicitly delegates an operation.

## Active stabilization gates

- Fresh current-main GLAZE UI V1.6 migration and application-specific rendered, accessibility, responsive, representative-environment, rollback, Human Visual Excellence, release, and production acceptance.
- Accepted GoreeCloud Identity, Privacy Shield, Wardveil Security, Everkeep, Mesh, Manager, Policy, and Observability runtime integrations where applicable.
- Complete provider production interoperability, provider credential custody, account/session isolation, health/readiness, synchronization/offline behavior, recovery, upgrade/rollback, protected signing/provenance, deployment, Release Candidate, and Stable qualification.
- Recover native Android and Linux implementation only through bounded current-main tranches rather than wholesale promotion of stale stacked branches.
- Keep stabilization issue #66 open until exact-candidate release-readiness evidence satisfies the repository-local and portfolio gates.

## Maintenance boundary

Use this file for repository-local implementation and maintenance observations. Promote durable requirements and authoritative decisions to their governed records. Do not store reusable credentials, OAuth tokens, provider secrets, encryption keys, signing secrets, or other sensitive values here.
