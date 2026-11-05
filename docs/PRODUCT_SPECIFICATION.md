# GoreeCloud Mail — Features, Functions, and Capabilities

**Document status:** Founder-defined product requirements / target capabilities, **not** an implementation-completeness claim.  
**Product name:** GoreeCloud Mail  
**Repository:** https://github.com/GoreeCloud/mail  
**Scope:** Email **client only**, no email server, hosting, SMTP relay, mailbox provisioning, or domain registration.  
**Targets:** Mobile (Android, iOS/iPadOS), desktop (Linux, Windows, macOS), web. Default-client intent **after verified Stable approval**.  
**Governance:** GoreeCloud instructions and the approved GoreeCloud UI design system.  
**Reference product patterns:** Gmail, Apple Mail, Proton Mail, Tuta Mail, Thunderbird, Mailspring, Superhuman. Original implementation and licensed dependencies only.

GoreeCloud Mail is a privacy-first, secure, intelligent, accessible and high-performance multi-account email client unifying communication, productivity, organization, workflow automation and personal information management. It connects to users' existing email accounts through supported protocols, official APIs and approved adapters. User ownership, data portability, privacy, encryption, interoperability, provider truthfulness, and maintainability are fundamental.

## 1. Universal email account management

- Multiple email accounts and sender identities; unified and per-account inboxes; personal, family, work and organization profiles; account colors, groups, icons, display names, signatures and default sender.
- Connect Gmail / Google Workspace, Outlook / Hotmail / Microsoft 365, iCloud Mail, Yahoo, Fastmail, Zoho, AOL, GMX, Mail.com, custom-domain, self-hosted and compatible enterprise accounts, subject to provider support.
- IMAP, SMTP, optional POP3, OAuth 2.0, Gmail API, Microsoft Graph, official Exchange integration, and approved provider-specific protocols.
- Per-account refresh and sync policies, selected-folder sync, push/poll where supported, reauthentication, diagnostics, health, notification preferences, multiple accounts from one provider, switching and safe removal.
- Encrypted-provider adapters must respect official boundaries: Proton Bridge where applicable; **never assume Tuta supports IMAP**. Explain exclusions rather than bypass security.

## 2. Unified inbox and email management

- Unified, individual, unread, priority, focused, split, VIP, important, starred, flagged, snoozed, scheduled, draft, sent, archive, spam/junk, trash, custom and smart inbox views.
- Conversation threading and message view, expansion/collapse, previews, sender/conversation/account grouping, time and custom sorts, counts and status/attachment markers.
- Read/unread, archive/unarchive, delete/restore, star, flag, pin, priority, move/copy, mute, snooze, sender block, spam/phishing report, unsubscribe, bulk triage, print, export, source/header viewing and separate windows.
- Cross-account transfer/migration, refresh, offline reading and history where the provider permits; all operations reflect provider synchronization semantics.

## 3. Advanced email composition

- Rich text, plain text, Markdown with preview, HTML-capable safe composition; typography, headings, lists, links, tables, emoji, inline images, attachments, clipboard, drag/drop and formatted quoted replies.
- CC/BCC, groups, recipient suggestions/autocomplete, sender identity selection, replies, reply-all, forwarding, forwarding as attachment, subject and attachment checks, external recipient warnings and duplicate detection.
- Multiple signatures, per-account or per-identity signatures, snippets, reusable templates, auto-saved drafts, offline drafts, draft version/recovery and multiwindow/fullscreen composer.
- Schedule sending only through provider-supported scheduling or a reliable disclosed online-client queue; configurable send-delay Undo; confirmations and transparent queued/accepted/submitted states.

## 4. Intelligent inbox organization

- Folders/nested folders, provider and local-only virtual labels, smart folders, saved views/filters, color categories, favorites, dynamic collections and split priority inboxes.
- Group by sender, recipient, domain, contact, account, time, attachment, read/flag status and custom criteria.
- Classify newsletters, promotions, social, updates, transactional, travel, receipts, invoices, security, personal and work communication.
- Importance preferences, prioritization rules, automatic archive/move/label, sender preferences, bulk cleanup and suggestions.
- Clearly distinguish provider-synchronized organization from client-local views.

