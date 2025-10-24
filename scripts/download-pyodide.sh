#!/bin/bash

# Download Pyodide v0.27.0 files to local storage
# This script downloads the necessary Pyodide distribution files
# so that PyLab can work offline or with CDN failures

set -e

DEST_DIR="docs/assets/pyodide"
mkdir -p "$DEST_DIR"

echo "📥 Downloading Pyodide v0.27.0 files..."
echo "This may take a few minutes depending on your connection..."
echo ""

# Core files needed for Pyodide
FILES=(
  "pyodide.js"
  "pyodide.asm.js"
  "pyodide.asm.wasm"
  "pyodide-worker.js"
  "pyodide_py.zip"
  "packages.json"
)

BASE_URL="https://cdn.jsdelivr.net/npm/pyodide@0.27.0/dist"

FAILED=0
for file in "${FILES[@]}"; do
  echo "⏳ Downloading $file..."
  if curl -L --progress-bar -o "$DEST_DIR/$file" "$BASE_URL/$file" 2>/dev/null; then
    size=$(du -h "$DEST_DIR/$file" | cut -f1)
    echo "✅ $file ($size)"
  else
    echo "❌ Failed to download $file"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
if [ $FAILED -eq 0 ]; then
  echo "✨ All files downloaded successfully!"
  echo ""
  echo "📊 Total size:"
  du -sh "$DEST_DIR"
else
  echo "⚠️  $FAILED file(s) failed to download"
  exit 1
fi
