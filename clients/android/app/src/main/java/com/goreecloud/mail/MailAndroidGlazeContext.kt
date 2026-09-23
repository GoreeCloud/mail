package com.goreecloud.mail

/**
 * Privacy-safe Android runtime projection into Mail-local GLAZE UI V1.6 presentation context.
 *
 * Only Android configuration/accessibility presentation signals enter this projection. Mailbox
 * content, message bodies, recipients, provider accounts, Identity sessions, security results,
 * attachment content, synchronization state, and remote resources are forbidden inputs.
 */
object MailAndroidGlazeContext {
    const val DefaultFontScale = 1.0f
    const val ExtraLargeTextScale = 2.0f

    fun fromSignals(
        fontScale: Float,
        animatorsEnabled: Boolean,
        touchExplorationEnabled: Boolean,
    ): MailGlazePresentationContext {
        val normalized = fontScale.takeIf { it.isFinite() && it > 0f } ?: DefaultFontScale
        return MailGlazePresentationContext(
            reducedMotion = !animatorsEnabled,
            largeText = normalized > DefaultFontScale,
            extraLargeText = normalized >= ExtraLargeTextScale,
            touchAssistance = touchExplorationEnabled,
            screenReaderOptimized = touchExplorationEnabled,
        )
    }
}
