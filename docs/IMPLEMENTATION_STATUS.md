# GoreeCloud Mail — Verified implementation status

**Checkpoint:** 2026-11-05 (Gmail page integrity and account-session safety).  
**Version:** 0.1.0-alpha.1  
**Release status:** **Experimental; not Stable, not deployed, not default mail client.**

## Implemented in repository source

| Area | Observed source milestone | Important limitation |
| --- | --- | --- |
| Web shell | Responsive inbox/reader layout; light/dark and GC UI semantic tokens | Desktop-dark and mobile-light disconnected shell rendered; full visual acceptance outstanding |
| Gmail connection | Gmail readonly first; on-demand modify/send consent, granted scope checks and account continuity guard | Real Google consent and account-switch flow not tested |
| Views/search | Inbox, starred, sent, all; Gmail API search; 30-message pages with user-triggered Load more and atomic metadata acceptance | Gmail-only; the UI preserves previous pages and exposes Retry this page after a metadata failure; live provider quotas are unverified |
| Message reading | Plain-text preview/read; opening does not change provider read status | HTML/attachments deliberately suppressed |
| Message actions | Mark read/unread, star/unstar, archive via Gmail API | Live Gmail authorization not tested |
| Sending | User-triggered Gmail raw MIME send and recipient validation; manual passphrase-encrypted local draft snapshot | Plain text only; no attachments, provider drafts or automatic draft saving; delivery not guaranteed |
| Security foundation | Token and received mail in memory, textContent rendering, CSP, optional encrypted local draft with authenticated account binding | Cryptography and browser storage not independently audited |
| Automated testing | Node syntax, MIME/HTTP and OAuth tests, simulated UI flows, encrypted draft crypto/cancellation tests, and synthetic headless Chrome Web Crypto/localStorage smoke | No live Google OAuth, interactive composer acceptance, or cross-browser storage certification |
| Desktop/mobile | Responsive web viewport only | No native packages, OS integration, or default registration |
| Multi-provider/AI/offline | Defined in product specification | Not implemented |

## Verification evidence

- Repository source and five product/engineering documents committed to [GoreeCloud/mail](https://github.com/GoreeCloud/mail); latest test-bearing commit verified by fresh remote clone. [Five follow-up GitHub issues](https://github.com/GoreeCloud/mail/issues) and matching GoreeCloud Mail Todoist tasks track remaining acceptance work.
- Node.js syntax and **37/37 automated tests: PASS** from branch commit `672e60e72e49b91227f2a352c7c95945263f065f` on the authorized Linux laptop (November 5, 2026). Coverage includes MIME validation, OAuth scope boundaries, stale account-profile responses, atomic Gmail metadata pagination with bounded transient retry and no cursor advancement on unresolved failures, 401/403 denial, cancelled retries, encrypted drafts and simulated interface workflows. This is mocked-provider and local code evidence, not a live Gmail account verification.
- Headless Flatpak Chrome screenshots inspected: **1440×900 desktop dark**, **390×844 mobile light**, and **390×844 mobile dark with the visible account-settings control and shortened search placeholder** (November 5, 2026). App HTML, CSS, JS modules and local icon returned HTTP 200. Responsive layout and basic empty states were visible; visual quality, high zoom and screen-reader acceptance are still incomplete.
- Message reader, mailbox and profile responses use state-generation guards; partial message-metadata page failures leave the previous cursor unchanged, while 429/5xx metadata errors are retried at most twice with abortable delays. Gmail 401/403 responses propagate without metadata retry. The page-load UI is wired to Gmail cursors and switches to a retry action after an unresolved page failure, preserving previously loaded messages. A simulated UI test covers failure then successful retry. A simulated interaction test confirmed stale results do not repopulate the disconnected or switched mailbox. Provider-side cancellation and real-browser connected states remain unverified.
- The incremental authorization and mobile settings changes are on `main`; first connection is read-only, further scopes require explicit user actions, and a mismatched Google account is disconnected. The `gmail.modify` grant itself remains broad under Google's API.
- Both the encrypted draft implementation and composer discard guard are merged into `main`; cancellation and Escape/native dialog close clear the passphrase and prevent late crypto results from writing or restoring data. One local encrypted snapshot requires explicit Save/Restore and a passphrase; it is **not** automatic or provider-synchronized. The user can delete it explicitly. Local Disconnect preserves the encrypted snapshot but clears in-memory contents and token state.
- The composer now warns on Discard or Escape if recipient, subject or body is present. The browser also receives a standard before-unload warning request while a nonempty composer is open; some browsers can ignore it. Simulated UI tests cover recipient-only and subject-only cases.
- Headless Chrome mobile layout previews at **390×844** showed the four-action composer and draft passphrase dialog legible and within the viewport. These were **static preview dialogs**, not a connected end-to-end browser workflow or accessibility sign-off.
- A separate **headless Flatpak Chrome Web Crypto + localStorage smoke test passed** on 2026-11-05, using a synthetic draft and an isolated localhost origin. It verified encrypted persistence, authenticated restoration, wrong-passphrase denial, account mismatch denial and deletion. The test did **not** connect Gmail, use actual email or perform interactive form/accessibility acceptance. The temporary Chrome debug service, local HTTP servers, scripts and isolated browser profiles were cleaned up.
- No live email sending, actual account access, complete browser acceptance, native runtime or production deployment claimed.

## Open high-priority work

1. Real browser/OAuth verification with a test Gmail account, explicit consent, and no production mailbox use.
2. Complete mobile/desktop interactive visual inspection, keyboard/AT audits, loading/error states and high-zoom behavior.
3. Verify incremental scopes, granular consent behavior and identity continuity against a real dedicated test Gmail account, including provider-level grant semantics.
4. Expand the single headless Chrome crypto smoke test into real-browser UI/form/storage acceptance across Chrome/Firefox/Safari/mobile, passphrase and storage quota/retention audits, and recovery. Add reliable automatic and provider-synchronized drafts only after their own security/storage acceptance.
5. Add robust MIME parsing, attachment handling, threading, quota-aware pagination recovery, and sender identities; the limited two-retry mechanism is not a complete Gmail quota scheduler.
6. Build and verify desktop/mobile provider adapters with security and device test plans.
7. Follow full GC UI visual/accessibility acceptance and platform-specific Stable gates.
8. Reconcile public repository inventory and linked Drive project records in-place. The Drive connector requires an uploadable file reference for raw Markdown byte replacement, so root inventory was **not** changed; see [issue #5](https://github.com/GoreeCloud/mail/issues/5).

No project-system task or repository issue may be marked complete on unverified capability claims.
