# Gmail OAuth Acceptance Plan

**Status:** Test plan only. No live Google OAuth session or email delivery has been validated.

## Test setup

- Use a dedicated non-production Gmail test account with no private messages. Obtain an authorized Google Cloud OAuth 2.0 **Web application** client ID. Configure the exact localhost JavaScript origin and Gmail API access; review Google's consent and restricted scope verification requirements.
- Never commit OAuth tokens, a client secret, actual account emails, or screenshots of private correspondence.
- Serve the static app locally over HTTP localhost for development; the app is an email **client only**. Do not deploy or set it as a default mail app.

## Threaded reply acceptance (not yet executed)

- In a dedicated test mailbox, open a safe synthetic received message with a valid Message-ID, then click **Reply**. Confirm no new Google scope was requested merely for drafting; recipient and subject remain locked and body is editable.
- Confirm an authorized explicit send emits a Gmail messages.send request with the requested threadId, In-Reply-To and References headers, and only reports provider acceptance after a matching threadId and message ID in the response.
- Exercise missing/invalid Reply-To, duplicate header fields, changed recipient/subject attempts and a Gmail receipt with an unexpected thread ID. Confirm the composer remains open, no automatic retries occur and the user is told to check Sent before retrying.
- Restore an explicitly saved encrypted reply draft in the same account; confirm that its thread metadata is not readable in localStorage and that a different account or wrong passphrase cannot recover it.

## Permission acceptance

1. Connect: consent requests **gmail.readonly**, not send or modify. Record the granted scopes shown by Google and confirm the inbox is accessible.
2. Open an unread message: the message displays in plain text, but **no provider modification request** occurs.
3. Select Mark read, Star, or Archive: Gmail should request **gmail.modify** only on a user action; deny it and confirm the mailbox remains readable with no mutation.
4. Retry a modification and grant access. Check the same-account safety check before the API mutation. Note that Gmail's modify scope itself permits sending according to the provider documentation.
5. Compose and explicitly select Send: request **gmail.send** in context; deny it and confirm **no** send request was submitted. Reauthorize and verify the correct test account is used.
6. Repeat with a different Google account selected during the privilege escalation. The app must disconnect rather than send or modify the originally selected mailbox.
7. Disconnect while a request or popup is pending; stale callbacks must not repopulate the inbox or restore a token.
8. Verify that a local disconnect removes memory state but **does not** claim revocation of Google's OAuth grant. Check explicit revocation in Google Account settings separately.

## Browser and provider gates

- Repeat in current Chromium/Chrome, Firefox, Safari where available and supported mobile browsers; test popup blocking and consent denial.
- Verify token expiry, 401/403 errors, network interruptions, rate limits, partial metadata failures, and search pagination.
- Use synthetic test messages only; confirm headers, MIME, recipients and status of accepted vs delivered messages. Simulate a lost send response or missing message ID and verify the composer remains open, the user sees a check-Sent-before-retrying warning, and no automatic duplicate send is attempted.
- Run accessibility smoke tests with keyboard, screen readers, zoom, high contrast and reduced motion.
- Record test evidence in an authorized private system without email bodies/tokens and update [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) only after confirmation.

Official scope documentation: https://developers.google.com/workspace/gmail/api/auth/scopes

Official token model: https://developers.google.com/identity/oauth2/web/guides/use-token-model
