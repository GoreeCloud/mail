import { EventedIFrame } from '../../src/components/evented-iframe';

describe('EventedIFrame untrusted message links', () => {
  const iframe = new EventedIFrame({});

  it('preserves reviewed web, email, telephone and relative destinations', () => {
    [
      'https://example.test/path',
      'http://example.test',
      'mailto:help@example.test',
      'tel:+15551234567',
      '//example.test/path',
      'www.example.test',
    ].forEach(href => expect(iframe._isBlacklistedHref(href)).toBe(false));
  });

  it('denies active-content and privileged URI schemes', () => {
    [
      'file:///etc/passwd',
      'javascript:alert(1)',
      'data:text/html,payload',
      'blob:https://example.test',
      'filesystem:https://example.test',
      'chrome://settings',
      'about:blank',
      'custom-scheme:unsafe',
    ].forEach(href => expect(iframe._isBlacklistedHref(href)).toBe(true));
  });

  it('denies whitespace, control-character and empty link obfuscation', () => {
    [
      '',
      ' javascript:alert(1)',
      'https://example.test ',
      'java\tscript:alert(1)',
      'http://example.test\nother',
    ].forEach(href => expect(iframe._isBlacklistedHref(href)).toBe(true));
  });
});
