/** Reject unbounded or non-string ids before routing privileged window IPC. */
export function isValidWindowTaskId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 256 &&
    value.trim() === value
  );
}
