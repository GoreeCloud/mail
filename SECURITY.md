# GoreeCloud Mail Security

GoreeCloud Mail is in Active Development and is not yet production-ready.

Mail content, remote resources, links, attachments, filenames, calendar payloads, contact fields, provider metadata, and protocol responses are untrusted input. Reusable provider credentials, OAuth refresh tokens, application passwords, private keys, and equivalent long-lived secrets must not be exposed through source control, ordinary logs, renderer content, or user-facing documents.

Current foundation controls block automatic remote-image loading, disable inherited Mailspring cloud-only packages, disable inherited automatic crash upload, and remove the hard-coded upstream Sentry destination.

A known P0 transition debt remains: the inherited top-level Electron renderer still uses a privileged compatibility boundary with Node integration and without context isolation. Production acceptance requires replacing that boundary with an explicit preload/IPC capability surface. Third-party plugin execution also requires an explicit permissions and sandboxing decision.

Use GitHub private security advisories for sensitive vulnerability reports when available.
