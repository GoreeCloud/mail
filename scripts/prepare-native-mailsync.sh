#!/usr/bin/env bash
# Prepare the pinned GPLv3 Mailspring-Sync source for GoreeCloud Mail builds.
# This does not execute or package any downloaded upstream binary.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
engine="$root/mailsync"
patch="$root/engine/patches/0001-remove-legacy-executable-name-lock.patch"
expected="675e9f22e4db4938786231fba9992f0cba489d3b"

if [[ ! -f "$engine/MailSync/main.cpp" ]]; then
  echo "The pinned Mailspring-Sync submodule is not checked out." >&2
  echo "Initialize it explicitly with: git submodule update --init mailsync" >&2
  exit 1
fi

actual="$(git -C "$engine" rev-parse HEAD)"
if [[ "$actual" != "$expected" ]]; then
  echo "Unexpected engine source revision; expected $expected." >&2
  exit 1
fi

if [[ -n "$(git -C "$engine" status --porcelain --untracked-files=all)" ]]; then
  echo "Engine worktree is not clean; refusing to overwrite existing edits." >&2
  exit 1
fi

git -C "$engine" apply --check "$patch"
git -C "$engine" apply "$patch"

echo "Prepared patched GoreeCloud Mail engine source at pinned upstream revision."
echo "No binary has been built, signed, verified, or approved for release."
