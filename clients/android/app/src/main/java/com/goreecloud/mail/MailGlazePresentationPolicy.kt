package com.goreecloud.mail

enum class MailGlazeMaterialRole {
    SOLID,
    RAISED,
    FUNCTIONAL_GLASS,
    CLEAR_GLASS,
}

enum class MailGlazePerformanceLevel {
    FULL,
    BALANCED,
    EFFICIENT,
    ESSENTIAL,
}

enum class MailGlazeMotionMode {
    STANDARD,
    REDUCED,
    MINIMAL,
}

data class MailGlazePresentationContext(
    val reducedMotion: Boolean = false,
    val reducedTransparency: Boolean = false,
    val increasedContrast: Boolean = false,
    val largeText: Boolean = false,
    val extraLargeText: Boolean = false,
    val touchAssistance: Boolean = false,
    val strongFocus: Boolean = false,
    val keyboardFirst: Boolean = false,
    val screenReaderOptimized: Boolean = false,
    val performanceLevel: MailGlazePerformanceLevel = MailGlazePerformanceLevel.FULL,
)

data class MailGlazeResolvedPresentation(
    val materialRole: MailGlazeMaterialRole,
    val motionMode: MailGlazeMotionMode,
    val minimumInteractionTargetDp: Int,
    val screenGutterDp: Int,
    val surfaceRadiusDp: Float,
    val densityMayYieldToReflow: Boolean,
    val strongVisibleFocusRequired: Boolean,
)

object MailGlazePresentationPolicy {
    const val StableVersion = "1.6.0"
    const val StableSourceRevision = "a7180679ea851389e0f3004515f9a25f420e716d"

    fun resolve(
        requestedMaterial: MailGlazeMaterialRole,
        context: MailGlazePresentationContext,
    ): MailGlazeResolvedPresentation {
        val material = when {
            context.reducedTransparency &&
                requestedMaterial in setOf(
                    MailGlazeMaterialRole.FUNCTIONAL_GLASS,
                    MailGlazeMaterialRole.CLEAR_GLASS,
                ) -> MailGlazeMaterialRole.SOLID

            context.performanceLevel == MailGlazePerformanceLevel.ESSENTIAL &&
                requestedMaterial != MailGlazeMaterialRole.SOLID ->
                MailGlazeMaterialRole.SOLID

            context.performanceLevel == MailGlazePerformanceLevel.EFFICIENT &&
                requestedMaterial in setOf(
                    MailGlazeMaterialRole.FUNCTIONAL_GLASS,
                    MailGlazeMaterialRole.CLEAR_GLASS,
                ) -> MailGlazeMaterialRole.RAISED

            else -> requestedMaterial
        }

        val motion = when {
            context.reducedMotion ||
                context.performanceLevel == MailGlazePerformanceLevel.ESSENTIAL ->
                MailGlazeMotionMode.MINIMAL

            context.performanceLevel == MailGlazePerformanceLevel.EFFICIENT ->
                MailGlazeMotionMode.REDUCED

            else -> MailGlazeMotionMode.STANDARD
        }

        return MailGlazeResolvedPresentation(
            materialRole = material,
            motionMode = motion,
            minimumInteractionTargetDp = if (context.touchAssistance) {
                MailGlazeTokens.TouchAssistanceFloorDp
            } else {
                MailGlazeTokens.InteractionFloorDp
            },
            screenGutterDp = if (context.largeText || context.extraLargeText) {
                MailGlazeTokens.LargeTextScreenGutterDp
            } else {
                MailGlazeTokens.ScreenGutterDp
            },
            surfaceRadiusDp = MailGlazeTokens.SurfaceRadiusDp,
            densityMayYieldToReflow = context.largeText || context.extraLargeText,
            strongVisibleFocusRequired =
                context.strongFocus ||
                    context.keyboardFirst ||
                    context.screenReaderOptimized ||
                    context.increasedContrast,
        )
    }
}
