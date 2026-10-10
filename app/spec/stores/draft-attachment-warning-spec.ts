import { mentionsAttachment } from '../../src/flux/stores/draft-attachment-warning';

describe('Draft attachment reminders', () => {
  it('recognizes an explicit mention of an attachment', () => {
    expect(mentionsAttachment('Please see the attachment.')).toBe(true);
    expect(mentionsAttachment("I've attached the report.")).toBe(true);
    expect(mentionsAttachment('Attaching the invoice here.')).toBe(true);
    expect(mentionsAttachment('The documents are enclosed.')).toBe(true);
  });

  it('recognizes messages containing rich-text markup', () => {
    expect(mentionsAttachment('<p>Please <strong>attach</strong> the file.</p>')).toBe(true);
    expect(mentionsAttachment('<a href="https://example.test">See the attached file</a>')).toBe(
      true
    );
  });

  it('does not misinterpret a link destination or image attribute', () => {
    expect(mentionsAttachment('<a href="https://example.test/attachments">Open portal</a>')).toBe(
      false
    );
    expect(mentionsAttachment('<img alt="attached-image" src="cid:logo">Hello')).toBe(false);
    expect(mentionsAttachment('Visit https://example.test/attachments for details.')).toBe(false);
    expect(mentionsAttachment('Visit www.example.test/attach for details.')).toBe(false);
  });

  it('ignores markup comments and non-visible style or script text', () => {
    expect(mentionsAttachment('<!-- attachment -->Message text')).toBe(false);
    expect(mentionsAttachment('<style>.attachment { color: red; }</style>Hello')).toBe(false);
    expect(mentionsAttachment('<script>const attachment = true;</script>Hello')).toBe(false);
  });

  it('does not trigger on unrelated words or empty drafts', () => {
    expect(mentionsAttachment('We should detach the equipment.')).toBe(false);
    expect(mentionsAttachment('Please review the agenda.')).toBe(false);
    expect(mentionsAttachment('')).toBe(false);
  });
});
