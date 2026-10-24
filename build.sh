#!/usr/bin/env sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SOURCE="$ROOT/src/index.html"

[ -f "$SOURCE" ] || { echo "Missing source: $SOURCE" >&2; exit 1; }

rm -rf "$ROOT/public"
mkdir -p "$ROOT/public"
cp "$SOURCE" "$ROOT/public/index.html"
# Keep a root copy for simple local opening and static hosts.
cp "$SOURCE" "$ROOT/index.html"
printf 'Built public/index.html (%s bytes)\n' "$(wc -c < "$ROOT/public/index.html")"
