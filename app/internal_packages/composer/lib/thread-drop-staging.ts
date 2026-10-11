/**
 * An asynchronous conversation drop can complete after its composer closes.
 * In that case there is no attachment consumer: discard every staged file
 * instead of leaving unreferenced message source in the system temp folder.
 *
 * Return true when the caller must stop processing the abandoned result.
 */
export function discardAbandonedThreadDrop(
  isMounted: boolean,
  staged: ReadonlyArray<{ filePath: string }>,
  discard: (filePath: string) => void
): boolean {
  if (isMounted) {
    return false;
  }

  staged.forEach(({ filePath }) => discard(filePath));
  return true;
}
