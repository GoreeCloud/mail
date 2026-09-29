import { materializeComposeAttachments } from './compose-attachments.js';
import { buildForwardCompose, buildReplyCompose } from './compose-context.js';
import {
  MAIL_PROVIDER_CAPABILITY,
  normalizeCapabilities,
} from './mail-provider.js';
import { mailboxName, filterLoadedMailboxMessages } from './mailbox-view.js';
import { moveDestinationMailboxes } from './message-move.js';
import { formatMessagePlainText, messagePlainTextFilename } from './message-export.js';
import { readMailProviderRuntime } from './provider-runtime.js';
import { presentAttachmentSecurity } from './security/attachment-security-presentation.js';

const runtimeResult = (() => {
  try {
    return { runtime: readMailProviderRuntime() };
  } catch (error) {
    return { error };
  }
})();
const runtime = runtimeResult.runtime ?? null;
const provider = runtime?.provider ?? null;

const mailboxList = document.querySelector('#mailboxList');
const mailboxTitle = document.querySelector('#mailboxTitle');
const messageList = document.querySelector('#messageList');
const searchInput = document.querySelector('#searchInput');
const composeButton = document.querySelector('#composeButton');
const composeDialog = document.querySelector('#composeDialog');
const composeForm = document.querySelector('#composeForm');
const composeEyebrow = document.querySelector('#composeEyebrow');
const composeTitle = document.querySelector('#composeTitle');
const composeStatus = document.querySelector('#composeStatus');
const composeAttachments = document.querySelector('#composeAttachments');
const composeAttachmentPreview = document.querySelector('#composeAttachmentPreview');
const composeDraftButton = composeForm.querySelector('.draft-button');
const composeSendButton = composeForm.querySelector('.send-button');
const providerStatus = document.querySelector('#providerStatus');
const emptyReader = document.querySelector('#emptyReader');
const messageReader = document.querySelector('#messageReader');
const readerSubject = document.querySelector('#readerSubject');
const readerSender = document.querySelector('#readerSender');
const readerAddress = document.querySelector('#readerAddress');
const readerDate = document.querySelector('#readerDate');
const readerBody = document.querySelector('#readerBody');
const readerAvatar = document.querySelector('#readerAvatar');
const readerAttachments = document.querySelector('#readerAttachments');
const readerAttachmentStatus = document.querySelector('#readerAttachmentStatus');
const replyButton = document.querySelector('#replyButton');
const forwardButton = document.querySelector('#forwardButton');
const exportMessageButton = document.querySelector('#exportMessageButton');
const moveControl = document.querySelector('#moveControl');
const moveMailboxSelect = document.querySelector('#moveMailboxSelect');
const moveButton = document.querySelector('#moveButton');
const archiveButton = document.querySelector('#archiveButton');
const deleteButton = document.querySelector('#deleteButton');
const flagButton = document.querySelector('#flagButton');

let mailboxes = [];
let messages = [];
let providerCapabilities = normalizeCapabilities();
let selectedMailboxId = 'inbox';
let selectedMessageId = null;
let selectedMessage = null;
let selectedComposeAttachments = [];
let mailboxLoadGeneration = 0;
let messageLoadGeneration = 0;
let messageMutationInFlight = false;

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatBytes(value) {
  const bytes = Number.isFinite(value) && value >= 0 ? value : 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function optionalComposeField(formData, name) {
  const value = String(formData.get(name) ?? '').trim();
  return value || null;
}

function setComposeField(name, value) {
  const field = composeForm.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    field.value = String(value ?? '');
  }
}

function openCompose({
  eyebrow = 'New message',
  title = 'Compose',
  to = '',
  cc = '',
  bcc = '',
  subject = '',
  body = '',
  status = '',
  focus = 'to',
} = {}) {
  composeForm.reset();
  clearComposeAttachmentPreview();
  composeAttachments.value = '';
  composeEyebrow.textContent = eyebrow;
  composeTitle.textContent = title;
  composeStatus.textContent = status;
  setComposeField('to', to);
  setComposeField('cc', cc);
  setComposeField('bcc', bcc);
  setComposeField('subject', subject);
  setComposeField('body', body);
  composeDialog.showModal();
  const focusTarget = composeForm.elements.namedItem(focus);
  if (focusTarget instanceof HTMLElement) focusTarget.focus();
}

