# GoreeCloud Mail — Verified implementation status

**Checkpoint:** 2026-11-08 (encrypted draft deletion accessible while disconnected).  
**Version:** 0.1.0-alpha.1  
**Release status:** **Experimental; not Stable, not deployed, not default mail client.**

## Implemented in repository source

| Area | Observed source milestone | Important limitation |
| --- | --- | --- |
| Web shell | Responsive inbox/reader; floating labeled bottom dock at mobile widths, safe-area clearance, light/dark settings access, GC UI semantic tokens | 320/390px disconnected mobile shell inspected; native devices, connected sessions and full accessibility acceptance outstanding |
| Gmail connection | Gmail readonly first; on-demand modify/send consent, granted scope checks and account continuity guard | Real Google consent and account-switch flow not tested |
| Views/search | Inbox, starred, sent, all; Gmail API search; 30-message pages with user-triggered Load more and atomic metadata acceptance | Gmail-only; the UI preserves previous pages and exposes Retry this page after a metadata failure; live provider quotas are unverified |
| Message reading | Bounded plain-text reader, inert attachment summaries and collapsed header inspector; MIME preview now traverses only multipart containers, excludes encapsulated messages and ambiguous dispositions, and bounds media type tokens | HTML and attachment contents suppressed; unusual valid MIME may be omitted; no sender authenticity verification or complete RFC parser |
| Message actions | Mark read/unread, star/unstar, archive via Gmail API | Live Gmail authorization not tested |
| Sending | Explicit Gmail plain-text send plus conservative **Reply** composer with locked recipient/subject, validated RFC reply headers and Gmail threadId; unknown receipts warned without retry | Not validated against a live Gmail thread; no reply-all, attachment sending or final delivery guarantee; automatic/provider drafts absent |
| Security foundation | Token and received mail in memory, textContent rendering, CSP, optional encrypted local draft with authenticated account binding (including validated reply context) | Cryptography and browser storage not independently audited |
| Automated testing | Node syntax, MIME/HTTP and OAuth tests, simulated UI flows, encrypted draft crypto/cancellation tests, and synthetic headless Chrome Web Crypto/localStorage smoke | No live Google OAuth, interactive composer acceptance, or cross-browser storage certification |
| Desktop/mobile | Responsive web viewport only | No native packages, OS integration, or default registration |
| Multi-provider/AI/offline | A versioned client-only adapter contract and **one concrete Gmail adapter** are implemented; AI/offline remain requirements | No Outlook, IMAP/SMTP, Proton, Tuta or other adapters; no multi-provider account switching |

## Verification evidence

- November 8, 2026 disconnected draft deletion: Settings exposes a confirmation-gated, browser-local ciphertext deletion action without Gmail connection or Web Crypto. A synthetic UI flow checks refusal on cancellation, successful deletion on approval and that the settings dialog stays open; a markup check guards the control. Combined **97/97 automated local tests** and syntax checks passed. A connected mailbox, real mobile accessibility and secure hardware erasure remain unverified.


- November 8, 2026 draft-data privacy hardening: local ciphertext existence checks and deletion no longer depend on a functioning Web Crypto implementation. Only saving/unlocking require Web Crypto. Three synthetic regression tests cover no-crypto deletion, minimal storage API and missing-method failures. **96/96 local tests** and JavaScript syntax checks passed on the development branch; PR/main CI, live browsers and secure hardware erasure are separate gates.


- November 8, 2026 MIME boundary branch: repaired malformed attachment-media-type matching and tightened body traversal to valid `multipart/*` containers, rejecting nested `message/rfc822`, fabricated non-multipart children, unknown/duplicate dispositions, malformed filename/attachment IDs and RFC 2231 filename continuations from automatic body display. Valid multipart reader fixtures and new regression tests passed in the **93/93 local suite**, plus JavaScript syntax checks. Live-provider and full RFC interoperability remain OPEN. See [MIME_PREVIEW_BOUNDARY.md](MIME_PREVIEW_BOUNDARY.md).


