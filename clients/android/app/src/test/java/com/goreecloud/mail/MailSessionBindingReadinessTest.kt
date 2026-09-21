package com.goreecloud.mail

import java.time.Instant
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MailSessionBindingReadinessTest {
    private val now = Instant.parse("2026-09-21T20:00:00Z")
    private val expectation = MailSessionExpectation(
        principalId = "principal-42",
        accountId = "mail-account-7",
        clientInstanceId = "client-instance-a",
    )

    private fun proof(
        principalId: String = expectation.principalId,
        audience: String = expectation.audience,
        accountId: String = expectation.accountId,
        clientInstanceId: String = expectation.clientInstanceId,
        issuedAt: Instant = now.minusSeconds(60),
        expiresAt: Instant = now.plusSeconds(600),
    ) = MailSessionAcceptanceProof(
        principalId = principalId,
        audience = audience,
        issuedAt = issuedAt,
        expiresAt = expiresAt,
        accountId = accountId,
        clientInstanceId = clientInstanceId,
    )

    @Test
    fun sourceReferencePinsCurrentIdentityDevelopmentCandidateWithoutAcceptingRuntime() {
        assertTrue(MailIdentityNativeSessionReference.SCHEMA == "goreecloud.identity.native-application-session/v1")
        assertTrue(
            MailIdentityNativeSessionReference.DEVELOPMENT_CANDIDATE_REVISION ==
                "d6f0f47aa98a9f1bce5b27df5bbf52da71950c30",
        )
        assertFalse(MailIdentityNativeSessionReference.CONTRACT_RUNTIME_ACCEPTED)
        assertFalse(MailIdentityNativeSessionReference.APPLICATION_REGISTRATION_ACCEPTED)
    }

    @Test
    fun structurallyValidProofStillCannotBecomeRuntimeReady() {
        val decision = MailSessionBindingReadiness.evaluate(proof(), expectation, now)

        assertTrue(decision.structuralAcceptance)
        assertFalse(decision.runtimeReady)
        assertTrue(
            MailSessionBindingReadiness.Blocker.IDENTITY_CONTRACT_NOT_RUNTIME_ACCEPTED in
                decision.blockers,
        )
        assertTrue(
            MailSessionBindingReadiness.Blocker.APPLICATION_REGISTRATION_NOT_ACCEPTED in
                decision.blockers,
        )
    }

    @Test
    fun missingProofFailsClosed() {
        val decision = MailSessionBindingReadiness.evaluate(null, expectation, now)

        assertFalse(decision.structuralAcceptance)
        assertFalse(decision.runtimeReady)
        assertTrue(MailSessionBindingReadiness.Blocker.MISSING_PROOF in decision.blockers)
    }

    @Test
    fun principalAudienceAccountAndClientInstanceMustMatchExactly() {
        val cases = listOf(
            proof(principalId = "principal-41") to MailSessionBindingReadiness.Blocker.PRINCIPAL_MISMATCH,
            proof(audience = "goreecloud-mail-web") to MailSessionBindingReadiness.Blocker.AUDIENCE_MISMATCH,
            proof(accountId = "mail-account-8") to MailSessionBindingReadiness.Blocker.ACCOUNT_MISMATCH,
            proof(clientInstanceId = "client-instance-b") to MailSessionBindingReadiness.Blocker.CLIENT_INSTANCE_MISMATCH,
        )

        cases.forEach { (candidate, blocker) ->
            val decision = MailSessionBindingReadiness.evaluate(candidate, expectation, now)
            assertFalse(decision.structuralAcceptance)
            assertTrue(blocker in decision.blockers)
        }
    }

    @Test
    fun trimDependentControlBearingAndInvalidLifetimeProofsFailClosed() {
        val invalidValues = listOf(
            proof(accountId = " mail-account-7"),
            proof(clientInstanceId = "client-instance-a\n"),
            proof(issuedAt = now, expiresAt = now),
        )

        invalidValues.forEach { candidate ->
            val decision = MailSessionBindingReadiness.evaluate(candidate, expectation, now)
            assertFalse(decision.structuralAcceptance)
            assertTrue(MailSessionBindingReadiness.Blocker.INVALID_PROOF in decision.blockers)
        }
    }

    @Test
    fun futureAndExpiredProofsFailClosed() {
        val future = MailSessionBindingReadiness.evaluate(
            proof(issuedAt = now.plusSeconds(1), expiresAt = now.plusSeconds(600)),
            expectation,
            now,
        )
        assertFalse(future.structuralAcceptance)
        assertTrue(MailSessionBindingReadiness.Blocker.NOT_YET_VALID in future.blockers)

        val expired = MailSessionBindingReadiness.evaluate(
            proof(expiresAt = now),
            expectation,
            now,
        )
        assertFalse(expired.structuralAcceptance)
        assertTrue(MailSessionBindingReadiness.Blocker.EXPIRED in expired.blockers)
    }
}