function renderMailboxes() {
  mailboxList.replaceChildren(
    ...mailboxes.map((mailbox) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mailbox-button';
      button.dataset.mailboxId = mailbox.id;
      button.setAttribute('aria-current', mailbox.id === selectedMailboxId ? 'page' : 'false');

      const label = document.createElement('span');
      label.textContent = mailbox.name;

      const count = document.createElement('span');
      count.className = 'mailbox-count';
      count.textContent = String(mailbox.unread ?? 0);

      button.append(label, count);
      return button;
    }),
  );
}

function setMailboxControlsDisabled(disabled) {
  for (const button of mailboxList.querySelectorAll('[data-mailbox-id]')) {
    button.disabled = disabled;
  }
}

function syncMoveDestinations(hasSelection) {
  const moveAvailable = providerCapabilities[MAIL_PROVIDER_CAPABILITY.MOVE];
  const previousDestination = moveMailboxSelect.value;
  const destinations = moveAvailable ? moveDestinationMailboxes(mailboxes, selectedMailboxId) : [];
  moveMailboxSelect.replaceChildren(
    ...destinations.map((mailbox) => {
      const option = document.createElement('option');
      option.value = mailbox.id;
      option.textContent = mailbox.name;
      return option;
    }),
  );
  if (destinations.some((mailbox) => mailbox.id === previousDestination)) {
    moveMailboxSelect.value = previousDestination;
  }
  moveControl.hidden = !moveAvailable || destinations.length === 0;
  moveMailboxSelect.disabled = !hasSelection || !moveAvailable || destinations.length === 0;
  moveButton.disabled = !hasSelection || !moveAvailable || destinations.length === 0;
}

function syncReaderActions() {
  const hasSelection = Boolean(selectedMessageId) && !messageMutationInFlight;
  const archiveAvailable = providerCapabilities[MAIL_PROVIDER_CAPABILITY.ARCHIVE]
    && selectedMailboxId !== 'archive'
    && selectedMailboxId !== 'trash';
  const deleteAvailable = providerCapabilities[MAIL_PROVIDER_CAPABILITY.DELETE]
    && selectedMailboxId !== 'trash';
  const flagAvailable = providerCapabilities[MAIL_PROVIDER_CAPABILITY.FLAGS];

  syncMoveDestinations(hasSelection);
  archiveButton.hidden = !archiveAvailable;
  archiveButton.disabled = !hasSelection || !archiveAvailable;
  deleteButton.hidden = !deleteAvailable;
  deleteButton.disabled = !hasSelection || !deleteAvailable;
  flagButton.hidden = !flagAvailable;
  flagButton.disabled = !hasSelection || !flagAvailable;
  exportMessageButton.disabled = !hasSelection;
}

function clearReader() {
  messageLoadGeneration += 1;
  selectedMessageId = null;
  selectedMessage = null;
  messageReader.hidden = true;
  emptyReader.hidden = false;
  readerAttachments.hidden = true;
  readerAttachments.replaceChildren();
  readerAttachmentStatus.textContent = '';
  syncReaderActions();
}

function renderMessages(items) {
  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'message-preview';
    empty.textContent = 'No messages in this mailbox view.';
    messageList.replaceChildren(empty);
    return;
  }

  messageList.replaceChildren(
    ...items.map((message) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `message-card${message.unread ? ' unread' : ''}`;
      card.dataset.messageId = message.id;
      card.setAttribute('aria-current', String(message.id === selectedMessageId));

      const topline = document.createElement('div');
      topline.className = 'message-topline';

      const sender = document.createElement('strong');
      sender.className = 'message-sender';
      sender.textContent = message.sender;

      const meta = document.createElement('span');
      meta.className = 'message-meta';
      meta.textContent = `${message.flagged ? '★ · ' : ''}${formatDate(message.receivedAt)}`;

      const subject = document.createElement('div');
      subject.className = 'message-subject';
      subject.textContent = message.subject;

      const preview = document.createElement('p');
      preview.className = 'message-preview';
      preview.textContent = message.preview;

      topline.append(sender, meta);
      card.append(topline, subject, preview);
      return card;
    }),
  );
}