- November 8, 2026 CI hardening branch: official GitHub `actions/checkout` and `actions/setup-node` `v4` commit IDs verified, full-SHA pinned in the workflow, `contents: read` retained, and new static CI policy tests added. Combined **85/85 local tests** and syntax checks passed; PR and post-merge CI remain separate evidence gates until verified. See [CI_INTEGRITY.md](CI_INTEGRITY.md).


- November 8, 2026 mobile navigation branch: detached bottom dock and labeled actions at <=680px, safe-area/scroll clearance, reachable settings appearance toggle. Static dark screenshots at 390×844 and 320×720 and a light screenshot at 390×844 visually inspected; no account connected. New CSS/markup and interaction tests included; combined suite **83/83 passed locally** and syntax checks passed. See [MOBILE_DOCK.md](MOBILE_DOCK.md). Main-branch and real-device results are separate acceptance gates.


- Repository source and five product/engineering documents committed to [GoreeCloud/mail](https://github.com/GoreeCloud/mail); latest test-bearing commit verified by fresh remote clone. [Five follow-up GitHub issues](https://github.com/GoreeCloud/mail/issues) and matching GoreeCloud Mail Todoist tasks track remaining acceptance work.
- Node.js syntax and **97/97 automated tests: PASS** on an authorized Linux development laptop on November 8, 2026 (MIME containment development branch). Coverage includes MIME validation, OAuth scope boundaries, stale account-profile responses, atomic Gmail metadata pagination with bounded transient retry and no cursor advancement on unresolved failures, 401/403 denial, cancelled retries, encrypted drafts and simulated interface workflows. Coverage now also includes supported MIME charset handling, deep/broad MIME traversal rejection, oversized body refusal, attachment metadata bounds, untrusted-name normalization, and simulated reader presentation. Provider contract tests verify explicit implemented/unsupported capabilities, versioning, validation against unknown operations, inherited declarations, and hidden mutation methods. Five additional mocked send tests cover provider-accepted IDs, 200-without-ID ambiguity, network loss, explicit 403 rejection, and invalid input before any request. No automatic send retries are implemented. This remains mocked-provider and local code evidence, not a live Gmail account verification.
- Headless Flatpak Chrome screenshots inspected: **1440×900 desktop dark**, **390×844 mobile light**, and **390×844 mobile dark with the visible account-settings control and shortened search placeholder** (November 5, 2026). App HTML, CSS, JS modules and local icon returned HTTP 200. Responsive layout and basic empty states were visible; visual quality, high zoom and screen-reader acceptance are still incomplete.
- Message reader, mailbox and profile responses use state-generation guards; partial message-metadata page failures leave the previous cursor unchanged, while 429/5xx metadata errors are retried at most twice with abortable delays. Gmail 401/403 responses propagate without metadata retry. The page-load UI is wired to Gmail cursors and switches to a retry action after an unresolved page failure, preserving previously loaded messages. A simulated UI test covers failure then successful retry. A simulated interaction test confirmed stale results do not repopulate the disconnected or switched mailbox. Provider-side cancellation and real-browser connected states remain unverified.
- The incremental authorization and mobile settings changes are on `main`; first connection is read-only, further scopes require explicit user actions, and a mismatched Google account is disconnected. The `gmail.modify` grant itself remains broad under Google's API.
- Both the encrypted draft implementation and composer discard guard are merged into `main`; cancellation and Escape/native dialog close clear the passphrase and prevent late crypto results from writing or restoring data. One local encrypted snapshot requires explicit Save/Restore and a passphrase; it is **not** automatic or provider-synchronized. The user can delete it explicitly. Local Disconnect preserves the encrypted snapshot but clears in-memory contents and token state.
- The composer now warns on Discard or Escape if recipient, subject or body is present. The browser also receives a standard before-unload warning request while a nonempty composer is open; some browsers can ignore it. Simulated UI tests cover recipient-only and subject-only cases.
- Headless Chrome mobile layout previews at **390×844** showed the four-action composer and draft passphrase dialog legible and within the viewport. These were **static preview dialogs**, not a connected end-to-end browser workflow or accessibility sign-off.
- A separate **headless Flatpak Chrome Web Crypto + localStorage smoke test passed** on 2026-11-05, using a synthetic draft and an isolated localhost origin. It verified encrypted persistence, authenticated restoration, wrong-passphrase denial, account mismatch denial and deletion. The test did **not** connect Gmail, use actual email or perform interactive form/accessibility acceptance. The temporary Chrome debug service, local HTTP servers, scripts and isolated browser profiles were cleaned up.
- Attachment metadata is extracted read-only from the already-authorized full Gmail message response; the alpha does **not** download file bodies or use attachment APIs. No real-provider test or independent attachment security audit has been completed. See [ATTACHMENT_METADATA.md](ATTACHMENT_METADATA.md).
- The main web UI now imports Gmail through a validated static v1 provider adapter; the Gmail API, OAuth, and local encrypted-draft security behavior remain unchanged. Other providers are not implemented. See [PROVIDER_ADAPTERS.md](PROVIDER_ADAPTERS.md).
- Gmail send now distinguishes provider-accepted ID from unknown status, retains the composer on error, and advises checking Sent before retrying. This is not final-delivery confirmation and is unverified against a real Gmail mailbox.
- The collapsed header inspector uses existing Gmail full-message metadata, safely bounds and displays untrusted header values, and clears them when closing the reader or disconnecting. This is not raw source, independent sender verification, or an authentication verdict. See [MESSAGE_HEADERS.md](MESSAGE_HEADERS.md).
- Gmail metadata input hardening now refuses invalid or excessive message identifiers and bounds malformed header, MIME type, label, thread and snippet fields before display. Synthetic tests cover these cases; unusual legitimate provider data may be truncated.
- Reply drafting now uses Reply-To/From selection, protected subject/recipient, validated references and Gmail threadId, with encrypted draft context preservation. Reply messages with wrong or missing thread receipts are reported as uncertain without retry. See [THREADED_REPLY.md](THREADED_REPLY.md).
- The threaded Reply dialog now has a programmatic accessible name, reply-specific description/eyebrow, and reset to new-message cues. A simulated UI test and static markup check validate these transitions. This is not screen-reader or device acceptance.
- No live email sending, actual account access, complete browser acceptance, native runtime or production deployment claimed.

## Open high-priority work

1. Real browser/OAuth verification with a test Gmail account, explicit consent, and no production mailbox use.
2. Complete mobile/desktop interactive visual inspection, keyboard/AT audits, loading/error states and high-zoom behavior.
3. Verify incremental scopes, granular consent behavior and identity continuity against a real dedicated test Gmail account, including provider-level grant semantics.
4. Expand the single headless Chrome crypto smoke test into real-browser UI/form/storage acceptance across Chrome/Firefox/Safari/mobile, passphrase and storage quota/retention audits, and recovery. Add reliable automatic and provider-synchronized drafts only after their own security/storage acceptance.
5. Replace the bounded plain-text MIME preview with a reviewed standards-compliant MIME parser and secure attachment downloads/previews, threading, quota-aware pagination recovery and sender identities. The viewer's 4 MiB/256-node/32-depth limits and the two-retry mechanism are alpha safeguards, not general mail-client compatibility.
6. Build and verify desktop/mobile provider adapters with security and device test plans.
7. Follow full GC UI visual/accessibility acceptance and platform-specific Stable gates.
8. Reconcile public repository inventory and linked Drive project records in-place. The Drive connector requires an uploadable file reference for raw Markdown byte replacement, so root inventory was **not** changed; see [issue #5](https://github.com/GoreeCloud/mail/issues/5).

No project-system task or repository issue may be marked complete on unverified capability claims.
