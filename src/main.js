import { connectGoogle, connected, disconnect, requestCapability } from './auth.js';
import { getProfile, listMessages, getMessage, modifyMessage, sendMessage } from './gmail.js';

const $ = (id) => document.getElementById(id);
const state = {
  view: 'INBOX', messages: [], active: null, email: '', busy: false, sequence: 0,
  readerSequence: 0, listController: null, readerController: null,
  nextPageToken: '', loading: false
};
const titles = { INBOX: 'Inbox', STARRED: 'Starred', SENT: 'Sent', ALL: 'All mail' };
const KEY = 'goreecloud-mail-public-oauth-client-id';
let configuredClientId = '';
const panel = $('message-list');

function announce(message, error = false) {
  $('notice').textContent = message;
  $('notice').dataset.error = String(error);
  $('alert').textContent = error ? message : '';
}
function prettyDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '' : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}
function shortSender(value) {
  return value.replace(/<[^>]+>/g, '').replace(/^"|"$/g, '').trim() || value;
}
function clearReader() {
  state.readerSequence++;
  state.readerController?.abort();
  state.readerController = null;
  state.active = null;
  for (const id of ['reader-subject', 'reader-from', 'reader-date', 'reader-body', 'reader-avatar']) $(id).textContent = '';
  $('reader').hidden = true;
  $('reader-empty').hidden = false;
  document.body.classList.remove('reading');
}
function renderList() {
  panel.replaceChildren();
  $('list-empty').hidden = state.messages.length > 0;
  $('list-empty').querySelector('strong').textContent = state.loading ? 'Loading messages…' : connected() ? 'All clear here.' : 'Your mail, your space.';
  $('list-empty').querySelector('span').textContent = state.loading
    ? 'Retrieving messages from your email provider.'
    : connected() ? 'No messages in this view.' : 'Connect an account to view messages securely.';
  $('load-more').hidden = !connected() || !state.nextPageToken;
  $('load-more').disabled = state.loading;
  $('list-meta').textContent = state.messages.length + ' shown';
  $('inbox-count').textContent = state.view === 'INBOX' ? String(state.messages.filter((m) => m.labels.includes('UNREAD')).length) : '';
  for (const message of state.messages) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'message-card';
    if (message.labels.includes('UNREAD')) button.classList.add('is-unread');
    if (state.active?.id === message.id) button.classList.add('is-active');
    button.setAttribute('aria-label', 'Read ' + message.subject + ' from ' + shortSender(message.from));
    button.addEventListener('click', () => showMessage(message.id));
    const heading = document.createElement('span'); heading.className = 'message-top';
    const sender = document.createElement('strong'); sender.textContent = shortSender(message.from);
    const date = document.createElement('time'); date.textContent = prettyDate(message.date);
    heading.append(sender, date);
    const subject = document.createElement('span'); subject.className = 'message-subject'; subject.textContent = message.subject;
    const preview = document.createElement('span'); preview.className = 'message-preview'; preview.textContent = message.snippet || 'No preview available';
    const indicator = document.createElement('span'); indicator.className = 'message-marker';
    indicator.textContent = message.labels.includes('STARRED') ? '★ Starred' : (message.labels.includes('UNREAD') ? '● Unread' : 'Email');
    button.append(heading, subject, preview, indicator);
    item.append(button); panel.append(item);
  }
}
async function loadMailbox({ append = false } = {}) {
  if (!connected()) { announce('Connect to Google to view messages.'); return; }
  if (append && (!state.nextPageToken || state.loading)) return;
  const sequence = ++state.sequence;
  state.listController?.abort();
  const controller = new AbortController();
  state.listController = controller;
  const pageToken = append ? state.nextPageToken : '';
  if (!append) {
    state.messages = [];
    state.nextPageToken = '';
    clearReader();
  }
  state.loading = true;
  $('refresh').disabled = true;
  renderList();
  announce(append ? 'Loading more messages…' : 'Syncing selected messages…');
  try {
    const page = await listMessages(state.view, $('search').value, pageToken, { signal: controller.signal });
    if (controller.signal.aborted || sequence !== state.sequence || !connected()) return;
    const existingIds = new Set(state.messages.map((message) => message.id));
    const fresh = page.messages.filter((message) => !existingIds.has(message.id));
    state.messages = append ? [...state.messages, ...fresh] : page.messages;
    state.nextPageToken = page.nextPageToken;
    const failures = page.failedCount
      ? ' ' + page.failedCount + ' message previews failed; retry to recover them.' : '';
    announce(state.email + ' · ' + state.messages.length + ' messages loaded.' + failures, page.failedCount > 0);
  } catch (error) {
    if (sequence === state.sequence && error.name !== 'AbortError') announce(error.message, true);
  } finally {
    if (sequence === state.sequence) {
      state.loading = false;
      state.listController = null;
      $('refresh').disabled = false;
      renderList();
    }
  }
}
async function showMessage(id) {
  if (!connected()) return;
  const listSequence = state.sequence;
  const readSequence = ++state.readerSequence;
  state.readerController?.abort();
  const controller = new AbortController();
  state.readerController = controller;
  const isCurrent = () => !controller.signal.aborted && connected()
    && listSequence === state.sequence && readSequence === state.readerSequence;
  announce('Opening message…');
  try {
    const data = await getMessage(id, { signal: controller.signal });
    if (!isCurrent()) return;
    state.active = data;
    $('reader-subject').textContent = data.subject;
    $('reader-from').textContent = data.from;
    $('reader-avatar').textContent = shortSender(data.from).slice(0, 1).toUpperCase();
    $('reader-date').textContent = data.date || 'Date unavailable';
    $('reader-body').textContent = data.body || '[Plain-text body unavailable; this alpha does not display HTML.]';
    $('reader').hidden = false; $('reader-empty').hidden = true;
    document.body.classList.add('reading');
    updateActions(); renderList();
    if (isCurrent()) announce('Message opened. Use Mark read to update Gmail.');
  } catch (error) {
    if (isCurrent() && error.name !== 'AbortError') announce(error.message, true);
  } finally {
    if (readSequence === state.readerSequence) state.readerController = null;
  }
}
function updateActions() {
  if (!state.active) return;
  $('star').textContent = state.active.labels.includes('STARRED') ? '★ Unstar' : '☆ Star';
  $('unread').textContent = state.active.labels.includes('UNREAD') ? 'Mark read' : 'Mark unread';
}
function resetSession(message) {
  disconnect();
  state.messages = [];
  state.email = '';
  state.sequence++;
  state.listController?.abort();
  state.nextPageToken = '';
  state.loading = false;
  $('compose-form').reset();
  $('search').value = '';
  if ($('composer-dialog').open) $('composer-dialog').close();
  clearReader();
  renderList();
  reflectConnection();
  announce(message);
}
async function confirmAuthorizedAccount(expectedEmail) {
  const profile = await getProfile();
  if (!connected() || !profile.emailAddress || profile.emailAddress.toLowerCase() !== expectedEmail.toLowerCase()) {
    resetSession('Google authorization changed accounts. Disconnected to protect the original mailbox.');
    throw new Error('Google authorization returned a different account; reconnect intentionally.');
  }
}
async function actOnMessage(kind) {
  if (!state.active || state.busy) return;
  state.busy = true;
  const old = state.active;
  const listSequence = state.sequence;
  const readSequence = state.readerSequence;
  const expectedEmail = state.email;
  try {
    await requestCapability('modify');
    if (!connected() || listSequence !== state.sequence || readSequence !== state.readerSequence) return;
    await confirmAuthorizedAccount(expectedEmail);
    if (!connected() || listSequence !== state.sequence || readSequence !== state.readerSequence) return;
    let addLabelIds = [], removeLabelIds = [];
    if (kind === 'star') (old.labels.includes('STARRED') ? removeLabelIds : addLabelIds).push('STARRED');
    if (kind === 'unread') (old.labels.includes('UNREAD') ? removeLabelIds : addLabelIds).push('UNREAD');
    if (kind === 'archive') removeLabelIds.push('INBOX');
    await modifyMessage(old.id, { addLabelIds, removeLabelIds });
    if (!connected() || listSequence !== state.sequence
        || readSequence !== state.readerSequence || state.active?.id !== old.id) return;
    state.active.labels = [...state.active.labels.filter((label) => !removeLabelIds.includes(label)), ...addLabelIds];
    const listed = state.messages.find((message) => message.id === old.id);
    if (listed) listed.labels = state.active.labels;
    if (kind === 'archive' && state.view === 'INBOX') {
      state.messages = state.messages.filter((message) => message.id !== old.id);
      clearReader();
    }
    updateActions(); renderList(); announce(kind === 'archive' ? 'Archived with Gmail.' : 'Message updated in Gmail.');
  } catch (error) { announce(error.message, true); }
  finally { state.busy = false; }
}
function reflectConnection() {
  $('connect').hidden = connected();
  $('disconnect').hidden = !connected();
  $('compose').disabled = !connected();
  $('compose-account').textContent = connected() ? 'Sending from ' + state.email + '. Google will request send permission when needed.' : 'Connect an account before composing.';
}
function openSettings() {
  try { $('client-id').value = configuredClientId || localStorage.getItem(KEY) || ''; } catch { $('client-id').value = configuredClientId; }
  $('settings-dialog').showModal();
}
function saveSettings(event) {
  event.preventDefault();
  const value = $('client-id').value.trim();
  if (!/^[a-zA-Z0-9.-]+\.apps\.googleusercontent\.com$/.test(value)) { $('client-id').setCustomValidity('Enter a Google OAuth Web client ID.'); $('client-id').reportValidity(); return; }
  $('client-id').setCustomValidity('');
  configuredClientId = value;
  try { localStorage.setItem(KEY, value); } catch { /* use this browser session only */ }
  $('settings-dialog').close(); announce('OAuth client ID configured. Connect to authorize Gmail.');
}
async function connect() {
  let clientId = configuredClientId;
  if (!clientId) try { clientId = localStorage.getItem(KEY) || ''; } catch { /* private browsing */ }
  if (!clientId) { openSettings(); return; }
  $('connect').disabled = true;
  announce('Opening Google consent…');
  try {
    await connectGoogle(clientId);
    const profile = await getProfile();
    state.email = profile.emailAddress || 'Gmail account';
    reflectConnection();
    await loadMailbox();
  } catch (error) { announce(error.message, true); }
  finally { $('connect').disabled = false; }
}
function openCompose() {
  if (!connected()) return;
  $('composer-dialog').showModal(); $('to').focus();
}
async function submitCompose(event) {
  event.preventDefault();
  if (state.busy) return;
  state.busy = true; $('send').disabled = true;
  const input = { to: $('to').value, subject: $('subject').value, body: $('body').value };
  announce('Submitting message to Gmail…');
  try {
    const expectedEmail = state.email;
    const listSequence = state.sequence;
    await requestCapability('send');
    if (!connected() || listSequence !== state.sequence) return;
    await confirmAuthorizedAccount(expectedEmail);
    if (!connected() || listSequence !== state.sequence) return;
    await sendMessage(input);
    if (!connected() || listSequence !== state.sequence) return;
    $('composer-dialog').close(); $('compose-form').reset();
    announce('Gmail accepted your message for sending.');
    if (state.view === 'SENT') await loadMailbox();
  } catch (error) { announce(error.message, true); }
  finally { state.busy = false; $('send').disabled = false; }
}

