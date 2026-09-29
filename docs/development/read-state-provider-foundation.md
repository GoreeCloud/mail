# Read-State Provider Foundation — Development

GoreeCloud Mail now has an explicit provider mutation contract for marking a message read or unread.

## Implemented in this slice

- `setReadState(messageId, read)` is part of the provider contract.
- The local Development demo provider persists read/unread state for the lifetime of its provider instance and updates mailbox unread counts from that state.
- The authenticated same-origin gateway client maps the mutation to an account-scoped `PUT /messages/{id}/read-state` provider-gateway request.
- The capability remains explicitly gated by `readState`; the demo provider now advertises the capability because it implements the mutation.
- Automated tests cover demo round-tripping and gateway request shaping.

## Boundary

This is a Development provider/client foundation. It does not claim that every production mail adapter or deployed gateway currently supports the new route, and the browser reader has not yet been wired to expose a read/unread action. A provider must advertise `readState` only when its authoritative backend path is available and accepted.
