// Read-only provider header summaries, not authenticated security verdicts.
export const MAX_VISIBLE_HEADERS = 48;
const MAX_VALUE_CHARS = 1024;
const MAX_INPUT_CHARS = 8192;

function safeValue(input) {
  const source = typeof input === 'string' ? input : '';
  const limited = source.slice(0, MAX_INPUT_CHARS);
  const cleaned = limited
    .replace(/\r\n[ \t]+/g, ' ')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, '�');
  const points = Array.from(cleaned);
  return { value: points.slice(0, MAX_VALUE_CHARS).join(''),
    truncated: source.length > MAX_INPUT_CHARS || points.length > MAX_VALUE_CHARS };
}

export function summarizeMessageHeaders(headers) {
  if (!Array.isArray(headers)) return { items: [], truncated: false };
  const items = [];
  let truncated = headers.length > MAX_VISIBLE_HEADERS;
  for (let index = 0; index < Math.min(headers.length, MAX_VISIBLE_HEADERS); index++) {
    const entry = headers[index];
    if (!entry || typeof entry !== 'object') continue;
    if (typeof entry.name !== 'string' || !/^[A-Za-z0-9-]{1,64}$/.test(entry.name)) {
      truncated = true;
      continue;
    }
    const value = safeValue(entry.value);
    if (value.truncated) truncated = true;
    items.push({ name: entry.name, value: value.value });
  }
  return { items, truncated };
}
