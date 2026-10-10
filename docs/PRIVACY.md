# Privacy Baseline

Automatic remote-image loading is off by default because remote resources can reveal message opens, network metadata, and client behavior.

Normal GoreeCloud Mail operation must not require a Mailspring ID. Legacy identity, tracking, subscription, billing, public-asset, and Mailspring Pro services are disabled by default. The temporary migration switch GOREECLOUD_MAIL_ENABLE_LEGACY_MAILSPRING_SERVICES=1 must never be a production default.

Inherited automatic crash upload and the hard-coded upstream Sentry destination are disabled. Any future remote diagnostics require an explicit GoreeCloud endpoint, minimization, privacy review, retention rules, and appropriate user controls.

Desktop notification IPC rejects missing identifiers or titles and does not include rejected icon paths or raw OS notification errors in diagnostic logs. This is application-local minimization and does not establish Privacy Shield conformance.

Local mailbox databases, caches, indexes, attachment caches, configuration, and diagnostics are sensitive. Provider OAuth and reusable credentials belong in approved secret-storage boundaries and must not be committed to source or exposed to untrusted message content.

Privacy Shield remains the policy authority; this document records application-local behavior and does not grant conformance.
