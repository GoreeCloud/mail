#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
CLIENT = ROOT / "clients/android/app/src/main/java/com/goreecloud/mail"
TOKENS = CLIENT / "MailGlazeTokens.kt"
POLICY = CLIENT / "MailGlazePresentationPolicy.kt"
OPTICS = CLIENT / "MailGlazeOptics.kt"
ANDROID_CONTEXT = CLIENT / "MailAndroidGlazeContext.kt"
ACTIVITY = CLIENT / "MainActivity.kt"

errors: list[str] = []

def require(text: str, fragment: str, label: str) -> None:
    if fragment not in text:
        errors.append(f"{label}: required fragment missing: {fragment!r}")

def forbid(text: str, fragment: str, label: str) -> None:
    if fragment in text:
        errors.append(f"{label}: forbidden fragment present: {fragment!r}")

for path in (TOKENS, POLICY, OPTICS, ANDROID_CONTEXT, ACTIVITY):
    if not path.is_file():
        errors.append(f"missing Mail V1.6 source file: {path.relative_to(ROOT)}")

if not errors:
    tokens = TOKENS.read_text(encoding="utf-8")
    policy = POLICY.read_text(encoding="utf-8")
    optics = OPTICS.read_text(encoding="utf-8")
    android_context = ANDROID_CONTEXT.read_text(encoding="utf-8")
    activity = ACTIVITY.read_text(encoding="utf-8")

    for marker in (
        'const val Version = "1.6.0"',
        'const val StableReleaseRevision = "a7180679ea851389e0f3004515f9a25f420e716d"',
        'const val StableReleaseTag = "v1.6.0"',
        'const val RollbackBaselineVersion = "1.5.1"',
        "const val SharedStableConsumerEligible = true",
        "const val ApplicationAcceptanceAutomatic = false",
        "const val InteractionFloorDp = 48",
        "const val TouchAssistanceFloorDp = 56",
        "const val LargeTextScreenGutterDp = 16",
    ):
        require(tokens, marker, "MailGlazeTokens")

    for marker in (
        'const val StableVersion = "1.6.0"',
        'const val StableSourceRevision = "a7180679ea851389e0f3004515f9a25f420e716d"',
        "MailGlazeMaterialRole.FUNCTIONAL_GLASS",
        "MailGlazeMaterialRole.CLEAR_GLASS",
        "MailGlazeMaterialRole.SOLID",
        "MailGlazePerformanceLevel.ESSENTIAL",
        "MailGlazePerformanceLevel.EFFICIENT",
        "MailGlazeMotionMode.MINIMAL",
        "context.reducedTransparency",
        "context.reducedMotion",
        "context.largeText || context.extraLargeText",
        "context.touchAssistance",
    ):
        require(policy, marker, "MailGlazePresentationPolicy")

    for marker in (
        'const val Version = "1.6.0"',
        'const val StableRevision = "a7180679ea851389e0f3004515f9a25f420e716d"',
        "const val OpticalEngineIsLocalAndDeterministic = true",
        "const val TelemetryRequired = false",
        "const val RemoteContextRequired = false",
        "const val EnvironmentalColorMemoryInfluence = 0.0f",
        "const val MailboxContentSamplingAllowed = false",
        "const val MessageBodySamplingAllowed = false",
        "const val RecipientSamplingAllowed = false",
        "const val ProviderAccountSamplingAllowed = false",
        "const val IdentitySessionSamplingAllowed = false",
        "const val AttachmentContentSamplingAllowed = false",
        "const val SecurityPrivacyStateSamplingAllowed = false",
        "const val OpticalContextMayCarrySemanticAuthority = false",
        "const val ContextCapabilityPresentationMayGrantAuthority = false",
        "const val ProviderConflictFailsClosed = true",
        "const val AutomaticConsequentialActionAllowed = false",
        "const val OpticalEngineAdapterAccepted = false",
        "const val PhysicalDeviceAcceptanceEstablished = false",
        "const val ManualAssistiveTechnologyAcceptanceEstablished = false",
        "const val HumanVisualExcellenceAcceptanceEstablished = false",
        "const val RepresentativeRealDevicePerformanceAccepted = false",
    ):
        require(optics, marker, "MailGlazeOptics")

    for marker in (
        "object MailAndroidGlazeContext",
        "fun fromSignals(",
        "reducedMotion = !animatorsEnabled",
        "largeText = normalized > DefaultFontScale",
        "extraLargeText = normalized >= ExtraLargeTextScale",
        "touchAssistance = touchExplorationEnabled",
        "screenReaderOptimized = touchExplorationEnabled",
    ):
        require(android_context, marker, "MailAndroidGlazeContext")

    # Keep the Android context mapper dependency-free: the only inputs are the explicit
    # primitive presentation signals in fromSignals(). Documentation prose may name forbidden
    # mail-domain concepts while explaining that they are excluded, so enforce code structure
    # rather than substring-banning those words.
    for forbidden in (
        "import ",
        "java.net",
        "android.net",
        "android.content",
        "android.os",
    ):
        forbid(android_context, forbidden, "MailAndroidGlazeContext")
    for marker in (
        "fontScale: Float",
        "animatorsEnabled: Boolean",
        "touchExplorationEnabled: Boolean",
    ):
        require(android_context, marker, "MailAndroidGlazeContext")

    for marker in (
        "MailAndroidGlazeContext.fromSignals(",
        "resources.configuration.fontScale",
        "ValueAnimator.areAnimatorsEnabled()",
        "AccessibilityManager::class.java",
        "MailGlazePresentationPolicy.resolve(",
        "presentation.screenGutterDp.dp",
        "presentation.surfaceRadiusDp.dp",
    ):
        require(activity, marker, "MainActivity")

    forbid(activity, "MailGlazeOptics", "MainActivity")

if errors:
    print("Mail Android GLAZE UI V1.6 source boundary FAILED:", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    raise SystemExit(1)

print("Mail Android GLAZE UI V1.6 source boundary passed")
