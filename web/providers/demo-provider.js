import { normalizeCapabilities } from '../mail-provider.js';

const initialDemoMessages = [
  {
    id: 'welcome-1',
    sender: 'GoreeCloud Mail',
    address: 'mail@goreecloud.local',
    subject: 'Welcome to the GoreeCloud Mail foundation',
    preview: 'The first provider-independent client shell is ready for development.',
    body: 'This local demonstration message verifies the initial mailbox shell without connecting to a real provider.',
    receivedAt: '2026-08-20T21:30:00-05:00',
    unread: true,
    flagged: false,
    attachments: [],
  },
  {
    id: 'security-1',
    sender: 'Wardveil Security',
    address: 'wardveil@goreecloud.local',
    subject: 'Remote content is protected',
    preview: 'External resources remain blocked in this development foundation.',
    body: 'Production message rendering will treat HTML, remote images, links, and attachments as untrusted input.',
    receivedAt: '2026-08-20T21:20:00-05:00',
    unread: false,
    flagged: true,
    attachments: [
      {
        id: 'demo-clean',
        filename: 'security-summary.pdf',
        size: 184320,
        securityDecision: {
          disposition: 'allow',
          can_open: true,
          can_download: true,
          quarantine_required: false,
          evidence_refs: ['wardveil:demo:security-summary'],
          reason_codes: ['wardveil_scan_clean_current'],
        },
      },
      {
        id: 'demo-review',
        filename: 'unverified-archive.zip',
        size: 92160,
        securityDecision: {
          disposition: 'hold_review',
          can_open: false,
          can_download: false,
          quarantine_required: false,
          evidence_refs: ['wardveil:demo:review-required'],
          reason_codes: ['wardveil_scan_suspicious_current'],
        },
      },
    ],
  },
];

const DEMO_MAILBOXES = Object.freeze([
  ['inbox', 'Inbox'],
  ['starred', 'Starred'],
  ['sent', 'Sent'],
  ['drafts', 'Drafts'],
  ['archive', 'Archive'],
  ['trash', 'Trash'],
]);

export class DemoMailProvider {
  constructor() {
    this.messages = structuredClone(initialDemoMessages);
    this.mailboxByMessageId = new Map(this.messages.map((message) => [message.id, 'inbox']));
  }

  async authenticate() {
    return { authenticated: true, account: 'demo@goreecloud.local' };
  }

  async listMailboxes() {
    return DEMO_MAILBOXES.map(([id, name]) => ({
      id,
      name,
      unread: this.messagesForMailbox(id).filter((message) => message.unread).length,
    }));
  }

  messagesForMailbox(mailboxId = 'inbox') {
    const normalizedMailbox = String(mailboxId ?? '').trim().toLowerCase();
    if (normalizedMailbox === 'starred') {
      return this.messages.filter((message) =>
        message.flagged && this.mailboxByMessageId.get(message.id) !== 'trash',
      );
    }
    if (!DEMO_MAILBOXES.some(([id]) => id === normalizedMailbox)) return [];
    if (normalizedMailbox === 'sent' || normalizedMailbox === 'drafts') return [];
    return this.messages.filter((message) => this.mailboxByMessageId.get(message.id) === normalizedMailbox);
  }

  async listMessages(mailboxId = 'inbox') {
    return structuredClone(this.messagesForMailbox(mailboxId));
  }

  async getMessage(id) {
    return structuredClone(this.messages.find((message) => message.id === id) ?? null);
  }

  async search(query) {
    const normalizedQuery = query.trim().toLowerCase();
    return structuredClone(
      this.messages.filter((message) =>
        `${message.sender} ${message.address} ${message.subject} ${message.preview} ${message.body}`
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    );
  }

  async send(message) {
    return { id: crypto.randomUUID(), status: 'demo-sent', message };
  }

  async createDraft(message) {
    return { id: crypto.randomUUID(), status: 'demo-draft', message };
  }

  async updateDraft(id, message) {
    return { id, status: 'demo-draft', message };
  }

  async move(id, mailboxId) {
    const normalizedMailbox = String(mailboxId ?? '').trim().toLowerCase();
    if (this.mailboxByMessageId.has(id) && DEMO_MAILBOXES.some(([candidate]) => candidate === normalizedMailbox)) {
      this.mailboxByMessageId.set(id, normalizedMailbox);
    }
    return { id, mailboxId: normalizedMailbox };
  }

  async archive(id) {
    if (this.mailboxByMessageId.has(id)) this.mailboxByMessageId.set(id, 'archive');
    return { id, archived: true };
  }

  async remove(id) {
    if (this.mailboxByMessageId.has(id)) this.mailboxByMessageId.set(id, 'trash');
    return { id, removed: true };
  }

  async flag(id, flagged = true) {
    const message = this.messages.find((candidate) => candidate.id === id);
    if (message) message.flagged = Boolean(flagged);
    return { id, flagged: Boolean(flagged) };
  }

  async setReadState(id, read = true) {
    const message = this.messages.find((candidate) => candidate.id === id);
    if (message) message.unread = !Boolean(read);
    return { id, read: Boolean(read) };
  }

  async sync() {
    return { synchronized: true, mode: 'demo' };
  }

  async capabilities() {
    return normalizeCapabilities({
      mailboxAccess: true,
      messageRead: true,
      attachmentRetrieval: false,
      archive: true,
      drafts: true,
      flags: true,
      folders: true,
      labels: false,
      search: true,
      send: true,
      threads: false,
      move: true,
      delete: true,
      readState: true,
      spam: false,
      trashRecovery: false,
      serverSideSearch: false,
      incrementalSync: false,
      pushSync: false,
      storageQuota: false,
      scheduledSend: false,
      undoSend: false,
      deliveryReceipts: false,
      readReceipts: false,
      senderIdentities: false,
      aliases: false,
      customDomains: false,
      distributionLists: false,
      providerRules: false,
      retentionControls: false,
      organizationPolicies: false,
    });
  }
}
