# GoreeCloud Mail — Encrypted Local Draft (Alpha)

**Status:** Implemented for explicit user-triggered save/restore of **one** client-local draft; automated crypto and simulated UI tests passed. **Not** provider Gmail drafts, automatic autosave, full offline mail, backup, or a Stable security guarantee.

## What exists

1. Connect an existing Gmail account, open **Compose**, and enter recipient, subject and/or message.
2. Choose **Save encrypted draft** and provide a unique passphrase of at least 12 characters. The passphrase is not saved.
3. On a later visit to the *same browser origin*, reconnect the matching email account, open Compose, select **Restore local draft**, and supply the passphrase.
4. To remove the snapshot, choose **Delete saved draft** in the encrypted-draft dialog and confirm. This operation needs no passphrase; it is an explicit local deletion.

Only **one** draft snapshot is kept per browser origin. Saving another requires confirmation and replaces the previous ciphertext. The snapshot is not synchronized to Gmail or other devices. Local **Disconnect** clears tokens and active message/composer state but **does not delete** encrypted draft data. Browser clear-site-data may destroy it irreversibly.

## Cryptographic construction

- Browser-native Web Crypto API only; requires a secure context.
- Passphrase converted to key with **PBKDF2-HMAC-SHA-256, 310,000 iterations**, and 16 bytes of fresh cryptographic salt per save.
- **AES-256-GCM** with a fresh 12-byte IV on each encryption; authenticated associated data identifies format v1.
- The authenticated envelope stores version, KDF/cipher identifiers, iteration count, salt, IV, and ciphertext only. The account address, recipient, subject and body are *inside* the encrypted content.
- Maximum serialized plaintext: **1 MiB**; maximum encrypted-envelope size: **2 MiB**.
- Decryption checks authenticated data before presenting the content. Correct passphrase + mismatched email account is refused.
- Cancelled save/decrypt operations cannot persist or restore their late results. UI handlers also verify connected account and session generation.
- No third-party cryptographic package, backend processing, mail relay or hosted data service.

## Threat model and limitations

Encryption protects a stored draft snapshot against casual inspection of browser storage without the passphrase. It **does not** protect against compromised browser extensions, malicious same-origin JavaScript, a compromised device, password interception while typing, or loss of browser storage.

The passphrase is held in the form only while used and the field is cleared afterward; JavaScript runtime memory wiping cannot be guaranteed. Use a long, unique passphrase. A forgotten passphrase cannot be recovered. Browser storage quotas and private-browsing policies may prevent persistence.

Web Crypto plus PBKDF2 is an alpha compatibility approach; before Stable, evaluate stronger password-hardening KDFs, native device-backed key storage, recovery policy, migration, crash consistency, vault isolation, accessibility, browser state retention, and independent security review.

**Important:** This is **manual encrypted local snapshot storage**, not automatic drafts; do not rely on it as the only copy of important unsent correspondence.

## Verified tests

- AES-GCM/PBKDF2 round-trip with Unicode.
- No readable recipient/subject/body/account in local storage.
- Incorrect password, ciphertext tampering and invalid format rejection.
- Account mismatch refusal.
- Replacement, deletion, missing data and size/entropy preconditions.
- Cancellation during encryption and decryption.
- Simulated composer save / restore / failed unlock / cross-account flow.
- Existing message, OAuth, MIME and UI tests continue to pass.

Open browser/device acceptance criteria: actual Chrome/Firefox/Safari Web Crypto and localStorage behavior, keyboard/focus and dialog nesting, mobile and high-zoom layout, tab restore, quota-exceeded behavior, browser-private-mode behavior, and data lifecycle audits.

See [SECURITY.md](SECURITY.md), [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md), and the [product specification](PRODUCT_SPECIFICATION.md).
