package com.goreecloud.mail

import java.time.Instant

object MailIdentityNativeSessionReference {
    const val SCHEMA = "goreecloud.identity.native-application-session/v1"
    const val DEVELOPMENT_CANDIDATE_REVISION = "b010bcc3610c3898f108340b8c978bb783418980"
    const val CANONICAL_AUTHORITY = "GoreeCloud Identity"
    const val APPLICATION_ID = "goreecloud-mail"
    const val DEVELOPMENT_AUDIENCE = "goreecloud-mail-android"
    const val CONTRACT_RUNTIME_ACCEPTED = false
    const val APPLICATION_REGISTRATION_ACCEPTED = false
}

data class MailSessionExpectation(
    val principalId: String,
    val accountId: String,
    val clientInstanceId: String,
    val audience: String = MailIdentityNativeSessionReference.DEVELOPMENT_AUDIENCE,
)

data class MailSessionAcceptanceProof(
    val principalId: String,
    val audience: String,
    val issuedAt: Instant,
    val expiresAt: Instant,
    val accountId: String,
    val clientInstanceId: String,
)

object MailSessionBindingReadiness {
    enum class Blocker {
        IDENTITY_CONTRACT_NOT_RUNTIME_ACCEPTED,
        APPLICATION_REGISTRATION_NOT_ACCEPTED,
        MISSING_PROOF,
        INVALID_EXPECTATION,
        INVALID_PROOF,
        APPLICATION_AUDIENCE_MISMATCH,
        PRINCIPAL_MISMATCH,
        AUDIENCE_MISMATCH,
        ACCOUNT_MISMATCH,
        CLIENT_INSTANCE_MISMATCH,
        NOT_YET_VALID,
        EXPIRED,
    }

    data class Decision(
        val structuralAcceptance: Boolean,
        val runtimeReady: Boolean,
        val blockers: Set<Blocker>,
    )

    private val authorityBlockers = setOf(
        Blocker.IDENTITY_CONTRACT_NOT_RUNTIME_ACCEPTED,
        Blocker.APPLICATION_REGISTRATION_NOT_ACCEPTED,
    )

    fun evaluate(
        proof: MailSessionAcceptanceProof?,
        expectation: MailSessionExpectation,
        now: Instant,
    ): Decision {
        val blockers = linkedSetOf<Blocker>()

        if (!MailIdentityNativeSessionReference.CONTRACT_RUNTIME_ACCEPTED) {
            blockers += Blocker.IDENTITY_CONTRACT_NOT_RUNTIME_ACCEPTED
        }
        if (!MailIdentityNativeSessionReference.APPLICATION_REGISTRATION_ACCEPTED) {
            blockers += Blocker.APPLICATION_REGISTRATION_NOT_ACCEPTED
        }

        if (
            !isExactNonBlank(expectation.principalId) ||
            !isExactNonBlank(expectation.accountId) ||
            !isExactNonBlank(expectation.clientInstanceId) ||
            !isExactNonBlank(expectation.audience)
        ) {
            blockers += Blocker.INVALID_EXPECTATION
            return decision(blockers)
        }

        if (expectation.audience != MailIdentityNativeSessionReference.DEVELOPMENT_AUDIENCE) {
            blockers += Blocker.APPLICATION_AUDIENCE_MISMATCH
        }

        if (proof == null) {
            blockers += Blocker.MISSING_PROOF
            return decision(blockers)
        }

        if (
            !isExactNonBlank(proof.principalId) ||
            !isExactNonBlank(proof.accountId) ||
            !isExactNonBlank(proof.clientInstanceId) ||
            !isExactNonBlank(proof.audience) ||
            !proof.issuedAt.isBefore(proof.expiresAt)
        ) {
            blockers += Blocker.INVALID_PROOF
            return decision(blockers)
        }

        if (proof.principalId != expectation.principalId) blockers += Blocker.PRINCIPAL_MISMATCH
        if (proof.audience != expectation.audience) blockers += Blocker.AUDIENCE_MISMATCH
        if (proof.accountId != expectation.accountId) blockers += Blocker.ACCOUNT_MISMATCH
        if (proof.clientInstanceId != expectation.clientInstanceId) {
            blockers += Blocker.CLIENT_INSTANCE_MISMATCH
        }
        if (now.isBefore(proof.issuedAt)) blockers += Blocker.NOT_YET_VALID
        if (!now.isBefore(proof.expiresAt)) blockers += Blocker.EXPIRED

        return decision(blockers)
    }

    private fun decision(blockers: Set<Blocker>): Decision {
        val structuralBlockers = blockers - authorityBlockers
        return Decision(
            structuralAcceptance = structuralBlockers.isEmpty(),
            runtimeReady = blockers.isEmpty(),
            blockers = blockers,
        )
    }

    private fun isExactNonBlank(value: String): Boolean =
        value.isNotBlank() &&
            value == value.trim() &&
            value.none(Char::isISOControl)
}
