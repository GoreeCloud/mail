// Strict, intentionally limited reply preparation for the Gmail-only alpha.
// Never guess mailbox targets, RFC message IDs, or provider threading metadata.
const ADDRESS = /^[A-Za-z0-9.!#$%&'*+/=?^_~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
const MESSAGE_ID = /^<[A-Za-z0-9.!#$%&'*+/=?^_~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?>$/;
const THREAD_ID = /^[A-Za-z0-9_-]{1,256}$/;
const MAX_REFERENCES = 12;
const MAX_REPLY_REFERENCES_LENGTH = 900;
const MAX_MESSAGE_ID_LENGTH = 180;
function validId(id) {
  return typeof id === 'string' && id.length <= MAX_MESSAGE_ID_LENGTH && MESSAGE_ID.test(id);
}

function header(message, name) {
  const matches = Array.isArray(message?.headers)
    ? message.headers.filter((entry) => typeof entry?.name === 'string'
      && entry.name.toLowerCase() === name.toLowerCase())
    : [];
  if (matches.length > 1) throw new Error('Reply header is ambiguous. Start a new message instead.');
  return matches[0]?.value ?? null;
}

function targetAddress(value) {
  if (typeof value !== 'string' || value.length > 350 ||
      /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(value)) {
    throw new Error('Reply recipient is invalid or ambiguous. Start a new message instead.');
  }
  const trimmed = value.trim();
  const enclosed = /^[^<>]{0,210}<([^<>]+)>$/.exec(trimmed);
  const address = enclosed ? enclosed[1] : trimmed;
  if (!ADDRESS.test(address)) {
    throw new Error('Reply recipient is unsupported. Verify the address and start a new message.');
  }
  return address;
}

function referenceIds(value) {
  if (value === null || value === '') return [];
  if (typeof value !== 'string' || value.length > 1024) {
    throw new Error('Message reference metadata is unsupported for safe threading.');
  }
  const parts = value.trim().split(/\s+/);
  if (parts.length > MAX_REFERENCES || !parts.every(validId)) {
    throw new Error('Message reference metadata is unsupported for safe threading.');
  }
  return parts;
}

export function validateReplyContext(context, subject) {
  if (!context || typeof context !== 'object'
    || typeof context.threadId !== 'string' || !THREAD_ID.test(context.threadId)
    || !validId(context.inReplyTo)
    || !Array.isArray(context.references) || context.references.length < 1
    || context.references.length > MAX_REFERENCES
    || !context.references.every(validId)
    || context.references.join(' ').length > MAX_REPLY_REFERENCES_LENGTH
    || context.references.at(-1) !== context.inReplyTo
    || typeof context.subject !== 'string' || subject !== context.subject) {
    throw new Error('Reply threading data or subject changed. Start a new message instead.');
  }
  return {
    threadId: context.threadId,
    inReplyTo: context.inReplyTo,
    references: [...context.references],
    subject: context.subject
  };
}

export function prepareReplyDraft(message) {
  if (!message || typeof message !== 'object'
    || typeof message.threadId !== 'string' || !THREAD_ID.test(message.threadId)) {
    throw new Error('This message cannot be replied to safely with the available threading data.');
  }
  const rawId = header(message, 'Message-ID');
  if (!validId(rawId)) {
    throw new Error('The original Message-ID is missing or unsupported. Start a new message instead.');
  }
  const preferred = header(message, 'Reply-To');
  const from = preferred === null ? header(message, 'From') : preferred;
  const to = targetAddress(from);
  const originalSubject = header(message, 'Subject');
  if (typeof originalSubject !== 'string' || !originalSubject.trim()
    || originalSubject.length > 280
    || /[\u0000-\u001f\u007f]/.test(originalSubject)) {
    throw new Error('Reply subject cannot be matched safely. Start a new message instead.');
  }
  const subject = /^Re:\s/i.test(originalSubject)
    ? originalSubject : 'Re: ' + originalSubject;
  const references = referenceIds(header(message, 'References'))
    .filter((id) => id !== rawId);
  references.push(rawId);
  // Cap safely without forging missing ancestors; the original parent remains last.
  const retained = references.slice(-MAX_REFERENCES);
  const reply = validateReplyContext({
    threadId: message.threadId, inReplyTo: rawId,
    references: retained, subject
  }, subject);
  return { to, subject, body: '', reply };
}