document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
  state.view = button.dataset.view;
  document.querySelectorAll('[data-view]').forEach((other) => {
    if (other === button) other.setAttribute('aria-current', 'page'); else other.removeAttribute('aria-current');
  });
  $('view-title').textContent = titles[state.view];
  $('list-subtitle').textContent = titles[state.view] + ' messages';
  loadMailbox();
}));
$('refresh').addEventListener('click', () => loadMailbox());
$('load-more').addEventListener('click', () => loadMailbox({ append: true }));
$('connect').addEventListener('click', connect);
$('disconnect').addEventListener('click', () => resetSession('Disconnected; local in-memory mail and tokens cleared. Google grants remain managed in your Google Account.'));
$('settings').addEventListener('click', openSettings);
$('settings-form').addEventListener('submit', saveSettings);
$('close-settings').addEventListener('click', () => $('settings-dialog').close());
$('client-id').addEventListener('input', () => $('client-id').setCustomValidity(''));
$('clear-config').addEventListener('click', () => {
  configuredClientId = '';
  try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
  $('client-id').value = ''; announce('Saved public client ID cleared.');
});
$('theme').addEventListener('click', () => {
  document.documentElement.dataset.mode = document.documentElement.dataset.mode === 'dark' ? 'light' : 'dark';
});
$('compose').addEventListener('click', openCompose);
$('compose-form').addEventListener('submit', submitCompose);
$('close-compose').addEventListener('click', () => {
  if (!$('body').value || window.confirm('Discard this unsaved message?')) {
    $('composer-dialog').close(); $('compose-form').reset();
  }
});
$('star').addEventListener('click', () => actOnMessage('star'));
$('unread').addEventListener('click', () => actOnMessage('unread'));
$('archive').addEventListener('click', () => actOnMessage('archive'));
$('back').addEventListener('click', clearReader);
let timer;
$('search').addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(() => loadMailbox(), 400);
});
document.addEventListener('keydown', (event) => {
  const target = event.target;
  const typing = target instanceof HTMLElement && (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable);
  const modal = document.querySelector('dialog[open]');
  if (!typing && !modal && event.key === '/') { event.preventDefault(); $('search').focus(); }
  if (!typing && !modal && event.key.toLowerCase() === 'c' && connected()) { event.preventDefault(); openCompose(); }
});
reflectConnection(); renderList();
