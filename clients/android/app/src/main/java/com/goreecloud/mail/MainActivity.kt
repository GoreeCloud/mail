package com.goreecloud.mail

import android.animation.ValueAnimator
import android.os.Bundle
import android.view.accessibility.AccessibilityManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val accessibilityManager = getSystemService(AccessibilityManager::class.java)
        val glazeContext = MailAndroidGlazeContext.fromSignals(
            fontScale = resources.configuration.fontScale,
            animatorsEnabled = ValueAnimator.areAnimatorsEnabled(),
            touchExplorationEnabled = accessibilityManager?.isTouchExplorationEnabled == true,
        )
        val glazePresentation = MailGlazePresentationPolicy.resolve(
            requestedMaterial = MailGlazeMaterialRole.RAISED,
            context = glazeContext,
        )
        val guidanceStore = MailGuidanceStore(this)

        setContent {
            MaterialTheme {
                var firstUseComplete by remember {
                    mutableStateOf(guidanceStore.isFirstUseComplete())
                }
                var currentGuideStep by remember {
                    mutableIntStateOf(guidanceStore.currentStep())
                }
                var contextualHintsEnabled by remember {
                    mutableStateOf(guidanceStore.areContextualHintsEnabled())
                }
                var showStartupGuide by remember {
                    mutableStateOf(!firstUseComplete)
                }
                var showGuidanceMenu by remember {
                    mutableStateOf(false)
                }

                MailDevelopmentFoundation(
                    capabilities = MailCapabilitySnapshot.developmentShell(),
                    status = MailAndroidFoundationStatus.development(),
                    presentation = glazePresentation,
                    showContextualHint = firstUseComplete && contextualHintsEnabled,
                    onGuidanceClick = { showGuidanceMenu = true },
                )

                if (showStartupGuide) {
                    MailStartupGuide(
                        step = currentGuideStep,
                        replay = firstUseComplete,
                        onBack = {
                            val previous = MailGuidancePolicy.previousStep(currentGuideStep)
                            guidanceStore.setCurrentStep(previous)
                            currentGuideStep = previous
                        },
                        onNext = {
                            val next = MailGuidancePolicy.nextStep(currentGuideStep)
                            if (next == null) {
                                if (!firstUseComplete) {
                                    guidanceStore.completeFirstUse()
                                    firstUseComplete = true
                                } else {
                                    guidanceStore.restartGuide()
                                }
                                currentGuideStep = 0
                                showStartupGuide = false
                            } else {
                                guidanceStore.setCurrentStep(next)
                                currentGuideStep = next
                            }
                        },
                        onCloseReplay = {
                            guidanceStore.restartGuide()
                            currentGuideStep = 0
                            showStartupGuide = false
                        },
                    )
                }

                if (showGuidanceMenu) {
                    MailGuidanceMenu(
                        contextualHintsEnabled = contextualHintsEnabled,
                        onDismiss = { showGuidanceMenu = false },
                        onReplay = {
                            guidanceStore.restartGuide()
                            currentGuideStep = 0
                            showGuidanceMenu = false
                            showStartupGuide = true
                        },
                        onToggleHints = {
                            val enabled = !contextualHintsEnabled
                            guidanceStore.setContextualHintsEnabled(enabled)
                            contextualHintsEnabled = enabled
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun MailDevelopmentFoundation(
    capabilities: MailCapabilitySnapshot,
    status: MailAndroidFoundationStatus,
    presentation: MailGlazeResolvedPresentation,
    showContextualHint: Boolean,
    onGuidanceClick: () -> Unit,
) {
    val unavailableCount = listOf(
        capabilities.accountTransport,
        capabilities.backgroundSync,
        capabilities.pushNotifications,
        capabilities.secureLocalStorage,
        capabilities.attachmentHandling,
    ).count { it.state != MailCapabilityState.AVAILABLE }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background,
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = presentation.screenGutterDp.dp, vertical = 16.dp),
        ) {
            Text(
                text = "GoreeCloud Mail",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = "Native Android Development foundation",
                style = MaterialTheme.typography.bodyMedium,
            )
            TextButton(onClick = onGuidanceClick) {
                Text("Help & guidance")
            }
            if (showContextualHint) {
                Text(
                    text = "Tip: Provider sign-in, mailbox transport, sync, push, secure storage, and attachments remain unavailable until their separate authorities are accepted.",
                    style = MaterialTheme.typography.bodySmall,
                )
            }

            Spacer(Modifier.height(18.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(presentation.surfaceRadiusDp.dp),
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Disconnected by design",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = "$unavailableCount/5 runtime capabilities remain unavailable. " +
                            "No network authority, provider session, mailbox transport, push, secure storage, " +
                            "or attachment runtime is connected.",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = "Session-binding prerequisite: ${capabilities.sessionBindingContract.state.name.replace('_', ' ')}",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Text(
                        text = capabilities.sessionBindingContract.explanation,
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
            }

            Spacer(Modifier.height(12.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(presentation.surfaceRadiusDp.dp),
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Current governance target",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = "Platform Contract ${status.platformContractVersion}; " +
                            "GLAZE UI ${status.glazeUiTargetVersion} migration required. " +
                            "Application-level Glaze UI and production acceptance are not established. " +
                            "Source mapping: ${MailGlazeTokens.Version}.",
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
            }
        }
    }
}


@Composable
private fun MailStartupGuide(
    step: Int,
    replay: Boolean,
    onBack: () -> Unit,
    onNext: () -> Unit,
    onCloseReplay: () -> Unit,
) {
    val normalizedStep = MailGuidancePolicy.normalizeStep(step)
    val title: String
    val body: String
    when (normalizedStep) {
        0 -> {
            title = "This Development client is disconnected"
            body = "There is no provider sign-in, mailbox transport, background sync, push, secure local mailbox storage, or attachment runtime in this build. The screen reports readiness boundaries only."
        }
        1 -> {
            title = "Identity and provider authority stay separate"
            body = "Mail session metadata can be structurally source-ready while runtime readiness remains false. Accepted GoreeCloud Identity registration and session verification do not automatically grant Gmail, IMAP, SMTP, mailbox, or provider authority."
        }
        else -> {
            title = "Privacy and recovery claims remain bounded"
            body = "This Android Development artifact has no INTERNET permission, disables Android backup and cleartext traffic, and does not claim production Glaze, provider, recovery, signing, Release Candidate, or Stable acceptance."
        }
    }

    AlertDialog(
        onDismissRequest = {
            if (replay) {
                onCloseReplay()
            }
        },
        title = { Text("Welcome to GoreeCloud Mail") },
        text = {
            Column {
                Text(
                    text = "Step ${normalizedStep + 1} of ${MailGuidancePolicy.STEP_COUNT}",
                    style = MaterialTheme.typography.labelMedium,
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                )
                Spacer(Modifier.height(8.dp))
                Text(body, style = MaterialTheme.typography.bodyMedium)
            }
        },
        confirmButton = {
            TextButton(onClick = onNext) {
                Text(
                    if (MailGuidancePolicy.nextStep(normalizedStep) == null) {
                        "Finish"
                    } else {
                        "Next"
                    },
                )
            }
        },
        dismissButton = {
            Row {
                TextButton(
                    onClick = onBack,
                    enabled = normalizedStep > 0,
                ) {
                    Text("Back")
                }
                if (replay) {
                    TextButton(onClick = onCloseReplay) {
                        Text("Close")
                    }
                }
            }
        },
    )
}

@Composable
private fun MailGuidanceMenu(
    contextualHintsEnabled: Boolean,
    onDismiss: () -> Unit,
    onReplay: () -> Unit,
    onToggleHints: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Mail guidance") },
        text = {
            Column {
                Text(
                    "Replay the startup guide at any time or turn contextual hints on or off globally. These controls do not activate Identity, providers, networking, mailbox storage, sync, push, or attachments.",
                )
                Spacer(Modifier.height(12.dp))
                TextButton(onClick = onReplay) {
                    Text("Replay startup guide")
                }
                TextButton(onClick = onToggleHints) {
                    Text(
                        if (contextualHintsEnabled) {
                            "Turn contextual hints off"
                        } else {
                            "Turn contextual hints on"
                        },
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        },
    )
}
