# GoreeCloud Mail — Gmail Page and Message Identity Integrity

**Checkpoint:** November 8, 2026  
**Status:** Experimental Gmail-only web alpha. This is a defensive response-contract safeguard, not live provider certification or guaranteed snapshot-consistent pagination.

## Provider contract and trust boundary

Google's [Gmail messages.list API](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list) returns message identifiers and a possible `nextPageToken`; it does not return the content needed for inbox previews. The client then uses [messages.get](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get) to retrieve read-only metadata or full message details.

GoreeCloud Mail treats **every** returned page, message identifier, cursor and message metadata response as untrusted API input. A bad page must never cause an accepted partial page or silently advance the user's current cursor.

## Implemented checks

1. **Page structure:** The list response must be a JSON object. Its `messages` array, when present, must contain no more than the 30 entries requested by this experimental client.
2. **Identifiers:** Each message entry must contain a nonempty, unique, ASCII path-safe ID of at most 256 characters. No object/string coercion, newline suffix, path separator or encoded control character is accepted as a message ID. This is a deliberately narrower alpha policy than the public Gmail API's generic `string` type.
3. **Cursors:** `nextPageToken` must be a string (or absent) with no ASCII control characters and at most 4096 characters. Caller-supplied `pageToken` values are subjected to the same check **before** any provider request. Tokens are treated as opaque and never decoded or displayed as trusted content.
4. **Metadata linkage:** Each metadata response is normalized and its returned ID is compared with the specific ID requested from `messages.list`. Wrong IDs invalidate the whole page.
5. **Individual reads and mutations:** A message opened through `messages.get` must return the requested ID; message read and modification actions reject invalid identifiers before making requests.
6. **Atomic pagination:** A failed page throws a bounded diagnostic without returning a partial preview list or a new cursor. The UI's existing **Retry this page** flow keeps the prior visible page/cursor while a failed page is retried. Existing limited 429/5xx metadata retries and cancellation handling remain in effect.

This change adds **no new OAuth scope, network endpoint, background poller, storage, server, automatic sending, or automatic message mutation**.

## Security and compatibility notes

- The Gmail public API documents IDs and page tokens as strings, not a permanent character-set or length guarantee. GoreeCloud Mail's conservative ID/token restrictions can reject valid future or unusual provider data. Reevaluate through real test-account acceptance, rather than silently loosening limits.
- The provider's page token is opaque. This safeguard checks its type and size; it does not validate token authenticity or ensure mailbox ordering is frozen while mail arrives, is deleted, or changes labels.
- The comparison blocks accidental cross-message display from incorrect metadata responses; it is not message-signature verification and does not defend against a fully compromised account/API origin.
- The system does not persist provider tokens or fetched message content in browser localStorage as part of pagination.
- Message content is still plain-text-only, with strict MIME preview boundaries. No attachment body is downloaded or executed.

## Verification

Synthetic, local-only mock Gmail tests cover malformed response structure, oversized pages, duplicate IDs, invalid ID characters/newlines, non-string and excessive cursors (incoming and caller-supplied), mismatched metadata IDs, wrong full-message identity, invalid read/modify IDs, and preservation of ordinary paginated retrieval. Existing authorization, MIME, encrypted draft, UI and CI tests continue to run.

**103/103 automated tests and JavaScript syntax checks passed locally** on an isolated development checkout. This is not live Gmail API verification, manual connected browser acceptance, or Stable release certification.

## Remaining acceptance

- Disposable Gmail account: page/metadata identity and retries with actual Gmail responses, empty/short/full pages and rate-limit responses.
- Browser account switching, cancellation and stale requests while a page is loading.
- Mailbox changes between pages; cursor expiration/recovery; large mailboxes; screen-reader status announcements.
- Ongoing review of the ID character and token length policy against legitimate provider behavior.

See [implementation status](IMPLEMENTATION_STATUS.md), [security](SECURITY.md), [architecture](ARCHITECTURE.md), and [OAuth acceptance](OAUTH_ACCEPTANCE.md).