function renderCurrentMailboxSearch() {
  renderMessages(filterLoadedMailboxMessages(messages, searchInput.value));
}

function renderAttachments(attachments = []) {
  readerAttachmentStatus.textContent = '';
  if (!Array.isArray(attachments) || attachments.length === 0) {
    readerAttachments.hidden = true;
    readerAttachments.replaceChildren();
    return;
  }

  readerAttachments.hidden = false;
  readerAttachments.replaceChildren(
    ...attachments.map((attachment) => {
      const presentation = presentAttachmentSecurity(attachment.securityDecision);
      const card = document.createElement('article');
      card.className = `attachment-card attachment-${presentation.state}`;

      const heading = document.createElement('div');
      heading.className = 'attachment-heading';
      const filename = document.createElement('strong');
      filename.textContent = attachment.filename || 'Unnamed attachment';
      const size = document.createElement('span');
      size.textContent = formatBytes(attachment.size);
      heading.append(filename, size);

      const security = document.createElement('div');
      security.className = 'attachment-security-state';
      const stateHeadline = document.createElement('strong');
      stateHeadline.textContent = presentation.headline;
      const stateDetail = document.createElement('span');
      stateDetail.textContent = presentation.detail;
      security.append(stateHeadline, stateDetail);

      const actions = document.createElement('div');
      actions.className = 'attachment-actions';
      for (const [action, allowed] of [
        ['open', presentation.canOpen],
        ['download', presentation.canDownload],
      ]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.attachmentAction = action;
        button.dataset.attachmentId = attachment.id || '';
        button.disabled = !allowed;
        button.textContent = action === 'open' ? 'Open' : 'Download';
        if (!allowed) button.title = presentation.headline;
        actions.append(button);
      }

      if (presentation.showEvidence) {
        const evidence = document.createElement('details');
        evidence.className = 'attachment-evidence';
        const summary = document.createElement('summary');
        summary.textContent = 'Security evidence';
        const list = document.createElement('ul');
        for (const reference of presentation.evidenceRefs) {
          const item = document.createElement('li');
          item.textContent = reference;
          list.append(item);
        }
        evidence.append(summary, list);
        card.append(heading, security, actions, evidence);
      } else {
        card.append(heading, security, actions);
      }
      return card;
    }),
  );
}

function clearComposeAttachmentPreview() {
  selectedComposeAttachments = [];
  composeAttachmentPreview.hidden = true;
  composeAttachmentPreview.replaceChildren();
}

function renderComposeAttachmentPreview(files, materialized) {
  selectedComposeAttachments = materialized;
  if (materialized.length === 0) {
    clearComposeAttachmentPreview();
    return;
  }

  composeAttachmentPreview.hidden = false;
  composeAttachmentPreview.replaceChildren(
    ...materialized.map((attachment, index) => {
      const row = document.createElement('div');
      row.className = 'compose-attachment-row';
      const name = document.createElement('strong');
      name.textContent = attachment.filename;
      const detail = document.createElement('span');
      detail.textContent = `${formatBytes(files[index]?.size ?? 0)} · ${attachment.contentType}`;
      row.append(name, detail);
      return row;
    }),
  );
}

async function openMessage(id) {
  const generation = ++messageLoadGeneration;
  const message = await provider.getMessage(id);
  if (generation !== messageLoadGeneration || !message || !messages.some((item) => item.id === id)) return;

  selectedMessageId = id;
  selectedMessage = message;
  emptyReader.hidden = true;
  messageReader.hidden = false;
  readerSubject.textContent = message.subject;
  readerSender.textContent = message.sender;
  readerAddress.textContent = message.address;
  readerDate.textContent = formatDate(message.receivedAt);
  readerDate.dateTime = message.receivedAt;
  readerBody.textContent = message.body;
  readerAvatar.textContent = message.sender.slice(0, 1).toUpperCase();
  flagButton.textContent = message.flagged ? '★' : '☆';
  flagButton.setAttribute('aria-pressed', String(message.flagged));
  renderAttachments(message.attachments);
  syncReaderActions();
  renderCurrentMailboxSearch();
}

