package com.goreecloud.mail

import android.content.Context

class MailGuidanceStore(context: Context) {
    private val preferences = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

    fun isFirstUseComplete(): Boolean =
        preferences.getBoolean(KEY_FIRST_USE_COMPLETE, false)

    fun currentStep(): Int =
        MailGuidancePolicy.normalizeStep(preferences.getInt(KEY_CURRENT_STEP, 0))

    fun setCurrentStep(step: Int) {
        preferences.edit()
            .putInt(KEY_CURRENT_STEP, MailGuidancePolicy.normalizeStep(step))
            .apply()
    }

    fun completeFirstUse() {
        preferences.edit()
            .putBoolean(KEY_FIRST_USE_COMPLETE, true)
            .putInt(KEY_CURRENT_STEP, 0)
            .apply()
    }

    fun restartGuide() {
        preferences.edit().putInt(KEY_CURRENT_STEP, 0).apply()
    }

    fun areContextualHintsEnabled(): Boolean =
        preferences.getBoolean(KEY_CONTEXTUAL_HINTS_ENABLED, true)

    fun setContextualHintsEnabled(enabled: Boolean) {
        preferences.edit().putBoolean(KEY_CONTEXTUAL_HINTS_ENABLED, enabled).apply()
    }

    fun isMainContextualHintDismissed(): Boolean =
        preferences.getBoolean(KEY_MAIN_CONTEXTUAL_HINT_DISMISSED, false)

    fun dismissMainContextualHint() {
        preferences.edit().putBoolean(KEY_MAIN_CONTEXTUAL_HINT_DISMISSED, true).apply()
    }

    fun resetDismissedContextualHints() {
        preferences.edit().remove(KEY_MAIN_CONTEXTUAL_HINT_DISMISSED).apply()
    }

    companion object {
        const val PREFERENCES_NAME = "goreecloud_mail_guidance"
        const val KEY_FIRST_USE_COMPLETE = "first_use_complete"
        const val KEY_CURRENT_STEP = "current_step"
        const val KEY_CONTEXTUAL_HINTS_ENABLED = "contextual_hints_enabled"
        const val KEY_MAIN_CONTEXTUAL_HINT_DISMISSED = "main_contextual_hint_dismissed"
    }
}
