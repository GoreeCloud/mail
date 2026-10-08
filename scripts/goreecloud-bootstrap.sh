#!/usr/bin/env bash
set -euo pipefail
UPSTREAM_REV="6054ff7a2e43b9d8e5ad7931370316e5b35d9a25"
git remote add mailspring-upstream https://github.com/Foundry376/Mailspring.git
git fetch --no-tags mailspring-upstream master
git cat-file -e "$UPSTREAM_REV^{commit}"
echo "Pinned upstream revision: $UPSTREAM_REV"
git merge --allow-unrelated-histories --no-commit "$UPSTREAM_REV" || true
if git ls-files -u | grep -q .; then
  git checkout --ours README.md
  git add README.md
fi
if git ls-files -u | grep -q .; then
  echo "Unresolved import conflicts remain"
  git ls-files -u
  exit 1
fi
python3 - <<'PY'
from pathlib import Path
p=Path('app/src/config-schema.ts')
s=p.read_text()
a="autoloadImages: {\n            type: 'boolean',\n            default: true,"
assert a in s
p.write_text(s.replace(a,"autoloadImages: {\n            type: 'boolean',\n            default: false,",1))
p=Path('app/src/error-logger.js')
s=p.read_text()
start="    this.extensions = [\n      new SentryErrorReporter({"
assert start in s
s=s.replace("    this.extensions = [\n      new SentryErrorReporter({\n        inSpecMode: args.inSpecMode,\n        inDevMode: args.inDevMode,\n        resourcePath: args.resourcePath,\n      }),\n    ];","    // GoreeCloud Mail does not upload inherited telemetry.\n    this.extensions = [];",1)
s=s.replace("productName: 'Mailspring'","productName: 'GoreeCloud Mail'",1).replace("companyName: 'Mailspring'","companyName: 'GoreeCloud'",1)
s=s.replace("submitURL: `https://id.getmailspring.com/report-crash?ver=${appVersion}&platform=${process.platform}`","submitURL: 'https://127.0.0.1/goreecloud-mail-disabled'",1).replace("uploadToServer: true","uploadToServer: false",1).replace("autoSubmit: true","autoSubmit: false",1)
assert "uploadToServer: false" in s
p.write_text(s)
p=Path('app/internal_packages/onboarding/lib/page-welcome.tsx')
s=p.read_text().replace("Welcome to Mailspring","Welcome to GoreeCloud Mail",1)
p.write_text(s)
p=Path('app/internal_packages/onboarding/lib/page-tutorial.tsx')
s=p.read_text().replace("OnboardingActions.moveToPage('authenticate')","OnboardingActions.moveToPage('account-choose')",1)
p.write_text(s)
p=Path('app/internal_packages/onboarding/lib/onboarding-store.ts')
s=p.read_text().replace("this._pageStack = ['authenticate'];","this._pageStack = ['account-choose'];")
p.write_text(s)
p=Path('app/src/browser/mailspring-window.ts')
s=p.read_text().replace("title: title || 'Mailspring'","title: title || 'GoreeCloud Mail'",1)
p.write_text(s)
p=Path('app/src/package-manager.ts')
s=p.read_text()
s=s.replace("this.identityPresent = !!AppEnv.config.get('identity');","this.identityPresent = false; // Legacy cloud-only packages disabled during GoreeCloud migration.",1)
s=s.replace("if (!this.identityPresent && !!AppEnv.config.get('identity')) {","if (false) { // Inherited Mailspring identity activation remains disabled",1)
p.write_text(s)
PY
cat > README.md <<'EOF'
# GoreeCloud Mail

**Active Development — Fork-to-Native foundation.** This is an independent GoreeCloud email client in development, derived from Mailspring. It is not yet stable, fully native, or production ready.

## Source and license
Upstream: [Foundry376/Mailspring](https://github.com/Foundry376/Mailspring).
Inherited source, assets, and code history retain their upstream licenses and copyright notices. See [LICENSE.md](LICENSE.md).
The import commit preserves upstream Git ancestry.

## Direction
- Independent GoreeCloud Mail identity and onboarding.
- Glaze 1.7.0 adoption and independent consumer acceptance.
- Offline-first multi-account email using standards-based interoperability.
- Privacy Shield, Wardveil Security, Everkeep, GoreeCloud Manager, Mesh, and Identity applicability evaluated with evidence.
- Secure mail rendering, attachment handling, credential isolation, provider OAuth, keyboard accessibility, and reduced privilege boundaries.
- Progressive replacement of upstream proprietary services and product-defining architecture.

## Initial safeguards
Automatic remote images are disabled by default. Inherited crash reporting and Sentry are disabled; external legacy identity-required packages are not activated. These are only the foundation controls, not full security acceptance.

## Known blocker
The inherited Electron app renderer currently has privileged Node integration and needs a reviewed preload/IPC security migration before any production readiness claim.

## Work tracking
See [docs/GOREECLOUD-MAIL-ROADMAP.md](docs/GOREECLOUD-MAIL-ROADMAP.md).
EOF
mkdir -p docs
cat > docs/GOREECLOUD-MAIL-ROADMAP.md <<'EOF'
# GoreeCloud Mail — Fork-to-Native Roadmap

Status: Active / not production ready.

## Source foundation
- Import upstream Mailspring with ancestry and GPLv3 notices intact.
- Preserve useful email feature coverage while migration proceeds.
- Treat source migration as an architectural starting point, not a native-completion claim.

## Immediate follow-up
- Verify reproducible installation, typecheck, lint, tests, and builds on supported targets.
- Replace legacy identity, paid-tier, analytics, read-tracking, send-later, and subscription dependencies with governed GoreeCloud implementations or explicit reviewed deprecations.
- Remove top-level renderer privileges using an isolated preload and narrow audited IPC.
- Audit link navigation, HTML sanitization, resource loading, attachments, filesystem paths, plugins and update channels.
- Reconcile packaging, app IDs, icons, translations, login pages and all branded surfaces.
- Adopt Glaze 1.7.0 and collect Mail-specific rendered, accessibility, visual, performance and rollback evidence.
- Evaluate all seven Integral Platform Systems individually; do not presume conformance.
- Validate mailbox providers, token protection, account isolation, offline recovery, searches, drafts, sending and migrations.
- Produce signed and independently verified distribution artifacts only after release gates pass.
EOF
# GitHub Actions' repository token cannot create imported workflow files.
# Preserve upstream workflow history through the merge parent, but do not carry
# upstream automation into GoreeCloud Mail until it is reviewed and re-added
# through the GoreeCloud repository connection.
find .github/workflows -type f ! -name 'bootstrap-mail.yml' -delete
rm -f .github/bootstrap-mail.sh.gz.b64 scripts/goreecloud-bootstrap.sh

git add -A
git diff --cached --check -- README.md docs/GOREECLOUD-MAIL-ROADMAP.md app/src/config-schema.ts app/src/error-logger.js app/src/browser/mailspring-window.ts app/src/package-manager.ts app/internal_packages/onboarding/lib/page-welcome.tsx app/internal_packages/onboarding/lib/page-tutorial.tsx app/internal_packages/onboarding/lib/onboarding-store.ts
git commit -m "feat(mail): import Mailspring with GoreeCloud privacy-first foundation"
git push origin HEAD:feat/mailspring-fork-to-native-foundation