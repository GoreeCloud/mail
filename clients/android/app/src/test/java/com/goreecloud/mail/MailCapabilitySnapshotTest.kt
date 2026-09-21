package com.goreecloud.mail

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MailCapabilitySnapshotTest {
    @Test
    fun developmentFoundationDoesNotClaimRuntimeCapabilities() {
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
        assertTrue(capabilities.all { it.explanation.isNotBlank() })
    }

    @Test
    fun governanceStatusKeepsV16AndProductionFailClosed() {
        val status = MailAndroidFoundationStatus.development()

        assertEquals("0.4", status.platformContractVersion)
        assertEquals("1.6.0", status.glazeUiTargetVersion)
        assertFalse(status.glazeUiAccepted)
        assertFalse(status.productionAccepted)
        assertFalse(status.runtimeConnected)
    }
}
