# Android Session-Binding Readiness — Current-Main Recovery

## Status and source basis

This Development tranche recovers a pure Mail-side session-binding readiness model on top of the current disconnected Android and GLAZE UI V1.6 source-boundary stack.

The model references GoreeCloud Identity Draft PR #9 exact Development candidate `b010bcc3610c3898f108340b8c978bb783418980`, whose `goreecloud.identity.native-application-session/v1` source contract defines a non-secret consumer acceptance-proof shape.

That Identity candidate is contract-only, production acceptance is false, and its native-application registration registry remains empty. Mail therefore records the source relationship but does not treat the Identity contract or a Mail application registration as runtime accepted.

## Mail-side narrowing

Mail requires exact non-secret bindings for:

- Identity principal;
- expected Mail audience;
- Mail-owned account identity;
- client-instance identity;
- issue time; and
- exclusive expiry time.

Account and client-instance bindings narrow the operation. They do not expand Identity authority or transfer Mail authorization to Identity.

Strings must already be canonical for the consumer boundary. The Mail-side policy does not trim, case-fold, decode, or otherwise normalize identity values at acceptance time. Blank, trim-dependent, and control-bearing identifiers fail closed.

## Structural acceptance versus runtime readiness

A proof can be structurally consistent with Mail's local expectations while runtime readiness remains false.

The decision therefore exposes both `structuralAcceptance` and `runtimeReady`. A structurally valid proof still carries `IDENTITY_CONTRACT_NOT_RUNTIME_ACCEPTED` and `APPLICATION_REGISTRATION_NOT_ACCEPTED` blockers until GoreeCloud Identity itself provides accepted runtime authority and a concrete accepted Mail registration.

At this tranche, a valid proof therefore results in `structuralAcceptance=true` and `runtimeReady=false`.

## Time boundary

Issue time must be strictly earlier than expiry. Future-issued proofs fail closed. Expiry is exclusive, so a proof is expired when evaluation time equals or exceeds its expiry.

The local policy consumes caller-supplied time only. It does not establish a trusted-time source.

## Authority boundary

The model contains no bearer credential, refresh credential, password, browser cookie, client secret, provider token, mailbox credential, or transport implementation.

It does not authenticate a caller by itself, authorize mailbox data, create a provider session, grant Privacy Shield authorization, establish Wardveil acceptance, enable offline mutation, request network authority, or connect account transport.

The Android manifest continues to declare no INTERNET permission. The five runtime Mail capabilities remain unavailable.

## Follow-on work

A later governed tranche may consume an accepted Identity runtime proof only after a concrete Mail native application registration exists and is independently accepted. Mail must still map the validated principal/account binding into its own provider/account authorization and transport boundaries rather than treating Identity authentication as mailbox authorization.

Provider-account contracts, authenticated transport, protected credential storage, synchronization/offline behavior, notifications, attachments, applicable Integral Platform Systems, representative-device acceptance, recovery, signing/provenance, Release Candidate, Production Acceptance, and Stable qualification remain open.
