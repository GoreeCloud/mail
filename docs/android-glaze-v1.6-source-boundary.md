# Mail Android — GLAZE UI V1.6 Source Boundary

## Status

This Development tranche establishes a repository-local Android source mapping to current Official Stable GLAZE UI V1.6 / 1.6.0.

Shared Glaze UI Stable status and consumer eligibility do not establish GoreeCloud Mail application acceptance. Mail remains separately acceptance-gated.

## Stable source binding

The source mapping records:

- GLAZE UI version: 1.6.0.
- Stable release tag: v1.6.0.
- Accepted release source: a7180679ea851389e0f3004515f9a25f420e716d.
- Known-good rollback baseline: 1.5.1.
- Shared consumer eligibility: true.
- Automatic Mail application acceptance: false.

## Presentation-only runtime context

The Android shell projects only local Android presentation signals:

- current font scale;
- whether Android animators are enabled;
- whether touch exploration is enabled.

These signals may alter presentation policy such as reduced motion, large-text reflow, touch target floor, screen-reader-oriented focus treatment, screen gutter, and material fallback.

No mailbox content, message body, sender/recipient data, provider account, Identity session, attachment content, security verdict, synchronization state, or remote content may enter this presentation projection.

## Optical boundary

The repository records fail-closed V1.6 optical principles, but the optical engine adapter is not accepted and is not consumed by MainActivity.

The source boundary explicitly records that:

- telemetry is not required;
- camera and remote context are not required;
- environmental color memory influence is zero;
- message/mailbox/recipient/provider/Identity/attachment/security-state sampling is forbidden;
- optical context cannot grant semantic or operational authority;
- provider conflicts fail closed;
- automatic consequential action is forbidden;
- physical-device, assistive-technology, Human Visual Excellence, and representative real-device performance acceptance remain false.

## Current shell use

The disconnected Development shell consumes the resolved V1.6 source policy only for local presentation composition, including screen gutter and surface radius.

This is not full V1.6 application adoption. Rendered verification, assistive-technology testing, representative devices/form factors, focus behavior, optical/material fidelity, performance, rollback, and human visual review remain required before Mail can claim application-level V1.6 acceptance.

## Authority boundary

This tranche does not add network permission, provider/session transport, mailbox authority, Identity authentication, message synchronization, attachment transfer, production telemetry, or any other operational authority.
