# Privacy Baseline

Automatic remote-image loading is off by default because remote resources can reveal message opens, network metadata, and client behavior.

Normal GoreeCloud Mail operation must not require a Mailspring ID. Legacy identity, tracking, subscription, billing, public-asset, and Mailspring Pro services are disabled by default. The temporary migration switch GOREECLOUD_MAIL_ENABLE_LEGACY_MAILSPRING_SERVICES=1 must never be a production default.

The inherited automatic update feed is disabled until a validated GoreeCloud distribution service exists. Version, device and legacy identity values must not be sent to Mailspring update infrastructure; manual checks report unavailability, and an unavailable update action cannot close mailbox windows. This remains a development measure, not a substitute for signed security updates, verification, and rollback.

Inherited automatic crash upload and the hard-coded upstream Sentry destination are disabled. Any future remote diagnostics require an explicit GoreeCloud endpoint, minimization, privacy review, retention rules, and appropriate user controls.

Local mailbox databases, caches, indexes, attachment caches, configuration, and diagnostics are sensitive. Provider OAuth and reusable credentials belong in approved secret-storage boundaries and must not be committed to source or exposed to untrusted message content.

Privacy Shield remains the policy authority; this document records application-local behavior and does not grant conformance.