## 5. Advanced search and discovery

- Global and scoped search across accounts, folders, conversations, sender, recipient, domain, contact, subject, body, attachments, filename, content and metadata.
- Filter dates/ranges, message size, attachments, labels, importance, flag/read status; exact phrases, Boolean operators and advanced expressions.
- Suggestions, highlighting, saved queries, search history controls, smart search folders, conversational/natural-language queries and semantic retrieval.
- Encrypted/local index when feasible, offline search, index retention/clearing and sensitive-account exclusions from AI indexing.

## 6. AI-powered email intelligence

- Optional AI summaries for messages/threads, smart replies, editable drafts, spelling, grammar, translation, professional/friendly/formal tone changes, length/clarity and subject generation.
- Classify and prioritize messages; suggest labels, folders, follow-ups, deadlines, appointments, action items, tasks, calendar events, receipt/travel labels, cleanup and duplicate conversations.
- Semantic/natural-language email search, conversation Q&A, comparisons and user-defined AI workflows.
- User approval, visible action histories, editable output, user-selected model/provider, local model compatibility, per-account opt-in and safe remote AI boundaries. Never silently send/delete/share or transmit email to outside AI.

## 7. Privacy and security

- OAuth where supported, MFA/passkeys/security keys, OS credential store, secure token and session management, app lock/biometrics, least privilege and account isolation.
- TLS and strict certificate validation, secure encrypted local cache/messages/attachments/index, key management, privacy-preserving notification/clipboard/settings and secure account removal.
- Safe HTML rendering with no scripts, remote content blocking, tracking pixel defense, link safety, spoofing/phishing warnings, dangerous attachment handling, SPF/DKIM/DMARC status inspection when exposed.
- Optional OpenPGP encryption/signatures, keys/import/export/verification, secure attachments, explicit encryption status and optional S/MIME/hardware-backed key integration where supported.
- No advertising based on private messages; opt-in diagnostics; controlled retention. End-to-end encrypted status must never be falsely implied for ordinary transport-encrypted email.

## 8. Productivity and workflow optimization

- Keyboard-first navigation, remappable shortcuts, command palette, quick search/reply/forward/archive/delete/snooze/compose, account switch and batch triage.
- Inbox Zero, follow-up reminders, send-later, Undo Send, send/archive, send/snooze, templates, snippets and contact suggestions.
- Focus/distraction-free modes, newsletter triage, quiet hours, notification batching and processing/response metrics.
- Always provide accessible pointer/touch equivalents.

## 9. Email automation and rules

- Sender, recipient, domain, subject, keyword, attachment, date, priority, folder and label triggers with AND/OR/nesting, order, priority, enable/disable and previews.
- Auto archive/move/copy/label/star/read, notifications, forwarding when authorized, task/reminder creation and categorization.
- Natural-language rule authoring, explicit approvals, simulations, dry runs, log/error inspection, loop and duplicate prevention, rate limits, rollback when feasible, rule import/export.
- Local automations run only when the client is active; provider-side rules are delegated through supported APIs, not provided by a new GoreeCloud server.

## 10. Scheduling and follow-up management

- Scheduled messages, timezone-aware times, suggested sending windows, scheduled queue editing/cancellation, online status disclosure.
- Reply deadline tracking, unanswered-message detection, recurring reminders, snooze presets/custom dates, meeting/calendar follow-ups and notification controls.

## 11. Contacts and address book

- Unified and per-account contacts, Google/iCloud/Microsoft contacts and CardDAV, local address books, create/edit/delete/search, avatars and organization details.
- Multiple addresses, names/aliases, groups/VIPs, notes, favorites, per-contact rules, history, deduplication/merging, vCard import/export and opt-in contact enrichment.

## 12. Calendar and scheduling integration

- Parse invitations and ICS, detect meetings, show event summaries, RSVP, create/update external calendar events and add time-zone-aware reminders.
- Google/Microsoft/Apple/CalDAV integrations where available, availability and conferencing links, meeting preparation and follow-up summaries, task-calendar linking.
- No proprietary GoreeCloud calendar server required.

