# GoreeCloud Mail

**Active Development — Fork-to-Native foundation.** This is an independent GoreeCloud email client in development, derived from Mailspring. It is not yet stable, fully native, or production ready.

## Source and license
Upstream: [Foundry376/Mailspring](https://github.com/Foundry376/Mailspring).
Inherited source, assets, and code history retain their upstream licenses and copyright notices. The foundation is pinned to Mailspring revision `6054ff7a2e43b9d8e5ad7931370316e5b35d9a25`. See [LICENSE.md](LICENSE.md), [UPSTREAM.md](UPSTREAM.md), and [NOTICE.md](NOTICE.md).
The import commit preserves upstream Git ancestry.

## Direction
- Independent GoreeCloud Mail identity and onboarding.
- Glaze 1.7.0 adoption and independent consumer acceptance.
- Offline-first multi-account email using standards-based interoperability.
- Evaluate all nine GoreeCloud Integral Platform Systems, including Policy and Observability, with evidence of real integration; naming alone does not constitute acceptance.
- Secure mail rendering, attachment handling, credential isolation, provider OAuth, keyboard accessibility, and reduced privilege boundaries.
- Progressive replacement of upstream proprietary services and product-defining architecture.

## Initial safeguards
Automatic remote images are disabled by default. Inherited crash reporting and Sentry are disabled; external legacy identity-required packages are not activated. These are only the foundation controls, not full security acceptance.

## Known blocker
The inherited Electron app renderer currently has privileged Node integration and needs a reviewed preload/IPC security migration before any production readiness claim.

## Work tracking
See [docs/GOREECLOUD-MAIL-ROADMAP.md](docs/GOREECLOUD-MAIL-ROADMAP.md).

## Architecture and acceptance records

- [Architecture](docs/ARCHITECTURE.md)
- [Fork-to-Native plan](docs/FORK-TO-NATIVE.md)
- [Feature preservation](docs/FEATURE-PARITY.md)
- [Privacy baseline](docs/PRIVACY.md)
- [Glaze adoption](docs/GLAZE.md)
- [Integral Platform Systems](docs/INTEGRAL-PLATFORM-SYSTEMS.md)
- [Courier identity](docs/courier.md)
- [Security](SECURITY.md)

## Development validation

Run `npm ci`, `npm run policy:check`, `npm run lint:check`, `npm run typecheck`, and `npm test` before promotion. The current Glaze acceptance record remains fail-closed until Mail-specific evidence exists.
