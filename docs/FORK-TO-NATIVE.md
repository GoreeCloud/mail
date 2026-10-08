# Fork-to-Native Transition

## Phase 0 — provenance and baseline
Status: in progress.

Preserve upstream ancestry and GPLv3 provenance, establish the exact imported revision, inventory inherited capabilities, establish CI, and establish fail-closed privacy/security defaults.

## Phase 1 — distinct GoreeCloud product
Status: in progress.

Replace user-facing Mailspring identity and cloud/subscription assumptions, adopt Glaze 1.7.0 through a Mail-specific layer, route onboarding directly to provider account setup, and replace inherited product metadata and supported surfaces.

## Phase 2 — trust-boundary ownership
Status: pending.

Remove privileged renderer Node access, introduce typed preload/IPC capabilities and context isolation, harden external navigation, message rendering, attachments, paths, plugins, updater behavior, and provider authorization, and eliminate unsupported Mailspring cloud-service dependencies.

## Phase 3 — domain and provider ownership
Status: pending.

Formalize provider adapters and own message, conversation, search, compose, rule, scheduling, cache, and offline contracts while preserving feature parity.

## Phase 4 — native endpoint
Status: pending.

Evaluate hardened Electron versus Tauri/Rust/native desktop alternatives after trust and domain boundaries are explicit. Native completion requires owned product-defining architecture and supported-platform evidence.

No phase transition automatically establishes Stable, native, Glaze-conformant, secure, private, accessible, or production-ready status.
