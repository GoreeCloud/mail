import { ProviderError, PROVIDER_ERROR_CODES } from './providers/provider-error.js';

export const REQUIRED_MAIL_PROVIDER_METHODS = Object.freeze([
  'authenticate',
  'listMailboxes',
  'listMessages',
  'getMessage',
  'search',
  'send',
  'createDraft',
  'updateDraft',
  'move',
  'archive',
  'remove',
  'flag',
  'setReadState',
  'sync',
  'capabilities',
]);

export const MAIL_PROVIDER_CAPABILITY = Object.freeze({
  MAILBOX_ACCESS: 'mailboxAccess',
  MESSAGE_READ: 'messageRead',
  ATTACHMENT_RETRIEVAL: 'attachmentRetrieval',
  ARCHIVE: 'archive',
  DRAFTS: 'drafts',
  FLAGS: 'flags',
  FOLDERS: 'folders',
  LABELS: 'labels',
  SEARCH: 'search',
  SEND: 'send',
  THREADS: 'threads',
  MOVE: 'move',
  DELETE: 'delete',
  READ_STATE: 'readState',
  SPAM: 'spam',
  TRASH_RECOVERY: 'trashRecovery',
  SERVER_SIDE_SEARCH: 'serverSideSearch',
  INCREMENTAL_SYNC: 'incrementalSync',
  PUSH_SYNC: 'pushSync',
  STORAGE_QUOTA: 'storageQuota',
  SCHEDULED_SEND: 'scheduledSend',
  UNDO_SEND: 'undoSend',
  DELIVERY_RECEIPTS: 'deliveryReceipts',
  READ_RECEIPTS: 'readReceipts',
  SENDER_IDENTITIES: 'senderIdentities',
  ALIASES: 'aliases',
  CUSTOM_DOMAINS: 'customDomains',
  DISTRIBUTION_LISTS: 'distributionLists',
  PROVIDER_RULES: 'providerRules',
  RETENTION_CONTROLS: 'retentionControls',
  ORGANIZATION_POLICIES: 'organizationPolicies',
});

export const MAIL_PROVIDER_CAPABILITY_NAMES = Object.freeze(
  Object.values(MAIL_PROVIDER_CAPABILITY),
);

const KNOWN_MAIL_PROVIDER_CAPABILITIES = new Set(MAIL_PROVIDER_CAPABILITY_NAMES);

export class ProviderCapabilityUnavailableError extends ProviderError {
  constructor({ capability, accountId = null }) {
    const accountLabel = accountId ? ` for account ${accountId}` : '';
    super(`Mail provider capability ${capability} is unavailable${accountLabel}.`, {
      code: PROVIDER_ERROR_CODES.CAPABILITY_UNAVAILABLE,
      status: 400,
      retryable: false,
    });
    this.name = 'ProviderCapabilityUnavailableError';
    this.capability = capability;
    this.accountId = accountId;
  }
}

export function validateMailProvider(provider) {
  if (!provider || typeof provider !== 'object') {
    throw new TypeError('Mail provider must be an object.');
  }

  const missing = REQUIRED_MAIL_PROVIDER_METHODS.filter(
    (method) => typeof provider[method] !== 'function',
  );

  if (missing.length > 0) {
    throw new Error(`Mail provider is missing required methods: ${missing.join(', ')}`);
  }

  return provider;
}

export function normalizeCapabilities(capabilities = {}) {
  const source = capabilities && typeof capabilities === 'object' ? capabilities : {};
  return Object.freeze(
    Object.fromEntries(
      MAIL_PROVIDER_CAPABILITY_NAMES.map((capability) => [capability, Boolean(source[capability])]),
    ),
  );
}

export function supportsMailProviderCapability(capabilities, capability) {
  assertKnownMailProviderCapability(capability);
  return normalizeCapabilities(capabilities)[capability];
}

export function requireMailProviderCapability({ capabilities, capability, accountId = null }) {
  if (!supportsMailProviderCapability(capabilities, capability)) {
    throw new ProviderCapabilityUnavailableError({ capability, accountId });
  }
  return true;
}

function assertKnownMailProviderCapability(capability) {
  if (!KNOWN_MAIL_PROVIDER_CAPABILITIES.has(capability)) {
    throw new TypeError(`Unknown Mail provider capability: ${String(capability)}`);
  }
}
