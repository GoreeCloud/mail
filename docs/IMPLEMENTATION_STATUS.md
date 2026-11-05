# GoreeCloud Mail — Verified implementation status

**Checkpoint:** 2026-11-05 (granular OAuth security milestone).  
**Version:** 0.1.0-alpha.1  
**Release status:** **Experimental; not Stable, not deployed, not default mail client.**

## Implemented in repository source

| Area | Observed source milestone | Important limitation |
| --- | --- | --- |
| Web shell | Responsive inbox/reader layout; light/dark and GC UI semantic tokens | Desktop-dark and mobile-light disconnected shell rendered; full visual acceptance outstanding |
| Gmail connection | Gmail readonly first; on-demand modify/send consent, granted scope checks and account continuity guard | Real Google consent and account-switch flow not tested |
| Views/search | Inbox, starred, sent, all; Gmail API q search | Gmail-only; 30 results per page with user-triggered Load more; mocked provider test coverage |
| Message reading | Plain-text preview/read; opening does not change provider read status | HTML/attachments deliberately suppressed |
| Message actions | Mark read/unread, star/unstar, archive via Gmail API | Live Gmail authorization not tested |
| Sending | User-triggered Gmail raw MIME send, validation | Plain text only; no attachments/durable drafts; delivery not guaranteed |
| Security foundation | Token in memory, no message persistence, textContent rendering, CSP | Not independently audited |
| Automated testing | Node syntax, MIME/HTTP mock tests, OAuth permission/denial/cross-account tests and simulated UI flows | No live Google OAuth or real provider integration tests |
| Desktop/mobile | Responsive web viewport only | No native packages, OS integration, or default registration |
| Multi-provider/AI/offline | Defined in product specification | Not implemented |

## Verification evidence

- Repository source and five product/engineering documents committed to [GoreeCloud/mail](https://github.com/GoreeCloud/mail); latest test-bearing commit verified by fresh remote clone. [Five follow-up GitHub issues](https://github.com/GoreeCloud/mail/issues) and matching GoreeCloud Mail Todoist tasks track remaining acceptance work.
- Node.js syntax and **24/24 automated tests: PASS** on the authorized Linux laptop at commit `03b18d6ef12c61847e76191b2d7956cb3e896143` on the authorized Linux laptop (November 5, 2026). The tests cover MIME safety, mocked Gmail API paging/errors, OAuth read-only and on-demand capability requests, denied permissions, late-popup cancellation, cross-account send blocking, and the mobile account-settings control.
- Headless Flatpak Chrome screenshots inspected: **1440×900 desktop dark**, **390×844 mobile light**, and **390×844 mobile dark with the visible account-settings control and shortened search placeholder** (November 5, 2026). App HTML, CSS, JS modules and local icon returned HTTP 200. Responsive layout and basic empty states were visible; visual quality, high zoom and screen-reader acceptance are still incomplete.
- Message reader and mailbox requests now use abort controllers and state-generation checks, and the page-load UI is wired to the Gmail cursor. A simulated interaction test confirmed stale results do not repopulate the disconnected or switched mailbox. Provider-side cancellation and real-browser connected states remain unverified.
- The incremental authorization and mobile settings changes are on `main`; first connection is read-only, further scopes require explicit user actions, and a mismatched Google account is disconnected. The `gmail.modify` grant itself remains broad under Google's API.
- No live email sending, actual account access, complete browser acceptance, native runtime or production deployment claimed.

## Open high-priority work

1. Real browser/OAuth verification with a test Gmail account, explicit consent, and no production mailbox use.
2. Complete mobile/desktop interactive visual inspection, keyboard/AT audits, loading/error states and high-zoom behavior.
3. Verify incremental scopes, granular consent behavior and identity continuity against a real dedicated test Gmail account, including provider-level grant semantics.
4. Secure local drafts and storage before offline claims; latest source clears sensitive reader text and composer fields on disconnect.
5. Add robust MIME parsing, attachment handling, threading, deeper pagination recovery, and sender identities.
6. Build and verify desktop/mobile provider adapters with security and device test plans.
7. Follow full GC UI visual/accessibility acceptance and platform-specific Stable gates.
8. Reconcile public repository inventory and linked Drive project records in-place. The Drive connector requires an uploadable file reference for raw Markdown byte replacement, so root inventory was **not** changed; see [issue #5](https://github.com/GoreeCloud/mail/issues/5).

No project-system task or repository issue may be marked complete on unverified capability claims.