async function loadMailbox(mailboxId, { force = false } = {}) {
  if (!provider || !mailboxes.some((mailbox) => mailbox.id === mailboxId)) return;
  if (!force && mailboxId === selectedMailboxId && messages.length > 0) return;

  const generation = ++mailboxLoadGeneration;
  const previousMailboxId = selectedMailboxId;
  const previousMessages = messages;
  searchInput.value = '';
  clearReader();
  setMailboxControlsDisabled(true);
  messageList.textContent = `Loading ${mailboxName(mailboxes, mailboxId)}…`;

  try {
    const loadedMessages = await provider.listMessages(mailboxId);
    if (generation !== mailboxLoadGeneration) return;
    if (!Array.isArray(loadedMessages)) throw new TypeError('Mail provider returned an invalid message collection.');

    selectedMailboxId = mailboxId;
    messages = loadedMessages;
    mailboxTitle.textContent = mailboxName(mailboxes, selectedMailboxId);
    renderMailboxes();
    renderMessages(messages);
    syncReaderActions();
  } catch (error) {
    if (generation !== mailboxLoadGeneration) return;
    selectedMailboxId = previousMailboxId;
    messages = previousMessages;
    mailboxTitle.textContent = mailboxName(mailboxes, selectedMailboxId);
    renderMailboxes();
    renderMessages(messages);
    syncReaderActions();
    providerStatus.textContent = `${runtime.label} · mailbox read failed`;
    console.error('Unable to load the selected GoreeCloud Mail mailbox.', error);
  } finally {
    if (generation === mailboxLoadGeneration) setMailboxControlsDisabled(false);
  }
}

async function refreshMailboxMetadata() {
  try {
    const refreshed = await provider.listMailboxes();
    if (Array.isArray(refreshed) && refreshed.length > 0) {
      mailboxes = refreshed;
      renderMailboxes();
    }
  } catch (error) {
    console.error('Unable to refresh GoreeCloud Mail mailbox metadata.', error);
  }
}

async function runSelectedMessageMutation({ operation, successLabel }) {
  if (!selectedMessageId || !provider || messageMutationInFlight) return;
  const messageId = selectedMessageId;
  messageMutationInFlight = true;
  setMailboxControlsDisabled(true);
  syncReaderActions();

  try {
    await provider[operation](messageId);
    await refreshMailboxMetadata();
    await loadMailbox(selectedMailboxId, { force: true });
    providerStatus.textContent = `${runtime.label} · ${successLabel}`;
  } catch (error) {
    providerStatus.textContent = `${runtime.label} · ${successLabel} failed`;
    console.error(`Unable to ${operation} the selected GoreeCloud Mail message.`, error);
  } finally {
    messageMutationInFlight = false;
    setMailboxControlsDisabled(false);
    syncReaderActions();
  }
}

async function runSelectedMessageMove() {
  if (!selectedMessageId || !provider || messageMutationInFlight || !providerCapabilities[MAIL_PROVIDER_CAPABILITY.MOVE]) return;
  const destinationId = moveMailboxSelect.value;
  const destination = moveDestinationMailboxes(mailboxes, selectedMailboxId).find((mailbox) => mailbox.id === destinationId);
  if (!destination) return;

  const messageId = selectedMessageId;
  messageMutationInFlight = true;
  setMailboxControlsDisabled(true);
  syncReaderActions();
  try {
    await provider.move(messageId, destination.id);
    await refreshMailboxMetadata();
    await loadMailbox(selectedMailboxId, { force: true });
    providerStatus.textContent = `${runtime.label} · message moved to ${destination.name}`;
  } catch (error) {
    providerStatus.textContent = `${runtime.label} · move to ${destination.name} failed`;
    console.error('Unable to move the selected GoreeCloud Mail message.', error);
  } finally {
    messageMutationInFlight = false;
    setMailboxControlsDisabled(false);
    syncReaderActions();
  }
}

