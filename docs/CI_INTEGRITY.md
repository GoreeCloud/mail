# GoreeCloud Mail — CI Supply-Chain Integrity

**Checkpoint:** November 8, 2026  
**Scope:** Current GitHub Actions workflow for the experimental static web client; not a production release or deployment pipeline.

## Verified external GitHub Actions

The workflow `.github/workflows/ci.yml` uses only two official GitHub Actions. Their current major-version `v4` Git tag object IDs were checked directly against the official GitHub repositories on November 8, 2026 and committed as immutable SHA references:

| Action | Verified `v4` Git commit | Purpose |
| --- | --- | --- |
| [actions/checkout](https://github.com/actions/checkout) | `11d5960a326750d5838078e36cf38b85af677262` | Read source into the workflow checkout |
| [actions/setup-node](https://github.com/actions/setup-node) | `49933ea5288caeca8642d1e84afbd3f7d6820020` | Provision Node.js 22 |

This reduces exposure to unexpected changes in moving action tags, but it does not prove either action is vulnerability-free.

## Permissions and execution

- GitHub Actions token permissions remain `contents: read`; no write permission or deployment credentials are introduced.
- The workflow executes `npm run check` and `npm test`. The current `package.json` contains **no npm dependencies**, no install scripts, and no runtime network requests in tests other than mocks.
- An additional automated test verifies both action references are full 40-character SHA-1 Git object identifiers rather than tags and that the workflow retains read-only permissions.
- Do not use `pull_request_target` or untrusted fork code with elevated permissions without a separate security review.

## Maintenance

When upgrading an action, first inspect the official repository's release/ref, code behavior, major-version compatibility and permission impact. Change the pinned SHA in a reviewed branch, rerun all checks, and verify the actual post-merge workflow run. The unit test validates *structure*, not the independently verified trustworthiness of any arbitrary SHA.

Outstanding before Stable: independent dependency/CI security assessment, OS-native packaging workflows, code-signing policy, artifacts, provenance/SBOM as appropriate, and real device smoke tests. No production or native release workflow is claimed here.
