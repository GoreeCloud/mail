# GoreeCloud Mail — Floating Mobile Dock Validation

**Checkpoint:** November 8, 2026  
**State:** Implemented and locally tested in the experimental web-client branch; this is not a native Android/iOS build or universal accessibility certification.

## Purpose and scope

GoreeCloud Mail's four mailbox destinations—**Inbox**, **Starred**, **Sent**, and **All mail**—now appear on narrow web viewports as a detached floating bottom navigation dock, consistent with GoreeCloud's mobile-navigation direction and the verified GoreeCloud UI Cloud Lens principles.

The original desktop sidebar remains available on desktop and tablet layouts. Primary mobile navigation is **not** duplicated in the upper toolbar; that area retains the title, search, refresh, connection and settings actions.

## Implemented behavior

- The mobile dock floats **12 CSS px** away from the bottom and side edges, plus applicable operating-system safe-area insets. It uses existing GC UI semantic surfaces, borders, radius, text colors and the established Cloud Lens translucent background.
- All four mailbox destinations have **visible short text labels** alongside their icons. The current destination retains a shape/background indicator, a semantic `aria-current="page"` state, and a high-contrast outline in forced-colors mode.
- Dock items provide at least **62 CSS px** of vertical target height. Narrow CSS viewports at or below 300px can scroll the dock horizontally instead of clipping controls.
- The mailbox workspace reserves **108 CSS px plus the bottom safe area** for the floating dock and its clearance, rather than letting message content extend underneath it.
- The floating Compose action is offset above the dock, retains a programmatic accessible name, and does not change sending permission behavior.
- A light/dark appearance switch is now accessible from the account-settings dialog on mobile, even when the desktop-only sidebar controls are hidden. Changing the appearance does not require connecting to a mailbox.
- At narrower widths, the toolbar uses the shorter `Search` placeholder while retaining its fuller accessible search label.

## Observed verification

- The static web client was inspected in headless Chrome at **390×844 dark**, **320×720 dark**, and **390×844 light**. On those disconnected-state screenshots, the navigation was detached from the screen edges, all four labels appeared, and the inbox view cleared the dock.
- Source checks cover bottom/side safe-area expressions, the reserved workspace height, labels, active-state styling, forced colors and narrow-zoom fallback.
- Simulated UI flow tests confirm a user can switch appearance without an email account. They do not substitute for physical touch testing.
- No real Gmail credentials, email messages, OS integration or deployment were involved in these visual checks.

## Outstanding release acceptance

- Test mobile on actual Android/iOS devices, including gestures, system navigation insets, screen rotation and on-screen keyboards.
- Test voice and screen-reader use (TalkBack, VoiceOver), tab/focus order, higher zoom levels, reduced transparency and forced colors in representative environments.
- Verify connected-mail workflows and long inboxes do not lose scroll position or become obscured by keyboard and dock transitions.
- Evaluate dark/light contrast and overlay behavior across browsers. Screenshots of the disconnected shell do **not** establish connected-account or accessibility acceptance.

Related sources: [GoreeCloud UI design language](https://drive.google.com/file/d/1JQiGg1ZC7Xgg2VH8ctN2qaPdIBVkrCp5/view), [implementation status](IMPLEMENTATION_STATUS.md), [architecture](ARCHITECTURE.md), [security](SECURITY.md).
