package com.goreecloud.mail

object MailGuidancePolicy {
    const val STEP_COUNT = 3

    fun normalizeStep(step: Int): Int = step.coerceIn(0, STEP_COUNT - 1)

    fun previousStep(step: Int): Int =
        (normalizeStep(step) - 1).coerceAtLeast(0)

    fun nextStep(step: Int): Int? {
        val current = normalizeStep(step)
        return if (current >= STEP_COUNT - 1) null else current + 1
    }
}
