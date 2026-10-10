# Feature Preservation Gate

| Capability | Current state | GoreeCloud direction |
| --- | --- | --- |
| Multiple accounts | Inherited | Preserve and harden isolation |
| Unified inbox | Inherited | Preserve |
| Threads/conversations | Inherited | Preserve |
| Compose/drafts | Inherited | Preserve; harden HTML/paste boundary |
| Attachments | Inherited | Preserve; strengthen path/type/safety controls |
| Search | Inherited | Preserve; evaluate owned index architecture |
| Labels/folders | Inherited | Preserve provider semantics |
| Snooze | Inherited with legacy coupling risk | Decouple from upstream cloud services |
| Send later | Inherited with legacy coupling risk | Preserve with explicit queue/recovery semantics |
| Rules/templates | Inherited | Preserve |
| Contacts/calendar views | Inherited | Preserve where approved |
| Notifications | Inherited | Preserve with privacy-sensitive content controls |
| Keyboard shortcuts/localization | Inherited | Preserve and expand accessibility |
| Offline operation | Inherited | Preserve; test recovery and cache reconstruction |
| Theme/plugin system | Inherited high-trust model | Review before Stable |
| Read/open tracking | Legacy cloud dependent | Disabled by default; privacy decision required |
| Link tracking/analytics | Legacy cloud dependent | Disabled by default |
| Mailspring subscription/billing | Upstream-specific | Remove |
| Mailspring ID | Upstream-specific | Remove from normal product flow |
| Crash telemetry | Upstream-specific | Disabled by default |

## Interpretation and acceptance boundaries

**Inherited** means the imported Mailspring client includes legacy source/UI paths relevant to the named capability. It does **not** mean the feature is tested on a supported GoreeCloud build, free of upstream-cloud dependencies, available for every provider, privacy-accepted, or production-ready. `Legacy cloud dependent` explicitly requires replacement, governed removal, or an approved provider-compatible alternative. No entry in this table is a release-acceptance claim.

The comprehensive [GoreeCloud Mail capability catalog](https://docs.google.com/document/d/1nkRDbhXr1PlkPRuKkCrFuAESKh15cNa5/edit) is a **proposed product blueprint**, not implemented parity. The [capability traceability crosswalk](./MAIL-CAPABILITY-TRACEABILITY.md) defines domain-level evidence and provisional per-item references; the [security acceptance record](./acceptance/mail-security.json) controls fail-closed production/release eligibility.

Before declaring one preserved or newly implemented feature accepted, record the exact provider, platform and client version, approved security/privacy behavior, real account or synthetic integration tests, installed-app verification, failure/recovery paths and evidence of any requested deprecation. A source snippet or passing unit test alone cannot satisfy provider compatibility, Glaze UI, offline recovery or security acceptance. Do not treat optional AI, collaboration, read tracking, link analytics, mobile clients or provider-specific capabilities as already delivered.

A migration phase fails this gate when an approved capability disappears without a reviewed replacement or deprecation decision.
