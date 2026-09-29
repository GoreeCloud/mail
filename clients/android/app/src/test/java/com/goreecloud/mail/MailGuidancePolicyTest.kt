package com.goreecloud.mail

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class MailGuidancePolicyTest {
    @Test
    fun persistedStepsAreBounded() {
        assertEquals(0, MailGuidancePolicy.normalizeStep(-4))
        assertEquals(1, MailGuidancePolicy.normalizeStep(1))
        assertEquals(2, MailGuidancePolicy.normalizeStep(8))
    }

    @Test
    fun contextualHintRequiresCompletionGlobalEnablementAndUndismissedState() {
        assertEquals(
            true,
            MailGuidancePolicy.shouldShowContextualHint(
                firstUseComplete = true,
                hintsEnabled = true,
                hintDismissed = false,
            ),
        )
        assertEquals(
            false,
            MailGuidancePolicy.shouldShowContextualHint(
                firstUseComplete = false,
                hintsEnabled = true,
                hintDismissed = false,
            ),
        )
        assertEquals(
            false,
            MailGuidancePolicy.shouldShowContextualHint(
                firstUseComplete = true,
                hintsEnabled = false,
                hintDismissed = false,
            ),
        )
        assertEquals(
            false,
            MailGuidancePolicy.shouldShowContextualHint(
                firstUseComplete = true,
                hintsEnabled = true,
                hintDismissed = true,
            ),
        )
    }

    @Test
    fun navigationStopsAtFinalStep() {
        assertEquals(1, MailGuidancePolicy.nextStep(0))
        assertEquals(2, MailGuidancePolicy.nextStep(1))
        assertNull(MailGuidancePolicy.nextStep(2))
        assertEquals(0, MailGuidancePolicy.previousStep(0))
        assertEquals(1, MailGuidancePolicy.previousStep(2))
    }
}
