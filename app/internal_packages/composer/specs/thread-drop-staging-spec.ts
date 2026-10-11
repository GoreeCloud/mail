import { discardAbandonedThreadDrop } from '../lib/thread-drop-staging';

describe('Composer abandoned conversation staging', () => {
  it('discards every staged file if the composer closed during the fetch', () => {
    const cleaned: string[] = [];
    const shouldStop = discardAbandonedThreadDrop(
      false,
      [{ filePath: '/tmp/draft-one.eml' }, { filePath: '/tmp/draft-two.eml' }],
      (filePath) => cleaned.push(filePath)
    );

    expect(shouldStop).toBe(true);
    expect(cleaned).toEqual(['/tmp/draft-one.eml', '/tmp/draft-two.eml']);
  });

  it('leaves staged files intact while the composer still owns the drop', () => {
    const cleaned: string[] = [];
    const shouldStop = discardAbandonedThreadDrop(
      true,
      [{ filePath: '/tmp/active.eml' }],
      (filePath) => cleaned.push(filePath)
    );

    expect(shouldStop).toBe(false);
    expect(cleaned).toEqual([]);
  });

  it('handles an abandoned drop without any successfully fetched files', () => {
    const cleaned: string[] = [];
    expect(discardAbandonedThreadDrop(false, [], (filePath) => cleaned.push(filePath))).toBe(
      true
    );
    expect(cleaned).toEqual([]);
  });
});
