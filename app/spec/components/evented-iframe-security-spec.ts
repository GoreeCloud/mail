import { EventedIFrame } from '../../src/components/evented-iframe';

describe('Message link protocol policy', () => {
  const frame = new EventedIFrame({});

  it('permits common navigation destinations', () => {
    for (const href of ['https://example.test', 'http://example.test', 'mailto:a@example.test', 'tel:5551234', '//example.test', 'example.test']) {
      expect(frame._isBlacklistedHref(href)).toBe(false);
    }
  });

  it('rejects unapproved explicit schemes', () => {
    for (const href of ['custom:example', 'about:blank', 'data:text/plain,sample', 'file:///sample']) {
      expect(frame._isBlacklistedHref(href)).toBe(true);
    }
  });

  it('rejects invalid or padded destinations', () => {
    for (const href of ['', ' https://example.test', 'https://example.test ', 'http://example.test\nnext']) {
      expect(frame._isBlacklistedHref(href)).toBe(true);
    }
  });
});
