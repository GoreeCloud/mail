# GoreeCloud Mail — Fork-to-Native Roadmap

Status: Active / not production ready.

## Source foundation
- Import upstream Mailspring with ancestry and GPLv3 notices intact.
- Preserve useful email feature coverage while migration proceeds.
- Treat source migration as an architectural starting point, not a native-completion claim.

## Immediate follow-up
- Verify reproducible installation, typecheck, lint, tests, and builds on supported targets.
- Replace legacy identity, paid-tier, analytics, read-tracking, send-later, and subscription dependencies with governed GoreeCloud implementations or explicit reviewed deprecations.
- Remove top-level renderer privileges using an isolated preload and narrow audited IPC.
- Audit link navigation, HTML sanitization, resource loading, attachments, filesystem paths, plugins and update channels.
- Reconcile packaging, app IDs, icons, translations, login pages and all branded surfaces.
- Adopt Glaze 1.7.0 and collect Mail-specific rendered, accessibility, visual, performance and rollback evidence.
- Evaluate all seven Integral Platform Systems individually; do not presume conformance.
- Validate mailbox providers, token protection, account isolation, offline recovery, searches, drafts, sending and migrations.
- Produce signed and independently verified distribution artifacts only after release gates pass.
