import { protocol } from 'electron';
import fs from 'fs';
import path from 'path';

// Handles requests with 'mailspring' protocol.
//
// It's created by {Application} upon instantiation and is used to create a
// custom resource loader for 'mailspring://' URLs.
//
// The following directories are searched in order:
//   * <config-dir>/assets
//   * <config-dir>/dev/packages (unless in safe mode)
//   * <config-dir>/packages
//   * RESOURCE_PATH/node_modules
//
/**
 * Resolve a package resource to a regular file within its canonical root.
 * This blocks both lexical traversal and symlinks that leave the package.
 */
export function resolvePackageResource(loadPath: string, relativePath: string): string | null {
  const root = path.resolve(loadPath);
  const candidate = path.resolve(path.join(root, relativePath));
  const lexicalRelative = path.relative(root, candidate);
  if (
    !lexicalRelative ||
    lexicalRelative === '..' ||
    lexicalRelative.startsWith('..' + path.sep) ||
    path.isAbsolute(lexicalRelative)
  ) {
    return null;
  }

  try {
    const canonicalRoot = fs.realpathSync(root);
    const canonicalCandidate = fs.realpathSync(candidate);
    const canonicalRelative = path.relative(canonicalRoot, canonicalCandidate);
    if (
      !canonicalRelative ||
      canonicalRelative === '..' ||
      canonicalRelative.startsWith('..' + path.sep) ||
      path.isAbsolute(canonicalRelative)
    ) {
      return null;
    }
    return fs.statSync(canonicalCandidate).isFile() ? canonicalCandidate : null;
  } catch {
    // A missing, unreadable or unsafe path must never be served.
    return null;
  }
}

export default class MailspringProtocolHandler {
  loadPaths: string[] = [];

  constructor({ configDirPath, resourcePath, safeMode }) {
    if (!safeMode) {
      this.loadPaths.push(path.resolve(path.join(configDirPath, 'dev', 'packages')));
    }
    this.loadPaths.push(path.resolve(path.join(configDirPath, 'packages')));
    this.loadPaths.push(path.resolve(path.join(resourcePath, 'internal_packages')));

    this.registerProtocol();
  }

  // Creates the 'Mailspring' custom protocol handler.
  registerProtocol() {
    const scheme = 'mailspring';

    protocol.handle(scheme, (request) => {
      const relativePath = path.normalize(request.url.substr(scheme.length + 1));

      let filePath = null;
      for (const loadPath of this.loadPaths) {
        const resolvedPath = resolvePackageResource(loadPath, relativePath);
        if (resolvedPath) {
          filePath = resolvedPath;
          break;
        }
      }

      if (filePath) {
        return new Response(fs.readFileSync(filePath), { status: 200 });
      } else {
        return new Response('Not Found', { status: 404 });
      }
    });
  }
}
