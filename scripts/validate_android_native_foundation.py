#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "clients/android/app/src/main/AndroidManifest.xml"
BUILD = ROOT / "clients/android/app/build.gradle.kts"
CAPABILITIES = ROOT / "clients/android/app/src/main/java/com/goreecloud/mail/MailCapabilitySnapshot.kt"
GUIDANCE_STORE = ROOT / "clients/android/app/src/main/java/com/goreecloud/mail/MailGuidanceStore.kt"
GUIDANCE_POLICY = ROOT / "clients/android/app/src/main/java/com/goreecloud/mail/MailGuidancePolicy.kt"

manifest = MANIFEST.read_text(encoding="utf-8")
build = BUILD.read_text(encoding="utf-8")
capabilities = CAPABILITIES.read_text(encoding="utf-8")
guidance_store = GUIDANCE_STORE.read_text(encoding="utf-8")
guidance_policy = GUIDANCE_POLICY.read_text(encoding="utf-8")

required = {
    "manifest": [
        'android:allowBackup="false"',
        'android:usesCleartextTraffic="false"',
    ],
    "build": [
        'applicationId = "com.goreecloud.mail"',
        'applicationIdSuffix = ".dev"',
        'compileSdk = 36',
        'targetSdk = 36',
        'minSdk = 29',
        'versionName = "0.1.0-dev"',
    ],
    "capabilities": [
        'platformContractVersion = "0.4"',
        'glazeUiTargetVersion = "1.6.0"',
        'glazeUiAccepted = false',
        'productionAccepted = false',
        'runtimeConnected = false',
        'MailCapabilityState.NOT_IMPLEMENTED',
    ],
    "guidance_store": [
        'PREFERENCES_NAME = "goreecloud_mail_guidance"',
        'KEY_FIRST_USE_COMPLETE = "first_use_complete"',
        'KEY_CURRENT_STEP = "current_step"',
        'KEY_CONTEXTUAL_HINTS_ENABLED = "contextual_hints_enabled"',
    ],
    "guidance_policy": [
        "const val STEP_COUNT = 3",
        "fun nextStep(step: Int): Int?",
    ],
}
texts = {
    "manifest": manifest,
    "build": build,
    "capabilities": capabilities,
    "guidance_store": guidance_store,
    "guidance_policy": guidance_policy,
}
for label, needles in required.items():
    for needle in needles:
        if needle not in texts[label]:
            raise SystemExit(f"{label} missing required boundary: {needle}")

for forbidden in (
    "android.permission.INTERNET",
    "android.permission.READ_SMS",
    "android.permission.SEND_SMS",
    "android.permission.READ_CONTACTS",
    "android.permission.QUERY_ALL_PACKAGES",
):
    if forbidden in manifest:
        raise SystemExit(f"manifest contains unauthorized permission: {forbidden}")

print("Mail Android native foundation validated: disconnected Development sidecar; V1.6 migration-required.")