async function initialize() {
  if (!runtime || !provider) {
    throw runtimeResult.error ?? new Error('Mail provider runtime is unavailable.');
  }
  providerStatus.textContent = runtime.label;
  composeDraftButton.textContent = runtime.mode === 'gateway' ? 'Save draft' : 'Save demo draft';
  composeSendButton.textContent = runtime.mode === 'gateway' ? 'Send message' : 'Send demo message';
  await provider.authenticate();
  try {
    providerCapabilities = normalizeCapabilities(await provider.capabilities());
  } catch (error) {
    providerCapabilities = normalizeCapabilities();
    providerStatus.textContent = `${runtime.label} · message actions unavailable`;
    console.error('Unable to read GoreeCloud Mail provider capabilities.', error);
  }
  const loadedMailboxes = await provider.listMailboxes();
  if (!Array.isArray(loadedMailboxes) || loadedMailboxes.length === 0) {
    throw new Error('Mail provider returned no readable mailboxes.');
  }
  mailboxes = loadedMailboxes;
  selectedMailboxId = mailboxes.some((mailbox) => mailbox.id === 'inbox') ? 'inbox' : mailboxes[0].id;
  messages = [];
  mailboxTitle.textContent = mailboxName(mailboxes, selectedMailboxId);
  renderMailboxes();
  syncReaderActions();
  await loadMailbox(selectedMailboxId);
}

mailboxList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-mailbox-id]');
  if (!button || button.disabled) return;
  void loadMailbox(button.dataset.mailboxId);
});

messageList.addEventListener('click', async (event) => {
  const card = event.target.closest('[data-message-id]');
  if (!card || !provider) return;
  await openMessage(card.dataset.messageId);
});

readerAttachments.addEventListener('click', (event) => {
  const button = event.target.closest('[data-attachment-action]');
  if (!button || button.disabled) return;
  const actionLabel = button.dataset.attachmentAction === 'open' ? 'Open' : 'Download';
  readerAttachmentStatus.textContent = `${actionLabel} is security-authorized for this evidence state, but browser attachment retrieval remains outside this development slice.`;
});

searchInput.addEventListener('input', () => renderCurrentMailboxSearch());

composeButton.addEventListener('click', () => openCompose());

replyButton.addEventListener('click', () => {
  if (!selectedMessage) return;
  const context = buildReplyCompose(selectedMessage, formatDate(selectedMessage.receivedAt));
  openCompose({
    eyebrow: 'Reply',
    title: `Reply to ${selectedMessage.sender}`,
    ...context,
    status: 'Plain-text reply context prepared locally. Original attachments are not copied automatically.',
    focus: 'body',
  });
});

forwardButton.addEventListener('click', () => {
  if (!selectedMessage) return;
  const context = buildForwardCompose(selectedMessage, formatDate(selectedMessage.receivedAt));
  openCompose({
    eyebrow: 'Forward',
    title: 'Forward message',
    ...context,
    status: 'Forward context prepared locally. Original attachments are not copied automatically.',
    focus: 'to',
  });
});

exportMessageButton.addEventListener('click', () => {
  if (!selectedMessage) return;

  try {
    const payload = formatMessagePlainText(selectedMessage);
    const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const download = document.createElement('a');
    download.href = url;
    download.download = messagePlainTextFilename(selectedMessage);
    download.hidden = true;
    document.body.append(download);
    download.click();
    download.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    providerStatus.textContent = `${runtime.label} · message exported locally`;
  } catch (error) {
    providerStatus.textContent = `${runtime.label} · local message export failed`;
    console.error('Unable to export the selected GoreeCloud Mail message locally.', error);
  }
});

moveButton.addEventListener('click', () => {
  void runSelectedMessageMove();
});

archiveButton.addEventListener('click', () => {
  void runSelectedMessageMutation({ operation: 'archive', successLabel: 'message archived' });
});

deleteButton.addEventListener('click', () => {
  if (!selectedMessage) return;
  const confirmed = window.confirm(
    'Delete this message through the configured provider? The provider determines whether this means Trash or permanent deletion.',
  );
  if (!confirmed) return;
  void runSelectedMessageMutation({ operation: 'remove', successLabel: 'message deleted' });
});

