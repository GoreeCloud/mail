# GoreeCloud Mail Security

GoreeCloud Mail is in Active Development and is not yet production-ready.

Mail content, remote resources, links, attachments, filenames, calendar payloads, contact fields, provider metadata, and protocol responses are untrusted input. Reusable provider credentials, OAuth refresh tokens, application passwords, private keys, and equivalent long-lived secrets must not be exposed through source control, ordinary logs, renderer content, or user-facing documents.

Current foundation controls block automatic remote-image loading, disable inherited Mailspring cloud-only packages, disable inherited automatic crash upload, and remove the hard-coded upstream Sentry destination.

A known P0 transition debt remains: the inherited top-level Electron renderer still uses a privileged compatibility boundary with Node integration and without context isolation. Production acceptance requires replacing that boundary with an explicit preload/IPC capability surface. Third-party plugin execution also requires an explicit permissions and sandboxing decision.

Use GitHub private security advisories for sensitive vulnerability reports when available.

## Sign-in guest boundary (tested development candidate)

The imported remote sign-in Webview has a bounded hardening candidate in the
GoreeCloud Mail development branches. Electron's trusted main process configures
attached guest WebContents to deny window creation, strips requested preload/Node
privileges, and requires isolation and sandboxing. The React guest wrapper does
not forward arbitrary guest console output or popup URLs to Electron's external
shell. Sign-in HTTP failures show generic messages rather than full URLs, which
can contain credentials. The combined security candidate passed automated tests
in draft PR #11 and with sterile SQLite migration verification in draft PR #13;
this does **not** establish real-provider or installed-desktop acceptance.

A denied popup is **not** a completed OAuth authorization implementation.
Before enabling a legitimate external identity-provider flow, implement and
review an explicit user-initiated allowlisted handoff with state/redirect
validation, provider behavior tests, account isolation, and a secure return path.
Do not restore remote-web-content-driven host navigation.

This source-level control does **not** establish production security. The
inherited top-level renderer remains privileged (Node integration enabled,
context isolation disabled), and exact-head CI, installed-app hostile-content
testing, sign-in compatibility and authentication review remain mandatory.

## Release security acceptance (fail closed)

`docs/acceptance/mail-security.json` is the source-controlled acceptance gate
for this development candidate, not a substitute for GitHub checks or provider
runtime evidence. It records that production/release eligibility is **false**:
the top-level renderer still has inherited Node integration and no context
isolation, and desktop hostile-content tests, provider authorization flows,
dependency provenance, and installer/accessibility review remain outstanding.

The root and application dependency audit gates currently identify high or
critical advisories (see GitHub issue #4). Successful functional Jasmine tests
do not supersede those failed audits. Security hardening must preserve account
privacy, system browser handoff controls and existing sandbox protections. Do
not flip an acceptance status based solely on a source edit, draft PR, or passing
CI run. Complete the independent runtime tests and required review first.
