#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
required = [
    ROOT / "IMPLEMENTED-FEATURES.md",
    ROOT / "PLANNED-FEATURES.md",
    ROOT / "CHANGELOGS.md",
]
retired = ROOT / "FEATURE-ROADMAP.md"
archives = [
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-01.md", "1–50 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-02.md", "51–100 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-03.md", "101–150 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-04.md", "151–200 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-05.md", "201–250 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-06.md", "251–300 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-07.md", "301–350 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-08.md", "351–400 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-09.md", "401–450 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-10.md", "451–500 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-11.md", "501–550 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-12.md", "551–600 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-13.md", "601–650 of 699"),
    (ROOT / "docs/changelog-history/legacy-drive-mail-changelog-part-14.md", "651–699 of 699"),
]

errors = []
for path in required:
    if not path.is_file() or path.stat().st_size == 0:
        errors.append(f"missing or empty required repository record: {path.relative_to(ROOT)}")

if retired.exists():
    errors.append("retired FEATURE-ROADMAP.md must not exist")

for path, marker in archives:
    if not path.is_file() or path.stat().st_size == 0:
        errors.append(f"missing or empty changelog archive: {path.relative_to(ROOT)}")
        continue
    body = path.read_text(encoding="utf-8")
    if marker not in body:
        errors.append(f"archive range marker missing from {path.relative_to(ROOT)}: {marker}")

if required[2].is_file():
    index = required[2].read_text(encoding="utf-8")
    for path, _ in archives:
        if path.name not in index:
            errors.append(f"CHANGELOGS.md does not index {path.name}")

if errors:
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)
    raise SystemExit(1)

print("Repository feature/changelog governance records validated.")
