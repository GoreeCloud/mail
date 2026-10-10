# GoreeCloud Mail — Capability Catalog Accessibility Acceptance

**Status:** Documentation QA candidate; manual assistive-technology acceptance **not verified**.  
**As of:** October 10, 2026  
**Canonical deliverable:** [GoreeCloud Mail — Features and Capabilities Catalog.docx](https://docs.google.com/document/d/1nkRDbhXr1PlkPRuKkCrFuAESKh15cNa5/edit) in GoreeCloud / Feature Roadmap. Drive retains the editable **DOCX**, not a converted native Google Doc.  
**Scope:** Accessibility of the **Word capability catalog only**. GoreeCloud Mail **application** accessibility (Glaze and actual screens), provider security, and release readiness are separate acceptance tracks.

## What has been verified

- The authoritative Drive DOCX was revised **in place**, retaining file identity, folder and version history; its observed updated size is **53,343 bytes** (October 10).
- The revised file has **25 numbered Heading 1 domain sections**, **804 feature/integration/analytics list paragraphs**, with **11 architecture principles** in the final section; source-order content preserved during layout migration.
- The 804 list paragraphs use a dedicated Word paragraph style based on `List Bullet`. There is **one remaining six-row, two-column scope-comparison table** with its header row designated as a semantic table header; former layout-only tables were converted to document paragraphs and lists.
- The revised DOCX was rendered for page-layout inspection across **22 pages**. No obvious clipping was reported in the previous visual check; rendering alone does **not** establish screen-reader, keyboard or reflow accessibility.
- The local Office-file automated accessibility audit was rerun against the retained accessible DOCX and reported **0 high / 0 medium / 0 low findings**. The earlier layout-based version had **40 medium table-header warnings**. **Zero automated findings is not a WCAG or assistive-technology conformance claim.**

The canonical Drive file and its exact content must be checked again if it is replaced or revised. Source text remains governed by the DOCX; this file is a QA protocol and evidence boundary, **not** a second copy of product requirements.

## Manual acceptance matrix — pending

| Target | Required interaction and expected outcome | Evidence and pass gate |
|---|---|---|
| Microsoft Word + NVDA on Windows | Navigate title, product metadata, all 25 numbered Heading 1 domains, and their Heading 2 subsections using native heading shortcuts | Screen-reader navigation transcript/checklist; all headings announced in correct order and without missing or extra levels |
| Microsoft Word + NVDA on Windows | Traverse representative bullets in sections 1, 8, 19, 20 and 24; identify list start/end and items without confusing decorative symbols | Confirm actual list semantics and spoken item order, not only visually drawn bullets |
| Microsoft Word + NVDA on Windows | Read the sole scope-comparison table using row/column navigation | Two column headers announced; five data rows correctly associated and ordered; no decorative layout tables |
| Microsoft Word + NVDA on Windows | Navigate the document using keyboard alone, follow approved internal/external links, and return focus to the previous location | No keyboard trap, unexpected browser launch, inaccessible link name or focus loss; record exact destinations |
| LibreOffice Writer + Orca on Linux | Navigate the same headings, lists and scope table | Independent Linux interoperability evidence; note renderer or accessibility-tree discrepancies |
| Microsoft Word with magnification and high-contrast display | Review at 200%–400% effective magnification / narrow window while using keyboard navigation | No critical text loss, overlapping content, clipped controls or horizontal navigation trap |
| Word/LibreOffice document properties | Inspect language settings, title, reading order, and page/footer semantics | Language is correct, title useful, decorative content not distracting, and no inaccurate document-state claims |
| Independent proofreading | Compare canonical contents and ordered items against approved product blueprint | All 25 domains, the 804 list entries and 11 architecture principles remain; no accidental text omission or functional-status upgrade |

If a screen reader or supported OS application is unavailable, record **not tested** and the environment limitation. A simulated screenshot review may validate pagination but must **not** be substituted for assistive-technology testing.

## Completion and regression rules

1. Capture **exact Drive file ID, modified timestamp, size and document revision** before testing; never reuse a stale local copy as evidence of the canonical file.
2. Record tester, operating system, application and assistive-technology versions, test date, sampled sections and observed output for every manual row. File sensitive test artifacts only in an authorized, privacy-minimized QA location.
3. File each discrepancy as an actionable task with severity, reproduction, owner and the required repair and retest. Apply content/layout fixes to the authoritative DOCX **in place**, preserving its ID and reviewing whether version-indexed proposal references need reconciliation.
4. Re-run the automated audit and full-page render after any DOCX structure or layout change; **all failed manual cases must also be rechecked**.
5. Do not close this acceptance track until all applicable manual rows have evidenced pass, explicit approved exceptions or documented platform exclusions. Do not reuse its result as evidence for the application's Glaze accessibility, Electron security, provider authorization or release readiness.

## Product delivery guard

Mail's live release gate remains [`docs/acceptance/mail-security.json`](mail-security.json). It is **not** modified by catalog-document accessibility work. The feature catalog is proposed; no capability is delivered merely because its requirements are represented accessibly.
