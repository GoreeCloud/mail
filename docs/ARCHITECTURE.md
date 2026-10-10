# Architecture

The current migration foundation inherits Mailspring's Electron/React client and local mail synchronization engine. This is not the target architecture.

The GoreeCloud target separates provider adapters, mail domain logic, local subordinate cache/index state, security-sensitive parsing and attachment boundaries, presentation, native platform adapters, and explicitly approved GoreeCloud integrations.

External mail providers remain authoritative for hosted mailbox state and Internet mail transport. GoreeCloud Mail is a client, not an SMTP hosting provider or MX service. GoreeCloud Identity must remain distinct from external provider OAuth identity.

The renderer privilege migration is ordered: inventory Node/Electron use, define a minimal typed preload/IPC capability surface, move secret/filesystem/network/OS-sensitive work to trusted processes, enable context isolation and remove renderer Node integration, then evaluate hardened Electron against Tauri/Rust/native desktop boundaries. Technology choice is subordinate to security, accessibility, performance, integration quality, maintainability, and feature preservation.

As a limited incremental change, General and Appearance preference relaunch actions now send an application command to the trusted Electron main process, rather than importing `@electron/remote` app controls in those UI surfaces. The main command bridge already checks that the sender is a recognized GoreeCloud Mail window. Other renderer privilege surfaces remain and the P0 context-isolation migration is incomplete. This source change requires exact-head CI and representative preference/relaunch testing before integration.

Courier is a capability identity inside GoreeCloud Mail, not a separate application or repository.
