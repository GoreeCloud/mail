/** Reject unbounded or non-string ids before routing privileged window IPC. */
export function isValidWindowTaskId(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  return value.length > 0 && value.length <= 256 && value.trim() === value;
}
