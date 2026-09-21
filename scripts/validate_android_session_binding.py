#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "clients/android/app/src/main/java/com/goreecloud/mail/MailSessionBindingReadiness.kt"
CAPABILITIES = ROOT / "clients/android/app/src/main/java/com/goreecloud/mail/MailCapabilitySnapshot.kt"
MANIFEST = ROOT / "clients/android/app/src/main/AndroidManifest.xml"
DOC = ROOT / "docs/android-session-binding-readiness.md"

def require(text: str, fragment: str, label: str) -> None:
    if fragment not in text:
        raise SystemExit(f"{label}: required fragment missing: {fragment!r}")

def forbid(text: str, fragment: str, label: str) -> None:
    if fragment in text:
        raise SystemExit(f"{label}: forbidden fragment present: {fragment!r}")

def main() -> None:
    source = SOURCE.read_text(encoding="utf-8")
    capabilities = CAPABILITIES.read_text(encoding="utf-8")
    manifest = MANIFEST.read_text(encoding="utf-8")
    doc = DOC.read_text(encoding="utf-8")

    for fragment in (
        'goreecloud.identity.native-application-session/v1',
        'd6f0f47aa98a9f1bce5b27df5bbf52da71950c30',
        'CONTRACT_RUNTIME_ACCEPTED = false',
        'APPLICATION_REGISTRATION_ACCEPTED = false',
        'clientInstanceId',
        'structuralAcceptance',
        'runtimeReady = blockers.isEmpty()',
        'IDENTITY_CONTRACT_NOT_RUNTIME_ACCEPTED',
        'APPLICATION_REGISTRATION_NOT_ACCEPTED',
    ):
        require(source, fragment, "session binding")

    for fragment in ("accessToken", "refreshToken", "password", "clientSecret", "browserCookie"):
        forbid(source, fragment, "session binding")

    require(capabilities, "sessionBindingContract", "capability snapshot")
    require(capabilities, "SOURCE_READY", "capability snapshot")
    require(manifest, "<application", "manifest")
    forbid(manifest, "android.permission.INTERNET", "manifest")
    require(doc, "Identity Draft PR #9", "documentation")
    require(doc, "registration registry remains empty", "documentation")
    require(doc, "runtimeReady=false", "documentation")

    print("Mail Android session-binding boundary validated: metadata-only=true runtime-authority=false network=false")

if __name__ == "__main__":
    main()
