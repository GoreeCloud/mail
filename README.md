# GoreeCloud Mail

**Active Development — Fork-to-Native foundation.** This is an independent GoreeCloud email client in development, derived from Mailspring. It is not yet stable, fully native, or production ready.

## Source and license
Upstream: [Foundry376/Mailspring](https://github.com/Foundry376/Mailspring).
Inherited source, assets, and code history retain their upstream licenses and copyright notices. See [LICENSE.md](LICENSE.md).
The import commit preserves upstream Git ancestry.

## Direction
- Independent GoreeCloud Mail identity and onboarding.
- Glaze 1.7.0 adoption and independent consumer acceptance.
- Offline-first multi-account email using standards-based interoperability.
- Privacy Shield, Wardveil Security, Everkeep, GoreeCloud Manager, Mesh, and Identity applicability evaluated with evidence.
- Secure mail rendering, attachment handling, credential isolation, provider OAuth, keyboard accessibility, and reduced privilege boundaries.
- Progressive replacement of upstream proprietary services and product-defining architecture.

## Initial safeguards
Automatic remote images are disabled by default. Inherited crash reporting and Sentry are disabled; external legacy identity-required packages are not activated. These are only the foundation controls, not full security acceptance.

## Known blocker
The inherited Electron app renderer currently has privileged Node integration and needs a reviewed preload/IPC security migration before any production readiness claim.

## Work tracking
See [docs/GOREECLOUD-MAIL-ROADMAP.md](docs/GOREECLOUD-MAIL-ROADMAP.md).
