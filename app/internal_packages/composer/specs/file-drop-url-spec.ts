import { fileURLToPath } from 'url';
import { localFilePathFromDropUri, localFilePathFromUriList } from '../lib/file-drop-url';

describe('Composer local file drag URLs', () => {
  it('decodes local file URLs with spaces and escaped filename characters', () => {
    const url = 'file:///tmp/mail%20attachment%23one.png';
    expect(localFilePathFromDropUri(url)).toEqual(fileURLToPath(new URL(url)));
  });

  it('accepts localhost but rejects remote file shares and web addresses', () => {
    expect(localFilePathFromDropUri('file://localhost/tmp/report.pdf')).toEqual(
      fileURLToPath(new URL('file:///tmp/report.pdf'))
    );
    expect(localFilePathFromDropUri('file://LOCALHOST/tmp/report.pdf')).toEqual(
      fileURLToPath(new URL('file:///tmp/report.pdf'))
    );
    expect(localFilePathFromDropUri('file://server.example/tmp/report.pdf')).toBe(null);
    expect(localFilePathFromDropUri('https://example.com/report.pdf')).toBe(null);
  });

  it('rejects invalid escapes, fragments, queries and mixed-origin text', () => {
    expect(localFilePathFromDropUri('file:///tmp/bad%ZZ.png')).toBe(null);
    expect(localFilePathFromDropUri('file:///tmp/zero%00byte.png')).toBe(null);
    expect(localFilePathFromDropUri('file:///tmp/report.pdf?source=mail')).toBe(null);
    expect(localFilePathFromDropUri('file:///tmp/report.pdf#part')).toBe(null);
    expect(localFilePathFromDropUri('prefix file:///tmp/report.pdf')).toBe(null);
    expect(localFilePathFromDropUri('file:///tmp/report.pdf\nfile:///tmp/secret')).toBe(null);
  });

  it('reads the first actual URL from a text/uri-list comment block', () => {
    const url = 'file:///tmp/report%20one.pdf';
    expect(localFilePathFromUriList('# Dragged attachment\r\n\r\n' + url + '\r\n')).toEqual(
      fileURLToPath(new URL(url))
    );
  });

  it('does not skip a rejected first URL to silently attach a later local file', () => {
    expect(
      localFilePathFromUriList('https://example.invalid/report\r\nfile:///tmp/private.pdf')
    ).toBe(null);
    expect(localFilePathFromUriList('# Comments only\r\n')).toBe(null);
  });
});
