# GoreeCloud Mail User Manual

## Current availability

GoreeCloud Mail is in **Active Development**. Production deployment and public Stable release are not approved. It is a GoreeCloud email **client**, not a GoreeCloud-operated mailbox provider. Your configured external provider remains authoritative for mailbox hosting and Internet mail delivery.

## Development access model

Current source includes a responsive web client and trusted provider backend foundations. Real-provider use requires an approved Development environment with the corresponding provider authorization configured by the operator. Do not expect a public sign-up or hosted `@goreecloud` mailbox service from the current application.

The Development web shell defaults to a local demo provider. Operators can explicitly configure the page for the authenticated same-origin Mail gateway using only a non-secret provider-account identifier and root-relative gateway path. Reusable provider tokens, refresh tokens, app passwords, session secrets, and cryptographic keys must not be placed in browser metadata.

## Accounts and provider capabilities

GoreeCloud Mail uses provider-account connections rather than exposing reusable provider credentials to the browser. Available actions depend on the capabilities the external provider authorizes and the GoreeCloud adapter actually implements.

If an operation is unsupported, unavailable, or not authorized, GoreeCloud Mail should report that state rather than pretending it succeeded.

## Mailboxes and reading mail

The web shell now treats its mailbox rail as provider-driven navigation rather than decorative labels. Selecting a mailbox asks the configured Mail provider for that mailbox's message snapshot, updates the active mailbox title, clears the previous reader selection, and renders only the returned messages.

- Rapid mailbox changes are generation-guarded so a slower earlier read cannot overwrite a later selection.
- Browser search filters only the currently loaded mailbox snapshot; it does not silently broaden into other mailboxes.
- The Development demo provider currently supplies example Inbox and Starred behavior. Other demo mailboxes can legitimately be empty.
- Real gateway/provider environments remain authoritative for which mailboxes exist and which messages belong to each mailbox.

The current Gmail foundation supports authenticated mailbox listing and normalized message reading through trusted backend boundaries. In the browser reader, **Copy text** copies a bounded plain-text representation of the selected message to the browser clipboard when that API is available, and **Export text** downloads the same representation as a local text file. These actions include subject, sender/address, received time, body, and only an attachment-count notice; they do not copy attachment filenames or bytes and do not mutate the provider.

Provider HTML is untrusted; production HTML rendering remains gated until a maintained sanitizer is accepted. Remote-content privacy controls are governed by Privacy Shield.

## Browser composition

The Development browser composer supports:

- one or more **To** recipients;
- optional **Cc** recipients;
- optional **Bcc** recipients;
- subject and plain-text body entry;
- bounded local attachment selection/preview;
- **Reply** from an opened message; and
- **Forward** from an opened message.

Reply/Forward prepares deterministic plain-text context locally and avoids repeatedly adding an existing `Re:` or `Fwd:` prefix. Original attachments are not copied automatically; forwarding an attachment requires selecting it through the normal compose attachment path so the existing Wardveil-gated server boundary is not bypassed.

These browser conveniences do not establish provider threading, Reply All, original-attachment forwarding, or production provider parity.

## Attachments

Provider attachment bytes are treated as untrusted input. Where the current cached attachment-delivery path is used, GoreeCloud Mail requires a current authoritative Wardveil Scan clean result bound to the exact content before a cached object becomes downloadable. Malicious, suspicious, unknown, unsupported, expired, invalid, or scanner-unavailable results fail closed.

The browser composer can select and locally preview attachments under the current source limits of **20 files maximum, 10 MiB per file, and 20 MiB total**. Filename safety, media-type normalization, exact byte materialization, and declared-versus-read size checks occur before submission. These client checks improve usability but are not security authorization.

Demo mode never sends attachment bytes. In an explicitly configured authenticated gateway environment, the browser can submit the materialized attachment shape to the trusted Mail backend. The backend still validates the complete message, scans the exact outgoing bytes through Wardveil, requires current authoritative clean evidence, durably records minimized scan provenance, and only then permits the provider write.

Do not interpret a source-level attachment workflow as production scanning acceptance; runtime deployment and production security evidence remain separate gates.

## Sending mail

The current Gmail source supports bounded plain-text and sanitized rich composition, including bounded outgoing attachments through the trusted provider path. At least one recipient is required, header/body sizes are bounded, unsafe header characters are rejected, and Gmail write operations are not automatically retried.

The browser Development shell remains fail-closed by default: local demo mode can perform only its demo submission and rejects attachment-bearing sends. Gateway mode must be explicitly selected and uses the authenticated same-origin backend rather than browser-held provider credentials.

A caller may use a stable client mutation identifier for send reconciliation. If Gmail returns an ambiguous temporary failure after the single send attempt, GoreeCloud Mail can search the Sent mailbox for the server-generated RFC Message-ID instead of replaying the write. Exactly one matching message confirms the send. If the outcome cannot be confirmed, the application returns a non-retryable provider-write-outcome-unknown state so generic retry logic does not accidentally send a duplicate.

This is Development source behavior. Real Gmail timing/search-consistency acceptance and production provider environment acceptance are still required before production claims.

## Drafts

The current Gmail source supports bounded draft creation and replacement through the trusted provider service. Draft create/update writes remain one-attempt operations and are not automatically replayed.

When a stable client mutation identifier is supplied, GoreeCloud Mail inserts a server-generated deterministic RFC Message-ID into the draft message before the write. If Gmail returns an ambiguous temporary failure, the application performs a bounded draft lookup for that Message-ID. A unique match can confirm draft creation. For a draft replacement, the unique match must also have the exact provider draft ID being updated. Otherwise the result fails closed as non-retryable provider-write-outcome-unknown.

This reconciliation reduces duplicate-write risk but does not establish production Gmail timing or search-consistency acceptance. A failed or outcome-unknown response must not be interpreted as proof that Gmail did not create or update the draft.

## Sender identities and rich composition

Arbitrary caller-provided From identities fail closed unless a provider-confirmed sender-identity capability is implemented and authorized. Production sender-identity workflows, inline images, templates, complete signature tooling, and broader rich-composer parity remain separate milestones unless later source/documentation explicitly marks them implemented.

## Privacy and security expectations

- Provider credentials and refresh tokens belong in trusted backend custody, not browser-visible state.
- Mail content, links, HTML, attachments, sender metadata, and provider responses are untrusted input.
- Privacy Shield governs remote-content/privacy-sensitive flows.
- Wardveil Security governs applicable security decisions.
- GoreeCloud Identity governs GoreeCloud authentication/authorization boundaries.
- Everkeep governs accepted continuity, backup, recovery, preservation, and portability behavior.
- GoreeCloud Mesh governs authenticated cross-service coordination.

## Current limitations

The Development repository does not establish production provider connectivity, production OAuth consent/verification, complete sender identities, durable offline/cross-process operation journals, real-provider write-reconciliation timing acceptance, production HTML sanitizer acceptance, complete mailbox-action parity/threading/Reply All, complete native Android/iOS/Linux packaging, signed release distribution, or Stable qualification.

Refer to `README.md`, `SPECIFICATIONS.md`, `FEATURES.md`, and the `docs/` directory for implementation and acceptance details.
