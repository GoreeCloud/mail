const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
let failed = false;
const fail = message => { failed = true; console.error('FAIL: ' + message); };
const pass = message => console.log('PASS: ' + message);
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const requireFile = rel => fs.existsSync(path.join(root, rel)) ? pass(rel + ' exists') : fail('missing ' + rel);

[
  'UPSTREAM.md','NOTICE.md','SECURITY.md','docs/ARCHITECTURE.md','docs/FORK-TO-NATIVE.md',
  'docs/FEATURE-PARITY.md','docs/PRIVACY.md','docs/GLAZE.md',
  'docs/INTEGRAL-PLATFORM-SYSTEMS.md','docs/courier.md','docs/courier.identity.json',
  'docs/acceptance/glaze-v1.7.0.json', 'docs/acceptance/mail-security.json'
].forEach(requireFile);

const appPkg = JSON.parse(read('app/package.json'));
if (appPkg.name !== 'goreecloud-mail' || appPkg.productName !== 'GoreeCloud Mail') fail('app identity metadata is not GoreeCloud Mail');
else pass('app identity metadata is GoreeCloud Mail');
if (!String((appPkg.repository || {}).url || '').includes('GoreeCloud/mail')) fail('app repository metadata is not canonical');

const config = read('app/src/config-schema.ts');
if (!/autoloadImages:\s*\{[\s\S]*?default:\s*false/.test(config)) fail('remote images must default to blocked');
else pass('remote images default to blocked');

const logger = read('app/src/error-logger.js');
if (/id\.getmailspring\.com\/report-crash/.test(logger) || /uploadToServer:\s*true/.test(logger)) fail('inherited crash upload remains enabled');
else pass('inherited crash upload is disabled');

const sentry = read('app/src/error-logger-extensions/sentry-error-reporter.js');
if (/o70907\.ingest\.us\.sentry\.io/.test(sentry) || /getMac/.test(sentry)) fail('upstream Sentry destination or hardware identifier remains');
else pass('upstream Sentry destination and hardware identifier removed');

const glaze = JSON.parse(read('docs/acceptance/glaze-v1.7.0.json'));
if (glaze.accepted || glaze.productionEligible || glaze.status !== 'adoption-required') fail('Glaze acceptance must remain fail-closed');
else pass('Glaze acceptance remains fail-closed');

const mailSecurity = JSON.parse(read('docs/acceptance/mail-security.json'));
const requiredUnverified = [
  'mainRendererContextIsolation', 'providerOAuthAndSSO',
  'hostileMessageAndAttachmentDesktopTests', 'runtimeDependencyAudit',
  'glazeAccessibility', 'installerSigningAndRollback'
];
if (
  mailSecurity.product !== 'GoreeCloud Mail' ||
  mailSecurity.status !== 'development' ||
  mailSecurity.productionEligible !== false ||
  mailSecurity.releaseEligible !== false ||
  !mailSecurity.acceptance ||
  requiredUnverified.some(gate => !['blocked', 'unverified'].includes(mailSecurity.acceptance[gate])) ||
  mailSecurity.acceptance.nativeSourceAndSQLiteMigration !== 'ci-only'
) {
  fail('Mail release/security acceptance must remain blocked until all independent runtime gates are verified');
} else {
  pass('Mail release/security acceptance remains fail-closed');
}

const courier = JSON.parse(read('docs/courier.identity.json'));
if (courier.repository !== 'GoreeCloud/mail' || courier.separateApplication || courier.separateRepository) fail('Courier boundary invalid');
else pass('Courier boundary valid');

const legacyApi = read('app/src/flux/mailspring-api-request.ts');
if (!legacyApi.includes('if (!legacyServicesEnabled)')) fail('legacy Mailspring API must be blocked by default');
else pass('legacy Mailspring API fails closed by default');
const packageManager = read('app/src/package-manager.ts');
if (!packageManager.includes('this.identityPresent = false')) fail('legacy identity-required packages must remain disabled');
else pass('legacy identity-required packages remain disabled');

// Guest web content must not create host windows or promote arbitrary URLs to
// privileged shell navigation. These source guards complement, not replace,
// runtime hostile-content and real-provider sign-in validation.
const signInWebview = read('app/src/components/webview.tsx');
const desktopWindow = read('app/src/browser/mailspring-window.ts');
if (/shell\.openExternal\s*\(/.test(signInWebview) || /['"]console-message['"]\s*:/.test(signInWebview)) {
  fail('sign-in Webview must not promote remote page output to privileged navigation or logs');
} else {
  pass('untrusted sign-in console and shell navigation paths are absent');
}
if (!/['"]did-attach-webview['"]/.test(desktopWindow) ||
    !/guestWebContents\.setWindowOpenHandler\(\(\)\s*=>\s*\(\{\s*action:\s*['"]deny['"]\s*\}\)\)/.test(desktopWindow)) {
  fail('Electron main process must explicitly deny attached guest window creation');
} else {
  pass('Electron main process denies guest-created windows');
}

// Mail package resources must never escape allowed roots through symlinks.
const resourceLoader = read('app/src/browser/mailspring-protocol-handler.ts');
const resourceTests = read('app/spec/mailspring-protocol-handler-spec.ts');
if (
  !resourceLoader.includes('fs.realpathSync(root)') ||
  !resourceLoader.includes('fs.realpathSync(candidate)') ||
  !resourceLoader.includes('resolvePackageResource(loadPath, relativePath)') ||
  !resourceTests.includes('symlinks targeting private files outside')
) {
  fail('Mail custom resource loading requires canonical-path enforcement and regression tests');
} else {
  pass('Mail resource paths use canonical package boundaries');
}

if (failed) process.exit(1);
console.log('GoreeCloud Mail foundation policy checks passed.');
