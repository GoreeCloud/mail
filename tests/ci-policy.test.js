import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');

test('mail CI pins the two trusted GitHub Actions to immutable commit digests', () => {
  const refs = [...workflow.matchAll(/uses:\s+actions\/(checkout|setup-node)@([0-9a-f]{40})/g)];
  assert.equal(refs.length, 2, 'require both pinned third-party workflow steps');
  assert.deepEqual(new Set(refs.map((match) => match[1])), new Set(['checkout', 'setup-node']));
  assert.ok(refs.every((match) => !/^0+$/.test(match[2])));
  assert.doesNotMatch(workflow, /uses:\s+[^\n]*@(main|master|v\d+)(?:\s|$)/);
});

test('mail CI retains least-privilege read-only workflow permissions', () => {
  assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);
  assert.doesNotMatch(workflow, /pull_request_target\s*:/);
  assert.doesNotMatch(workflow, /permissions:[\s\S]*?contents:\s*write/);
  assert.match(workflow, /- run: npm run check/);
  assert.match(workflow, /- run: npm test/);
});
