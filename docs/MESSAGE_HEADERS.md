# GoreeCloud Mail — Read-only Message Headers (Alpha)

**Status:** Implemented for the existing Gmail-only web alpha. A collapsed **Inspect message headers** section appears on a loaded message when Gmail supplies headers. This is **provider-reported metadata**, not the message's original raw source and not cryptographic verification of sender identity.

## How it works

- The already-authorized Gmail API `format=full` response includes message header names and values. No additional Gmail API permission, external script, image, link request, or raw message fetch is made.
- Users explicitly expand the header inspector to view the sanitized metadata. The panel is collapsed whenever a new message is opened.
- Header names and values are added with DOM `textContent` using `dt`/`dd` pairs, never parsed as HTML or rendered as clickable links.
- Message-header content is cleared when switching messages, changing mailbox, or disconnecting. Gmail tokens and received messages remain in memory only.
- Repeated headers (such as `Received`) remain distinct, and folded continuation lines are rendered on a single line.

## Safe display limits

- First **48 provider header entries** at most, preserving their original order. Additional entries are omitted with a visible truncation notice.
- Names must match a bounded ASCII letters/digits/hyphens format; malformed names are omitted.
- Values are inspected only up to **8192 UTF-16 code units** and displayed up to **1024 Unicode code points**.
- Untrusted line breaks, control characters, and bidirectional formatting controls are normalized or neutralized for safe plain-text display.
- Provider values are never converted into executable markup, URL actions, or commands.

## Security notes and non-goals

Email header fields—including `From`, `Reply-To`, `Authentication-Results`, `Received`, and `Message-ID`—are not universally trustworthy. They can be malformed, misleading, or forged. This view is for manual investigation, not an SPF/DKIM/DMARC verifier, a phishing score, or a guarantee of authenticity.

Some headers can contain personally identifying routing details. They remain hidden until the user opens the collapsed section, but are still present in the local browser's memory and page model. This feature does not export or sync those values.

**Not implemented:** complete RFC 5322 raw-source download, canonical MIME serialization, full parser validation, independent authentication-result verification, or provider-independent header retrieval.

## Verification and release gates

Automated tests cover line unfolding, Unicode control normalization, repeated headers, malformed entries, non-string values, oversized input, deterministic truncation, normalized Gmail responses, collapsed inspection and clearing the DOM on disconnect. These are synthetic/mocked cases, not a live-account security audit.

Before Stable: test real Gmail header variants and mixed encodings, screen readers and keyboard disclosure behavior, zoom/RTL layout, high-header-count performance, private-data retention, and independent review.

See [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY.md](SECURITY.md), and [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).
