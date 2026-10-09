# Contributing to GoreeCloud Mail

Work from a short-lived topic branch based on current main. Keep changes reviewable, preserve GPLv3 provenance, and do not rewrite published history.

Do not reintroduce Mailspring cloud identity, tracking, billing, analytics, or telemetry as default behavior. Treat message HTML, links, attachments, filenames, provider data, and imported configuration as untrusted input. Preserve privacy-first remote-content defaults.

Before opening a pull request, run the applicable checks:

    npm ci
    npm run policy:check
    npm run lint:check
    npm run typecheck
    npm test

User-facing visual changes also require Glaze, accessibility, and visual-asset review. A merge is not automatically a Stable or production release.
