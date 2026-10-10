import { hasUnsafeExternalLinkCharacters } from '../src/window-event-handler';

describe('GoreeCloud Mail external link input validation', () => {
  it('accepts ordinary web, email, telephone and internal protocol destinations', () => {
    for (const href of [
      'https://example.test/path?key=value',
      'http://example.test',
      'mailto:support@example.test',
      'tel:+15551234567',
      'mailspring://open-settings',
      'example.test/path',
    ]) {
      expect(hasUnsafeExternalLinkCharacters(href)).toBe(false);
    }
  });

  it('rejects empty, padded or newline-injected link destinations', () => {
    for (const href of [
      '',
      ' ',
      ' https://example.test',
      'https://example.test ',
      'https://example.test\nnext',
      'mailto:help@example.test\rmore',
    ]) {
      expect(hasUnsafeExternalLinkCharacters(href)).toBe(true);
    }
  });

  it('rejects embedded ASCII control characters without changing valid escapes', () => {
    expect(hasUnsafeExternalLinkCharacters('http://example.test\tmore')).toBe(true);
    expect(hasUnsafeExternalLinkCharacters('https://example.test/%20space')).toBe(false);
  });
});
