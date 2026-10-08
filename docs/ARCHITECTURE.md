# Architecture

The current migration foundation inherits Mailspring's Electron/React client and local mail synchronization engine. This is not the target architecture.

The GoreeCloud target separates provider adapters, mail domain logic, local subordinate cache/index state, security-sensitive parsing and attachment boundaries, presentation, native platform adapters, and explicitly approved GoreeCloud integrations.

External mail providers remain authoritative for hosted mailbox state and Internet mail transport. GoreeCloud Mail is a client, not an SMTP hosting provider or MX service. GoreeCloud Identity must remain distinct from external provider OAuth identity.

The renderer privilege migration is ordered: inventory Node/Electron use, define a minimal typed preload/IPC capability surface, move secret/filesystem/network/OS-sensitive work to trusted processes, enable context isolation and remove renderer Node integration, then evaluate hardened Electron against Tauri/Rust/native desktop boundaries. Technology choice is subordinate to security, accessibility, performance, integration quality, maintainability, and feature preservation.

Courier is a capability identity inside GoreeCloud Mail, not a separate application or repository.
