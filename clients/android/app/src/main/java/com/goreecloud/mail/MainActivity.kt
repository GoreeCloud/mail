package com.goreecloud.mail

import android.animation.ValueAnimator
import android.os.Bundle
import android.view.accessibility.AccessibilityManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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

        setContent {
            MaterialTheme {
                MailDevelopmentFoundation(
                    capabilities = MailCapabilitySnapshot.developmentShell(),
                    status = MailAndroidFoundationStatus.development(),
                    presentation = glazePresentation,
                )
            }
        }
    }
}

@Composable
private fun MailDevelopmentFoundation(
    capabilities: MailCapabilitySnapshot,
    status: MailAndroidFoundationStatus,
    presentation: MailGlazeResolvedPresentation,
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
