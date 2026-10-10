import { shell } from 'electron';

// `shell.openExternal` rejects with an OS-level error (eg. "Failed to open:
// No application is associated with the specified file..." / MK_E_UNAVAILABLE
// on Windows) when there's no application registered to handle the URL. That
// error has a message but no JS stack (it's constructed in native code), so
// when a caller doesn't add its own `.catch`, it surfaces as an unhandled
// promise rejection that Sentry reports with no stacktrace and no way to
// tell which of our many `shell.openExternal` call sites, or what URL, was
// involved (see MAILSPRING-CLIENT-6E).
//
// We capture the caller's stack synchronously (before the async native call
// runs) and attach it to the error if it doesn't already have one, then
// re-throw so existing `.catch` handlers keep working exactly as before —
// this only makes the error more informative, it doesn't change control flow.
const originalOpenExternal = shell.openExternal.bind(shell);
shell.openExternal = (url: string, options?: Electron.OpenExternalOptions) => {
  const callSite: { stack?: string } = {};
  Error.captureStackTrace(callSite, shell.openExternal);

  return originalOpenExternal(url, options).catch((err: Error) => {
    if (!err.stack) {
      try {
        const frames = (callSite.stack || '').split('\n').slice(1).join('\n');
        err.stack = `${err.name || 'Error'}: ${err.message}\n${frames}`;
      } catch {
        // err.stack isn't writable on this particular error; leave it as-is
        // rather than let this diagnostic path mask the original rejection.
      }
    }
    // Re-throw unchanged: existing `.catch` handlers (eg. the link-open
    // error dialog) already report this; the global unhandled-rejection
    // handler logs/reports anything nobody else catches, now with a stack.
    throw err;
  });
};

// `shell.openPath` resolves to an OS error string on failure. Do not log
// the requested local path or raw OS error: either may contain personal file
// names, account details, or other sensitive metadata. Preserve the original
// return value so callers can handle failure without changing their behavior.
const originalOpenPath = shell.openPath.bind(shell);
shell.openPath = (path: string) => {
  return originalOpenPath(path).then((result) => {
    if (result) {
      console.error('shell.openPath failed; check local file access and system associations.');
    }
    return result;
  });
};
