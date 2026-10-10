# Privacy Baseline

Automatic remote-image loading is off by default because remote resources can reveal message opens, network metadata, and client behavior.

Normal GoreeCloud Mail operation must not require a Mailspring ID. Legacy identity, tracking, subscription, billing, public-asset, and Mailspring Pro services are disabled by default. The temporary migration switch GOREECLOUD_MAIL_ENABLE_LEGACY_MAILSPRING_SERVICES=1 must never be a production default.

First-account setup now omits the inherited newsletter control and upstream paid-subscription step. The legacy newsletter component also no longer auto-enrolls an account after a status lookup; any future approved marketing preference requires explicit informed opt-in. Clean-install, returning-account and accessibility acceptance remain pending.

Inherited automatic crash upload and the hard-coded upstream Sentry destination are disabled. Any future remote diagnostics require an explicit GoreeCloud endpoint, minimization, privacy review, retention rules, and appropriate user controls.

Local mailbox databases, caches, indexes, attachment caches, configuration, and diagnostics are sensitive. Provider OAuth and reusable credentials belong in approved secret-storage boundaries and must not be committed to source or exposed to untrusted message content.

Privacy Shield remains the policy authority; this document records application-local behavior and does not grant conformance.
