# GoreeCloud Mail — Verified Gmail Label Changes (Experimental Alpha)

**Checkpoint:** November 8, 2026  
**Scope:** Existing explicit, single-message Gmail **Mark read/unread**, **Star/unstar**, and **Archive** actions. No new OAuth scopes, message-sending, server, background rule or bulk action.

## Why the change matters

Google's [`users.messages.modify` API](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/modify) accepts arrays of label IDs to add/remove, with a documented per-array limit of 100, and returns a Gmail `Message` resource. An HTTP success code alone should not silently cause GoreeCloud Mail to claim the selected message was updated if the returned ID or resulting label state cannot be confirmed.

## Implementation and trust boundaries

- The existing UI obtains explicit `gmail.modify` consent when needed and verifies the connected account before an action. The current implementation changes one selected message, not an entire thread.
- The adapter rejects empty, non-array, duplicated or contradictory label instructions before making HTTP requests.
- The request uses at most **100** added or removed label IDs per operation, each a bounded ASCII path-safe ID of at most **64 characters**. These are alpha client-side restrictions, not an assertion of Google's guaranteed label-ID character set or length.
- After a successful HTTP response, the adapter requires the returned message ID to match the requested ID and the returned `labelIds` to be a valid, bounded, duplicate-free array when present. A missing `labelIds` is interpreted as an empty label set, which is useful for a successful final-label removal.
- Every requested addition must be present, and every requested removal absent, in the returned label set. If these checks fail, the UI reports **Refresh before retrying**, does not apply a guessed local label state, and **never automatically repeats** a possibly accepted mutation.
- On a confirmed response, the reader and visible inbox list adopt the **provider-reported label state** rather than constructing an optimistic result from the requested action.
- Provider label metadata is still untrusted data; only a bounded, sanitized ID list is propagated to the UI. No additional message content is read or persisted.

## Behavioral limitations

- A request may have been applied remotely even if its response was lost or incomplete. The user must refresh to reconcile; blindly repeating a toggle may produce unexpected results.
- Gmail label sets may change concurrently through another device or mailbox rule. A confirmed response is a **point-in-time provider receipt**, not an immutable cross-device lock.
- The browser client still lacks provider draft synchronization, real-world account acceptance, multi-provider message-action semantics, background processing and full offline mutation queues.
- The 64-character label and 128-returned-label bounds are conservative alpha limits; review legitimate Gmail custom-label compatibility against actual disposable test accounts before Stable.
- The existing `gmail.modify` scope is powerful and must not be obtained without clear user consent. This hardening does **not** alter the scope requested or the user-action gate.

## Verified evidence

The combined automated suite passes **107/107** tests locally in an isolated checkout. New tests cover invalid label inputs and conflicts before HTTP, a matching success receipt, final-label removal with an omitted `labelIds` field, malformed or mismatched receipts with no automatic retry, and the UI's provider-confirmed label display. JavaScript syntax checks also pass.

Real Gmail, large/custom-label collections, account revocation mid-request, multi-browser accessibility, mobile devices and independent security review are **not** verified by these synthetic tests.

Related: [Gmail page and message identity integrity](GMAIL_PAGE_INTEGRITY.md), [security](SECURITY.md), [OAuth acceptance](OAUTH_ACCEPTANCE.md), and [implementation status](IMPLEMENTATION_STATUS.md).
