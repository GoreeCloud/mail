package com.goreecloud.mail

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MailGlazePresentationPolicyTest {
    @Test
    fun touchAssistanceRaisesInteractionFloor() {
        val resolved = MailGlazePresentationPolicy.resolve(
            requestedMaterial = MailGlazeMaterialRole.RAISED,
            context = MailGlazePresentationContext(touchAssistance = true),
        )

        assertEquals(56, resolved.minimumInteractionTargetDp)
    }

    @Test
    fun reducedTransparencyFailsGlassClosedToSolid() {
        val resolved = MailGlazePresentationPolicy.resolve(
            requestedMaterial = MailGlazeMaterialRole.FUNCTIONAL_GLASS,
            context = MailGlazePresentationContext(reducedTransparency = true),
        )

        assertEquals(MailGlazeMaterialRole.SOLID, resolved.materialRole)
    }

    @Test
    fun reducedMotionUsesMinimalMotion() {
        val resolved = MailGlazePresentationPolicy.resolve(
            requestedMaterial = MailGlazeMaterialRole.RAISED,
            context = MailGlazePresentationContext(reducedMotion = true),
        )

        assertEquals(MailGlazeMotionMode.MINIMAL, resolved.motionMode)
    }

    @Test
    fun largeTextUsesTighterGutterAndAllowsReflow() {
        val resolved = MailGlazePresentationPolicy.resolve(
            requestedMaterial = MailGlazeMaterialRole.RAISED,
            context = MailGlazePresentationContext(largeText = true),
        )

        assertEquals(16, resolved.screenGutterDp)
        assertTrue(resolved.densityMayYieldToReflow)
    }

    @Test
    fun essentialPerformanceUsesSolidMinimalPresentation() {
        val resolved = MailGlazePresentationPolicy.resolve(
            requestedMaterial = MailGlazeMaterialRole.CLEAR_GLASS,
            context = MailGlazePresentationContext(
                performanceLevel = MailGlazePerformanceLevel.ESSENTIAL,
            ),
        )

        assertEquals(MailGlazeMaterialRole.SOLID, resolved.materialRole)
        assertEquals(MailGlazeMotionMode.MINIMAL, resolved.motionMode)
    }

    @Test
    fun neutralContextKeepsOrdinaryFloorAndDoesNotClaimStrongFocus() {
        val resolved = MailGlazePresentationPolicy.resolve(
            requestedMaterial = MailGlazeMaterialRole.RAISED,
            context = MailGlazePresentationContext(),
        )

        assertEquals(48, resolved.minimumInteractionTargetDp)
        assertFalse(resolved.strongVisibleFocusRequired)
    }

    @Test
    fun androidProjectionUsesOnlySuppliedPresentationSignals() {
        val resolved = MailAndroidGlazeContext.fromSignals(
            fontScale = 2.0f,
            animatorsEnabled = false,
            touchExplorationEnabled = true,
        )

        assertTrue(resolved.reducedMotion)
        assertTrue(resolved.largeText)
        assertTrue(resolved.extraLargeText)
        assertTrue(resolved.touchAssistance)
        assertTrue(resolved.screenReaderOptimized)
    }

    @Test
    fun invalidFontScaleFallsBackToNeutralScale() {
        val resolved = MailAndroidGlazeContext.fromSignals(
            fontScale = Float.NaN,
            animatorsEnabled = true,
            touchExplorationEnabled = false,
        )

        assertFalse(resolved.largeText)
        assertFalse(resolved.extraLargeText)
        assertFalse(resolved.reducedMotion)
    }
}
