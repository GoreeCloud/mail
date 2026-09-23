package com.goreecloud.mail

enum class MailCapabilityState {
    NOT_IMPLEMENTED,
    UNAVAILABLE,
    AVAILABLE,
}

data class MailCapability(
    val state: MailCapabilityState,
    val explanation: String,
)

data class MailCapabilitySnapshot(
    val accountTransport: MailCapability,
    val backgroundSync: MailCapability,
    val pushNotifications: MailCapability,
    val secureLocalStorage: MailCapability,
    val attachmentHandling: MailCapability,
) {
    companion object {
        fun developmentShell(): MailCapabilitySnapshot {
            val pending = MailCapability(
                state = MailCapabilityState.NOT_IMPLEMENTED,
                explanation = "Not connected in the Android Development foundation",
            )
            return MailCapabilitySnapshot(
                accountTransport = pending,
                backgroundSync = pending,
                pushNotifications = pending,
                secureLocalStorage = pending,
                attachmentHandling = pending,
            )
        }
    }
}

data class MailAndroidFoundationStatus(
    val platformContractVersion: String,
    val glazeUiTargetVersion: String,
    val glazeUiAccepted: Boolean,
    val productionAccepted: Boolean,
    val runtimeConnected: Boolean,
) {
    companion object {
        fun development(): MailAndroidFoundationStatus = MailAndroidFoundationStatus(
            platformContractVersion = "0.4",
            glazeUiTargetVersion = "1.6.0",
            glazeUiAccepted = false,
            productionAccepted = false,
            runtimeConnected = false,
        )
    }
}
