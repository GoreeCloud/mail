import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (name) => readFileSync(new URL('../' + name, import.meta.url), 'utf8');

test('GoreeCloud Mail has its own complete Apache-2.0 license', () => {
  const license = read('LICENSE');
  assert.match(license, /Apache License\s+Version 2\.0, January 2004/);
  assert.match(license, /TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION/);
  assert.match(license, /END OF TERMS AND CONDITIONS/);
  assert.ok(license.length > 10000, 'not a short license placeholder');
});

test('license metadata and first-party GC UI attribution remain consistent', () => {
  const pkg = JSON.parse(read('package.json'));
  const readme = read('README.md');
  const notice = read('NOTICE');
  assert.equal(pkg.license, 'Apache-2.0');
  assert.match(readme, /Apache License 2\.0/);
  assert.match(readme, /\[LICENSE\]\(LICENSE\)/);
  assert.match(notice, /Copyright 2026 GoreeCloud/);
  assert.match(notice, /GoreeCloud\/gc-ui/);
  assert.match(notice, /Apache License, Version 2\.0/);
});

test('the static client has no unreviewed npm dependency declarations', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(Object.keys(pkg.dependencies || {}).length, 0);
  assert.equal(Object.keys(pkg.devDependencies || {}).length, 0);
  assert.equal(Object.keys(pkg.optionalDependencies || {}).length, 0);
});
