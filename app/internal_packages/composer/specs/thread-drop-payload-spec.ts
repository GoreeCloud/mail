import { threadIdsFromDragPayload } from '../lib/thread-drop-payload';

describe('Composer conversation drag payloads', () => {
  it('accepts valid conversation identifiers', () => {
    expect(threadIdsFromDragPayload('{"threadIds":["thread-1","thread-2"]}')).toEqual([
      'thread-1',
      'thread-2',
    ]);
  });

  it('accepts the complete thread-list drag payload with account IDs', () => {
    expect(
      threadIdsFromDragPayload(
        JSON.stringify({
          threadIds: ['message-1', 'message-2'],
          accountIds: ['account-a', 'account-b'],
        })
      )
    ).toEqual(['message-1', 'message-2']);
  });

  it('deduplicates identifiers without changing their order', () => {
    expect(threadIdsFromDragPayload('{"threadIds":["a","b","a","c","b"]}')).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('rejects malformed JSON and missing or incorrectly typed collections', () => {
    expect(threadIdsFromDragPayload('')).toEqual([]);
    expect(threadIdsFromDragPayload('{invalid')).toEqual([]);
    expect(threadIdsFromDragPayload('null')).toEqual([]);
    expect(threadIdsFromDragPayload('{}')).toEqual([]);
    expect(threadIdsFromDragPayload('{"threadIds":"abc"}')).toEqual([]);
    expect(threadIdsFromDragPayload('{"threadIds":42}')).toEqual([]);
  });

  it('does not stage any conversations when a payload contains invalid identifiers', () => {
    expect(threadIdsFromDragPayload('{"threadIds":["valid",null]}')).toEqual([]);
    expect(threadIdsFromDragPayload('{"threadIds":["valid",123]}')).toEqual([]);
    expect(threadIdsFromDragPayload('{"threadIds":["valid",{}]}')).toEqual([]);
    expect(threadIdsFromDragPayload('{"threadIds":["valid",""]}')).toEqual([]);
    expect(threadIdsFromDragPayload('{"threadIds":["valid"," padded "]}')).toEqual([]);
  });
});
