package com.goreecloud.mail

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MaterialTheme {
                MailDevelopmentShell(MailCapabilitySnapshot.developmentShell())
            }
        }
    }
}

private data class MailboxPreview(
    val name: String,
    val description: String,
)

private val developmentMailboxes = listOf(
    MailboxPreview("Inbox", "Incoming mail will appear here after account transport is accepted"),
    MailboxPreview("Starred", "Locally and remotely starred messages will be available after sync is implemented"),
    MailboxPreview("Sent", "Sent-message history is not connected in this Development shell"),
    MailboxPreview("Drafts", "Draft persistence remains unavailable until secure local storage is implemented"),
    MailboxPreview("Trash", "Deletion and retention behavior is intentionally inactive"),
)

@Composable
private fun MailDevelopmentShell(capabilities: MailCapabilitySnapshot) {
    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 20.dp, vertical = 16.dp),
        ) {
            Text(
                text = "GoreeCloud Mail",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = "Native Android Development client",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Spacer(Modifier.height(18.dp))
            CapabilityStatusCard(capabilities)
            Spacer(Modifier.height(18.dp))

            Text(
                text = "Mailboxes",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(Modifier.height(8.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(developmentMailboxes, key = { it.name }) { mailbox ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                mailbox.name,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                            )
                            Spacer(Modifier.height(4.dp))
                            Text(
                                mailbox.description,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CapabilityStatusCard(capabilities: MailCapabilitySnapshot) {
    val acceptedCount = listOf(
        capabilities.accountTransport,
        capabilities.backgroundSync,
        capabilities.pushNotifications,
        capabilities.secureLocalStorage,
        capabilities.attachmentHandling,
    ).count { it.state == MailCapabilityState.AVAILABLE }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "Runtime capability status",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                )
                Text(
                    text = "$acceptedCount/5 accepted",
                    style = MaterialTheme.typography.labelLarge,
                )
            }
            Spacer(Modifier.height(8.dp))
            Text(
                text = "Account transport, synchronization, push, secure storage, and attachments remain fail-closed. The shell does not request network authority or imply production readiness.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
