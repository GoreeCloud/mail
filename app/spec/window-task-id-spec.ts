import { isValidWindowTaskId, reserveWindowTask } from '../src/browser/window-task-id';

describe('Cross-window IPC task identifiers', () => {
  it('accepts ordinary generated task IDs', () => {
    expect(isValidWindowTaskId('task-48b61f12')).toBe(true);
    expect(isValidWindowTaskId('a4fba20c-9c06-40d0-95e2-a2614f5ba1bb')).toBe(true);
  });

  it('rejects empty, unbounded and padded task IDs', () => {
    expect(isValidWindowTaskId('')).toBe(false);
    expect(isValidWindowTaskId('  ')).toBe(false);
    expect(isValidWindowTaskId(' task-id')).toBe(false);
    expect(isValidWindowTaskId('task-id ')).toBe(false);
    expect(isValidWindowTaskId('x'.repeat(257))).toBe(false);
    expect(isValidWindowTaskId('x'.repeat(256))).toBe(true);
  });

  it('does not overwrite an active IPC task owner', () => {
    const pending = new Map<string, string>();
    expect(reserveWindowTask(pending, 'task-1', 'original')).toBe(true);
    expect(reserveWindowTask(pending, 'task-1', 'replacement')).toBe(false);
    expect(pending.get('task-1')).toBe('original');
    pending.delete('task-1');
    expect(reserveWindowTask(pending, 'task-1', 'replacement')).toBe(true);
  });

  it('caps pending IPC task reservations', () => {
    const pending = new Map<string, number>();
    for (let i = 0; i < 1024; i++) {
      expect(reserveWindowTask(pending, `task-${i}`, i)).toBe(true);
    }
    expect(reserveWindowTask(pending, 'overflow', 10)).toBe(false);
    expect(pending.size).toBe(1024);
  });

  it('rejects non-string and missing IDs', () => {
    expect(isValidWindowTaskId(null)).toBe(false);
    expect(isValidWindowTaskId(undefined)).toBe(false);
    expect(isValidWindowTaskId(42)).toBe(false);
    expect(isValidWindowTaskId({ value: 'task-1' })).toBe(false);
  });
});
