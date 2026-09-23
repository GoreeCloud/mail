package com.goreecloud.mail

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MailCapabilitySnapshotTest {
    @Test
    fun developmentShellDoesNotClaimRuntimeCapabilities() {
        val snapshot = MailCapabilitySnapshot.developmentShell()
        val capabilities = listOf(
            snapshot.accountTransport,
            snapshot.backgroundSync,
            snapshot.pushNotifications,
            snapshot.secureLocalStorage,
            snapshot.attachmentHandling,
        )

        assertEquals(5, capabilities.size)
        assertTrue(capabilities.all { it.state == MailCapabilityState.NOT_IMPLEMENTED })
        assertTrue(capabilities.none { it.state == MailCapabilityState.AVAILABLE })
    }

    @Test
    fun unavailableCapabilitiesCarryAnExplanation() {
        val snapshot = MailCapabilitySnapshot.developmentShell()

        assertTrue(snapshot.accountTransport.explanation.isNotBlank())
        assertTrue(snapshot.secureLocalStorage.explanation.isNotBlank())
    }
}
