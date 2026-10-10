/**
 * Check the author's visible message text for language that implies an attachment.
 * Callers remove quoted replies and signature blocks before invoking this helper.
 *
 * Never inspect HTML attributes, comments, scripts, styles, or link destinations:
 * those may contain the word "attachment" without the sender mentioning a file.
 */
export function mentionsAttachment(text: string): boolean {
  if (!text) {
    return false;
  }

  const visibleText = text
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<(?:"[^"]*"|'[^']*'|[^'">])*>/g, ' ')
    .replace(/\b(?:https?:\/\/|www\.)[^\s<]+/gi, ' ');

  return /\b(?:attach(?:ment|ments|ed|ing)?|enclos(?:ed|ure))\b/i.test(visibleText);
}
