import { isValidWindowTaskId } from '../src/browser/window-task-id';

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

  it('rejects non-string and missing IDs', () => {
    expect(isValidWindowTaskId(null)).toBe(false);
    expect(isValidWindowTaskId(undefined)).toBe(false);
    expect(isValidWindowTaskId(42)).toBe(false);
    expect(isValidWindowTaskId({ value: 'task-1' })).toBe(false);
  });
});
