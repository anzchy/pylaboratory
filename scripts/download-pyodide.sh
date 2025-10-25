#!/bin/bash

# Fetch the Pyodide 0.27.0 runtime bundle plus the packages we rely on.
# Keeps the docs site functional offline while avoiding the full 300MB distribution.

set -euo pipefail

BASE_URL="https://cdn.jsdelivr.net/pyodide/v0.27.0/full"
DEST_DIR="docs/assets/pyodide"
mkdir -p "$DEST_DIR"

core_files=(
  "console.html"
  "ffi.d.ts"
  "package.json"
  "pyodide-lock.json"
  "pyodide.asm.js"
  "pyodide.asm.wasm"
  "pyodide.d.ts"
  "pyodide.js"
  "pyodide.js.map"
  "pyodide.mjs"
  "pyodide.mjs.map"
  "python_stdlib.zip"
)

echo "📥 Downloading Pyodide v0.27.0 runtime assets..."
echo ""

download_file() {
  local file=$1
  local url="$BASE_URL/$file"
  local dest="$DEST_DIR/$file"

  echo "⏳ $file"
  curl -fL --progress-bar -o "$dest" "$url"
  local size
  size=$(du -h "$dest" | cut -f1)
  echo "✅ $file ($size)"
}

for file in "${core_files[@]}"; do
  download_file "$file"
done

echo ""
echo "📦 Resolving packages referenced in documentation..."

mapfile -t package_files < <(python3 "$(dirname "$0")/collect_pyodide_packages.py")

if [ "${#package_files[@]}" -eq 0 ]; then
  echo "ℹ️  No additional packages detected in Markdown snippets."
else
  for file in "${package_files[@]}"; do
    download_file "$file"
  done
fi

echo ""
echo "✨ Pyodide assets are ready:"
du -sh "$DEST_DIR"
