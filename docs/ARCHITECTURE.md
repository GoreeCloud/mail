# Architecture

The current migration foundation inherits Mailspring's Electron/React client and local mail synchronization engine. This is not the target architecture.

The GoreeCloud target separates provider adapters, mail domain logic, local subordinate cache/index state, security-sensitive parsing and attachment boundaries, presentation, native platform adapters, and explicitly approved GoreeCloud integrations.

External mail providers remain authoritative for hosted mailbox state and Internet mail transport. GoreeCloud Mail is a client, not an SMTP hosting provider or MX service. GoreeCloud Identity must remain distinct from external provider OAuth identity.

The renderer privilege migration is ordered: inventory Node/Electron use, define a minimal typed preload/IPC capability surface, move secret/filesystem/network/OS-sensitive work to trusted processes, enable context isolation and remove renderer Node integration, then evaluate hardened Electron against Tauri/Rust/native desktop boundaries. Technology choice is subordinate to security, accessibility, performance, integration quality, maintainability, and feature preservation.

Privileged host UI operations, cross-window messages, clipboard writes, and remote window routing now require a renderer registered as a GoreeCloud Mail application window. This prevents separate untrusted preview and guest content from issuing those IPC operations, but does not yet isolate the privileged first-party renderer, validate all IPC payloads, or prove installed-desktop behavior. Main-renderer context isolation and controlled preload migration remain P0 release blockers.

Courier is a capability identity inside GoreeCloud Mail, not a separate application or repository.
