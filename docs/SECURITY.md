# GoreeCloud Mail — Security and Privacy

**Scope:** First experimental browser client, not audited or ready for sensitive/production mail.

## Threat boundaries

- Treat provider responses, message subjects, headers, bodies, attachments, and all external links as untrusted data.
- Do not execute HTML, inline event handlers, scripts, active attachments, remote images, or tracking pixels from mail.
- Current message viewer uses textContent only; text/plain content may include malicious wording, so it is never trusted as commands.
- OAuth access tokens are short-lived and **in memory only**, never in URL parameters, localStorage, logs or repository.
- Only the public Google OAuth client ID is stored locally; users can clear it.
- Requests are HTTPS-only to the configured Gmail API origin. CSP restricts script, frame and connect origins, with no inline JS.
- Gmail modifies and sends only on explicit user interactions. Mail reading and modify/send scopes require high-trust OAuth consent.
- No external analytics/tracking SDK. No remote mail storage owned by GoreeCloud.
- Error messages intentionally omit Gmail response bodies to reduce accidental private-data leakage.

## Known limits and open risks

1. Google Identity Services compatibility, consent screen verification and app-origin configuration require real-browser testing.
2. The browser has no encrypted persistent cache or draft recovery; do not promise offline mailbox storage.
3. Plain text only: HTML-only emails display a safety notice; rich message rendering and attachments are not yet supported.
4. Gmail modify/send scopes are broad for a prototype. Split read/send scopes and use incremental authorization before release.
5. Sending accepts recipient list and subject with basic validation, but production MIME headers, internationalized mailboxes and all edge cases require a reviewed mail library and fuzz testing.
6. The current code does not yet implement CSP reporting, phishing scanning, key management, malware scanning, certificate pinning, S/MIME or OpenPGP.
7. Metadata retrieval may be partial on rate limiting; improve per-item error visibility and paginated loading.
8. Revocation currently discards local tokens; users may need to revoke OAuth grants at their Google account settings.
9. No system-level browser cache audit, screen-reader audit or penetration test has been completed.

## Development and contribution safeguards

- Never commit tokens, client secrets, email content, private domains, contact addresses, or production logs.
- Review dependencies, licenses, permissions, workflow actions, external scripts and supply-chain changes before running them.
- Do not enable email body transmission to any AI provider without separate informed consent.
- No mail servers, relays, proxy accounts, credential theft or insecure provider compatibility hacks.
- Security problems should be disclosed privately through an approved channel; do not attach sensitive example messages to public issues.

## Minimum release gates

- Verified OAuth flow and correct scope handling in Chromium, Firefox, Safari and supported mobile browsers.
- Secure credential persistence only if/when introduced, with keychain-backed storage and attack-surface review.
- MIME parser and composer hardened, attachment safety review and HTML sandbox/sanitizer tested.
- Clear privacy policy, permission inventory, threat model and provider compatibility matrix.
- No critical/high unmitigated vulnerabilities; green tests and manual privacy/security review.
