# GoreeCloud Mail — Conservative Gmail Threaded Replies (Experimental Alpha)

**Status:** Implemented on the Gmail-only web client development branch. The feature does **not** claim successful live Gmail threading, multi-provider reply interoperability, or delivery guarantees.

## User behavior

- When a Gmail message is open, the user can choose **↩ Reply**. This prepares a new draft without sending anything or requesting additional permissions.
- The recipient is selected from the original `Reply-To` header when a single supported address is present; otherwise from a single supported `From` header. Unclear, repeated, malformed, or unsupported address formats cause a refusal rather than a guessed recipient.
- The composer has an accessible heading, contextual `THREAD REPLY` label and a description announced for replies; these return to new-message semantics when the reply is discarded or completed.
- The composer fills the recipient and `Re:` subject. Both are **read-only** for threaded replies; starting a new message is required to change either. A separate programmatic check rejects changes even if the UI is bypassed.
- The original `Message-ID`, supported `References`, and Gmail `threadId` are validated. A newly submitted reply carries `In-Reply-To` and `References` MIME headers alongside the target `threadId` in the Gmail API request.
- Sending requires the user's explicit **Send with Gmail** action, the existing Gmail Send scope, same-account validation and normal input checks.
- A Gmail receipt must contain a valid message ID **and a thread ID matching the requested reply thread** before the client reports provider acceptance. Missing or mismatched responses are treated as an **unknown outcome**; the draft remains open and the user is warned to check Gmail Sent before retrying. No automatic send retries are performed.

Google's <https://developers.google.com/workspace/gmail/api/guides/threads> specifies the requested thread ID, standards-compliant reply reference headers and matching subject as prerequisites for adding a message to an existing thread. These are **necessary conditions, not proof that Gmail will thread a given real message**.

## Privacy and security controls

- No hidden `Bcc`, third-party recipient lookup, contact enrichment, external content fetch, or recipient redirection.
- The first release accepts simple ASCII mailboxes and conservative address display-name syntax only; unusual yet valid RFC address formats may be refused.
- A parent `Message-ID` must fit a restricted ASCII format and be at most 180 characters; `References` permits up to 12 IDs with a 900-character combined line. A missing/invalid parent, ambiguous headers, unsupported subject, or invalid Gmail thread ID disables the reply workflow.
- The original recipient is recorded in the reply context. Attempting to change the recipient or subject rejects the threaded send before contacting Gmail.
- An explicit **Save encrypted draft** stores the recipient, subject, body and reply context together using the existing passphrase-encrypted browser-local draft mechanism. No reply metadata is separately written as plaintext; the browser retains only one encrypted snapshot. This is not automatic or provider-synchronized draft saving.
- The feature uses the existing provider's authorized full-message response and does not open external links, execute HTML, download attachments or operate a mail server.
- No automatic email send, modification, provider draft save, or web deployment was introduced.

## Verified and pending

Synthetic/mock tests cover Reply-To precedence, fallback, response headers, Gmail `threadId` request, the reply composer, consent remaining read-only while drafting, mismatched recipients/subjects, invalid headers/references, encrypted reply drafts, unexpected provider thread receipts and the no-retry policy. These tests do not access real mailbox content.

Before Stable, evaluate actual Gmail threading with a dedicated test mailbox, real-world encoded display names and non-ASCII addressing, long/signed headers, reply-all, multiple identities, cross-provider compatibility, keyboard/screen-reader flows, message delivery outcomes, and an independent security review.

See [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY.md](SECURITY.md), [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md), and [OAUTH_ACCEPTANCE.md](OAUTH_ACCEPTANCE.md).