composeAttachments.addEventListener('change', async () => {
  composeStatus.textContent = '';
  const files = Array.from(composeAttachments.files ?? []);
  try {
    const materialized = await materializeComposeAttachments(files);
    renderComposeAttachmentPreview(files, materialized);
    if (materialized.length > 0) {
      composeStatus.textContent = runtime?.canSendAttachments
        ? `${materialized.length} attachment${materialized.length === 1 ? '' : 's'} validated locally. The authenticated gateway remains responsible for authoritative Wardveil acceptance before provider write.`
        : `${materialized.length} attachment${materialized.length === 1 ? '' : 's'} validated locally. Demo mode never transmits attachment bytes.`;
    }
  } catch (error) {
    clearComposeAttachmentPreview();
    composeAttachments.value = '';
    composeStatus.textContent = error instanceof Error ? error.message : 'The selected attachments could not be validated.';
  }
});

composeForm.addEventListener('submit', async (event) => {
  const operation = event.submitter?.value;
  if (operation !== 'send' && operation !== 'draft') return;

  event.preventDefault();
  if (!runtime || !provider) {
    composeStatus.textContent = 'Mail provider runtime is unavailable.';
    return;
  }
  if (selectedComposeAttachments.length > 0 && !runtime.canSendAttachments) {
    composeStatus.textContent = operation === 'draft'
      ? 'Attachment draft saving is blocked in demo mode. Attachment bytes remain local.'
      : 'Attachment sending is blocked in demo mode. Attachment bytes remain local.';
    return;
  }

  const formData = new FormData(composeForm);
  const cc = optionalComposeField(formData, 'cc');
  const bcc = optionalComposeField(formData, 'bcc');
  const payload = {
    to: formData.get('to'),
    ...(cc ? { cc } : {}),
    ...(bcc ? { bcc } : {}),
    subject: formData.get('subject'),
    body: formData.get('body'),
    ...(selectedComposeAttachments.length > 0 ? { attachments: selectedComposeAttachments } : {}),
  };

  try {
    if (operation === 'draft') {
      await provider.createDraft(payload);
      composeStatus.textContent = runtime.mode === 'gateway'
        ? 'Draft accepted by the authenticated gateway path.'
        : 'Demo draft saved locally.';
    } else {
      await provider.send(payload);
      composeStatus.textContent = runtime.mode === 'gateway'
        ? 'Message accepted by the authenticated gateway path.'
        : 'Demo send completed locally.';
    }
    composeForm.reset();
    clearComposeAttachmentPreview();
    setTimeout(() => composeDialog.close(), 500);
  } catch (error) {
    composeStatus.textContent = error instanceof Error
      ? error.message
      : operation === 'draft'
        ? 'The draft could not be saved.'
        : 'The message could not be sent.';
  }
});

flagButton.addEventListener('click', async () => {
  if (!selectedMessageId || !provider || !providerCapabilities[MAIL_PROVIDER_CAPABILITY.FLAGS]) return;
  const current = messages.find((message) => message.id === selectedMessageId);
  if (!current) return;

  const nextFlagged = !current.flagged;
  await provider.flag(selectedMessageId, nextFlagged);
  current.flagged = nextFlagged;
  flagButton.textContent = nextFlagged ? '★' : '☆';
  flagButton.setAttribute('aria-pressed', String(nextFlagged));
  if (selectedMessage) selectedMessage.flagged = nextFlagged;

  if (selectedMailboxId === 'starred' && !nextFlagged) {
    messages = messages.filter((message) => message.id !== selectedMessageId);
    clearReader();
  }
  renderCurrentMailboxSearch();
  await refreshMailboxMetadata();
});

initialize().catch((error) => {
  console.error('Unable to initialize GoreeCloud Mail development shell.', error);
  composeButton.disabled = true;
  composeDraftButton.disabled = true;
  composeSendButton.disabled = true;
  replyButton.disabled = true;
  forwardButton.disabled = true;
  exportMessageButton.disabled = true;
  moveMailboxSelect.disabled = true;
  moveButton.disabled = true;
  archiveButton.disabled = true;
  deleteButton.disabled = true;
  flagButton.disabled = true;
  providerStatus.textContent = 'Provider unavailable';
  messageList.textContent = 'Unable to initialize the configured development mail provider.';
});