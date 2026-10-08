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

A migration phase fails this gate when an approved capability disappears without a reviewed replacement or deprecation decision.
