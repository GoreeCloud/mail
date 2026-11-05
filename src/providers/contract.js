// Versioned, build-time-only client provider boundary. This is NOT a plugin loader.
// The contract never accepts remote code, credentials, tokens or provider data.
export const MAIL_ADAPTER_VERSION = 1;
export const MAIL_CAPABILITIES = Object.freeze([
  'read', 'search', 'modify', 'send', 'attachmentMetadata',
  'attachmentDownload', 'providerDrafts', 'scheduleSend',
  'push', 'endToEndEncryption'
]);

const REQUIRED_METHODS = Object.freeze([
  'connect', 'connected', 'disconnect', 'getProfile', 'listMessages', 'getMessage'
]);
const OPTIONAL_METHODS = Object.freeze([
  'requestCapability', 'modifyMessage', 'sendMessage'
]);
const ALL_METHODS = new Set([...REQUIRED_METHODS, ...OPTIONAL_METHODS]);

export function defineMailAdapter({ id, displayName, transport, capabilities, methods } = {}) {
  if (typeof id !== 'string' || !/^[a-z][a-z0-9-]{1,39}$/.test(id)) {
    throw new Error('Mail adapter ID must be a static lowercase slug.');
  }
  if (typeof displayName !== 'string' || !displayName.trim() || displayName.length > 80) {
    throw new Error('Mail adapter display name is invalid.');
  }
  if (typeof transport !== 'string' || !/^[a-z][a-z0-9-]{1,39}$/.test(transport)) {
    throw new Error('Mail adapter transport identifier is invalid.');
  }
  if (!capabilities || typeof capabilities !== 'object' || Array.isArray(capabilities)) {
    throw new Error('Mail adapter capabilities must be explicit.');
  }
  for (const key of Object.keys(capabilities)) {
    if (!MAIL_CAPABILITIES.includes(key)) throw new Error('Unknown mail capability: ' + key);
  }
  for (const key of MAIL_CAPABILITIES) {
    if (!Object.hasOwn(capabilities, key) || typeof capabilities[key] !== 'boolean') {
      throw new Error('Missing boolean capability: ' + key);
    }
  }
  if (!capabilities.read) {
    throw new Error('Mail adapter v1 requires read capability.');
  }
  if (!methods || typeof methods !== 'object' || Array.isArray(methods)) {
    throw new Error('Mail adapter methods are missing.');
  }
  for (const key of Object.keys(methods)) {
    if (!ALL_METHODS.has(key)) throw new Error('Unapproved mail adapter method: ' + key);
  }
  for (const method of REQUIRED_METHODS) {
    if (!Object.hasOwn(methods, method) || typeof methods[method] !== 'function') {
      throw new Error('Missing required mail adapter method: ' + method);
    }
  }
  if ((capabilities.modify && typeof methods.modifyMessage !== 'function')
    || (capabilities.send && typeof methods.sendMessage !== 'function')
    || ((capabilities.modify || capabilities.send)
      && typeof methods.requestCapability !== 'function')) {
    throw new Error('Mail adapter claims an operation without its implementation.');
  }

  if ((!capabilities.modify && Object.hasOwn(methods, 'modifyMessage'))
    || (!capabilities.send && Object.hasOwn(methods, 'sendMessage'))) {
    throw new Error('Mail adapter exposes an operation declared unsupported.');
  }

  return Object.freeze({
    adapterVersion: MAIL_ADAPTER_VERSION,
    id, displayName, transport,
    clientOnly: true,
    capabilities: Object.freeze({ ...capabilities }),
    ...Object.fromEntries([...REQUIRED_METHODS, ...OPTIONAL_METHODS]
      .filter((key) => typeof methods[key] === 'function')
      .map((key) => [key, methods[key]]))
  });
}
