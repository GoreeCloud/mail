import fs from 'fs';
import os from 'os';
import path from 'path';
import { resolvePackageResource } from '../src/browser/mailspring-protocol-handler';

describe('"mailspring" protocol URL', () => {
  it('sends the file relative in the package as response', () => {
    let called = false;
    const request = new XMLHttpRequest();
    request.addEventListener('load', () => {
      called = true;
      return;
    });
    request.open('GET', 'mailspring://account-sidebar/package.json', true);
    request.send();

    waitsFor(() => called === true, 'request to be done');
  });
});

describe('Custom protocol canonical package boundaries', () => {
  let temporaryDirectory: string;
  let packageDirectory: string;
  let privateFile: string;
  let allowedFile: string;

  beforeEach(() => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'goreecloud-mail-resource-'));
    packageDirectory = path.join(temporaryDirectory, 'packages');
    fs.mkdirSync(packageDirectory);
    privateFile = path.join(temporaryDirectory, 'private.txt');
    allowedFile = path.join(packageDirectory, 'allowed.txt');
    fs.writeFileSync(privateFile, 'private');
    fs.writeFileSync(allowedFile, 'approved');
  });

  afterEach(() => {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it('serves ordinary regular files from the approved package', () => {
    expect(resolvePackageResource(packageDirectory, 'allowed.txt')).toBe(
      fs.realpathSync(allowedFile)
    );
  });

  it('rejects lexical parent traversal and similarly prefixed sibling directories', () => {
    expect(resolvePackageResource(packageDirectory, '../private.txt')).toBe(null);
    expect(resolvePackageResource(packageDirectory, 'missing.txt')).toBe(null);
    expect(resolvePackageResource(packageDirectory, '.')).toBe(null);
  });

  it('rejects symlinks targeting private files outside the package root', () => {
    if (process.platform === 'win32') return; // Windows symlinks require separate device testing.
    const linkPath = path.join(packageDirectory, 'external.txt');
    fs.symlinkSync(privateFile, linkPath);
    expect(resolvePackageResource(packageDirectory, 'external.txt')).toBe(null);
  });

  it('permits symlinks whose real target remains inside the package root', () => {
    if (process.platform === 'win32') return;
    const linkPath = path.join(packageDirectory, 'alias.txt');
    fs.symlinkSync(allowedFile, linkPath);
    expect(resolvePackageResource(packageDirectory, 'alias.txt')).toBe(
      fs.realpathSync(allowedFile)
    );
  });

  it('rejects symlinked directories that escape the package root', () => {
    if (process.platform === 'win32') return;
    fs.symlinkSync(temporaryDirectory, path.join(packageDirectory, 'outside'));
    expect(resolvePackageResource(packageDirectory, 'outside/private.txt')).toBe(null);
  });
});