## 13. Tasks, notes and personal information management

- Convert messages to tasks, notes, events, reminders and action items; link source messages and mark follow-up completion.
- Attach selected email content to approved task/note/project managers, GoreeCloud Tasks, GoreeCloud Notepad and external automation systems.
- Integrate approved storage services without copying private mail without permission.

## 14. Attachments and file management

- Attachment add/remove, inline and file previews (images/PDF/doc/audio/video/archive where safe), download, bulk save, filename/type/content search and filters.
- File size/type checks, dangerous file warnings, encrypted caches, storage reports, cleanup/deduplication, optional compression, safe file-link sharing.
- Native Linux/Android/desktop file pickers, Google Drive, Dropbox and other authorized storage services; offline availability if explicitly cached.

## 15. Identities, aliases and signatures

- Multiple From identities, verified Reply-To, provider-managed aliases, plus addressing, disposable/Hide-my-email compatibility and custom domain sender identities.
- Per-identity signature formats and templates, display names, default identity, auto-match for reply, recipient-specific preferences and alias provider APIs.
- Client **does not** provision domains or mailboxes, operate aliases as an external forwarding service, or register DNS records.

## 16. Team and professional email workflows

- Existing-provider shared mailbox/delegation, shared folders/labels/templates/snippets, team assignments, notes, comments, workflow definitions and task linking.
- Where supported, role-aware access, collision warnings, ownership, shared status, workload insights, auditing and collaboration connectors.
- Never impersonate colleagues or share login credentials.

## 17. Analytics and productivity insights

- Optional local-only or explicitly configured analytics: sent/received/unread volumes, trends, time-to-reply, follow-up completion, contacts, organization and storage metrics.
- Optional lawful provider-supported receipts/tracking with opt-in, explanations and uncertainty disclosure. Respect recipient privacy and block covert tracking by default.
- Configurable analytics retention/export/disable.

## 18. Cross-platform applications

- Target Linux, Android, Windows, macOS, iOS/iPadOS and secure browser environments.
- Native notifications, background constraints, secure OS credential storage, biometric unlock, mailto/default-mail handling, share menus, file pickers, clipboard, contacts/calendar, tray/widgets, high-DPI, multiwindow, keyboard/pointer/touch.
- **Default-client registration only after Stable**: Android intent handlers and user choice; iOS supported default-email app registration and user choice; Linux XDG/mailto; Windows default apps/protocol association; macOS default mail reader; browser protocol handlers with user permission. Never forcibly replace defaults.

## 19. Offline email and synchronization

- Offline message browsing/search/drafts/reply/attachments for locally cached content; configurable per-account selective/full sync, local encrypted retention, bandwidth/battery/metered policies.
- Push/poll where supported, visible sync state, queue/retry/backoff, duplicate prevention, conflicts, crashes and interrupted network recovery.
- Multi-device mail synchronization remains provider-mediated; GoreeCloud Sync can handle approved client-local settings/metadata separately.

## 20. Import, export, backup and portability

- EML and MBOX import/export, vCard contacts, templates/snippets/settings/rules/analytics transfer, migrations, deduplication, progress and verification.
- Encrypted local backups, optional approved destinations, restore and testing; distinguish local app state from provider-hosted data.
- Secure local data removal without erasing remote mail unless user explicitly authorizes provider deletion.

## 21. Customization and GoreeCloud UI

- Authoritative GC UI tokens, semantic roles, typography/spacing/radius, polished responsive composition and premium visual acceptance.
- Light/dark/system modes, density, sidebar, toolbar, 2/3 panes, mobile nav, reader orientation, colors, avatars, fonts, gestures, shortcuts, reduced motion/transparency/high contrast.
- One GoreeCloud design system, not a proprietary rival; exact UI acceptance and screenshot verification required.

## 22. Accessibility and internationalization

