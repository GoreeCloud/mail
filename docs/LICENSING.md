# GoreeCloud Mail — Repository Licensing Assessment

**Assessment date:** November 8, 2026  
**Repository:** https://github.com/GoreeCloud/mail (public; default branch `main`)  
**Scope:** Current experimental browser-client source and documentation; no binary or Stable release audited.

## Decision

The repository's primary open-source license is **Apache License, Version 2.0** (`Apache-2.0`). The full recognized license text is committed as [LICENSE](../LICENSE), declared in [package.json](../package.json), and linked from [README.md](../README.md).

Apache-2.0 fits this small independently usable client, permits reuse and modification, provides an express patent grant, and aligns with the verified licensing of the first-party design-token source rather than requiring an ambiguous MIT-only exception.

## Verified material and provenance

| Component | Inspection and licensing treatment |
| --- | --- |
| JavaScript browser client and test suite | Repository Git history at the checkpoint lists commits under the authorized `GoreeCloud` identity; no independently attributed external code contributors were identified in the examined history. Treated as GoreeCloud-controlled original source. This is not an exhaustive copyright audit. |
| GoreeCloud UI semantic CSS | `styles/app.css` identifies `GoreeCloud/gc-ui/styles/tokens.css` as a source. The original `GoreeCloud/gc-ui/LICENSE` was directly verified as Apache-2.0. License and source credit are preserved in [NOTICE](../NOTICE). |
| Icon | `assets/mail.svg` is a small repository SVG using the same GoreeCloud Mail brand/color primitives. No third-party icon library is bundled. |
| npm manifest | `package.json` contains no runtime or development dependencies. Test/check scripts use the local Node.js runtime. |
| External email services | Gmail/Google OAuth and Gmail API are external services, not licensed components copied into the repository. Their trademarks, APIs and terms remain separate. |
| Third-party data/fonts | No font files, datasets, vendored frameworks or third-party image assets were found in the inspected tracked tree. The CSS font stack names system fonts; it does not bundle font files. |

## Constraints and verification

- Public visibility alone was **not** previously a license grant. A root LICENSE and machine-readable SPDX metadata were absent before this remediation.
- A full contributor-rights or legal opinion has **not** been established by automated repository checks. Reevaluate before accepting outside contributions or importing source.
- Future packages, vendored code, fonts, icons, models and data need their own licensing assessment and notices. This repository's Apache-2.0 grant does not relicense external products or assets.
- Repository checks validate `LICENSE`, `NOTICE`, README disclosure and `package.json` license metadata. This is a structural safeguard, not a substitute for legal or provenance review.
- Acceptance requires readback on the merged default branch, GitHub's actual license detection where available, and CI verification. Until those checks complete, the branch is a proposed compliance correction, **not** a published release.

The decision follows GoreeCloud's [per-repository licensing policy](https://drive.google.com/file/d/1ub2mFjxP2TllXwBvfR_aZSDmih8TSxoU/view); no unrelated repository has been automatically relicensed.
