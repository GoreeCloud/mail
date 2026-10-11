/** Reject unbounded or non-string ids before routing privileged window IPC. */
export function isValidWindowTaskId(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  return value.length > 0 && value.length <= 256 && value.trim() === value;
}

/** Reserve a one-shot cross-window request without replacing its original owner. */
export function reserveWindowTask<T>(pending: Map<string, T>, id: unknown, source: T): boolean {
  if (!isValidWindowTaskId(id) || pending.has(id) || pending.size >= 1024) {
    return false;
  }
  pending.set(id, source);
  return true;
}

/** Remove pending routes when their source window is closed. */
export function discardWindowTasksForSource<T>(pending: Map<string, T>, source: T): number {
  let removed = 0;
  pending.forEach((owner, id) => {
    if (owner === source) {
      pending.delete(id);
      removed += 1;
    }
  });
  return removed;
}