- Keyboard-only and screen-reader operation, meaningful labels/roles, logical focus, visible focus, spoken status/errors, accessible dialogs and attachments.
- Assistive technology targets: VoiceOver, TalkBack, NVDA and Orca; zoom/scaling, touch targets, high contrast and reduced motion.
- Unicode, RTL and mixed-script handling, translations, local dates/timezones, multilingual composition, search and spelling.

## 23. Notifications and communication awareness

- Per-account, VIP, priority, sender, new message, sync, auth, security, attachment, reminder, snooze and scheduled delivery notifications.
- Desktop/mobile native delivery where supported; quiet hours, do-not-disturb, batching, sounds, badges, grouping, privacy previews and retention controls.

## 24. Developer tools, APIs and extensions

- Modular provider adapters, protocol abstraction, scoped APIs, extension/plugin framework and approved automation integrations.
- Permission-controlled plugins, sandboxing, enable/disable, diagnostics/logging, connection tests, config exports, security reviews.
- Automated unit/integration/accessibility/security/performance tests, vulnerability scanning and release validation.

## 25. GoreeCloud ecosystem integration

- **GoreeCloud UI:** shared tokens/components/accessibility, authoritative design.
- **GoreeCloud AI:** opt-in, permissioned drafting, summarization and search.
- **GoreeCloud Search:** mail indexes only after stable and authorized.
- **Tasks / Calendar / Notepad:** user-selected conversions, invitations and notes.
- **Sync / Backup / Notify:** approved client metadata sync, local backup and messaging alerts.
- **VPN / GoreeShield / Dashboard:** optional secure network access, threat indications and status reporting.
- Integrations remain modular and must not claim capabilities unavailable in the corresponding service.

## 26. Performance, reliability and resource efficiency

- Fast startup, virtualized lists, lazy previews, efficient local indexing, incremental sync, bounded concurrency and cache limits.
- Robust retry, timeouts, backoff, quotas, crash and draft recovery, durable queues, safe retries, data integrity, diagnostics, performance/energy/bandwidth controls.
- Structured privacy-minimized logs, tests, secure updates and rollback.

## 27. Application settings and administration

- Configurable accounts, identities, OAuth, sync, security, encryption, AI, search, notifications, language, accessibility, appearance, signatures, templates, rules, contacts/calendar, files, storage, cache, backup and plugins.
- Diagnostics, provider compatibility, status, version/update information, reset, disconnection and secure local-data erasure.

## 28. Client architecture and exclusions

- Existing provider owns mailboxes, sending, incoming delivery, aliases and hosting; client handles approved account access, local presentation, composition, search, encryption, caching and synchronization.
- **Excluded:** hosting mailboxes, operating inbound/outbound public mail servers, MTA/SMTP relay/IMAP/POP servers, public email gateways, hosting subscriptions, MX management, domain registration, mailbox provisioning, universal provider bypasses, guaranteed recall or guaranteed read receipts.
- No built-in credential collection, unauthorized interception, insecure TLS downgrades or automatic provider restrictions bypass.

## 29. Primary product objectives

1. Unified access to multiple existing providers.
2. Powerful organized messaging, safe composition and search.
3. Security and local encrypted data ownership.
4. Productive shortcuts, scheduling and follow-ups.
5. Optional controlled intelligence.
6. Reliable offline workflow and synchronization.
7. Responsive cross-platform applications.
8. Standards, portability and interoperability.
9. Optional verified ecosystem integrations.
10. Premium accessible GC UI.
11. Testable, modular, maintainable and performant engineering.
12. User independence from a single email vendor.

## 30. Product vision and release intent

GoreeCloud Mail will unify the search/organization of Gmail, refined interaction of Apple Mail, encrypted-provider lessons from Proton/Tuta, extensibility of Thunderbird, multi-account productivity of Mailspring and keyboard/AI efficiency of Superhuman into an original client.

**The target is not yet the implementation.** Build iteratively, validate each provider and platform, and promote the client as the **default Mail app on supported mobile/desktop/browser platforms only when Stable is independently demonstrated and the user selects it.**

This specification is the founder-directed requirements baseline. Actual feature availability is recorded separately in [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).
