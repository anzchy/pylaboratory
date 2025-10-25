#!/usr/bin/env python3
"""
Discover the Python packages referenced in Markdown fenced snippets and
resolve their corresponding wheel filenames via the Pyodide lock manifest.
"""

from __future__ import annotations

import ast
import json
import sys
from pathlib import Path
from typing import Iterable, Set
import re

ROOT_DIR = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT_DIR / "docs"
LOCK_PATH = ROOT_DIR / "docs" / "assets" / "pyodide" / "pyodide-lock.json"

FENCED_LANG_PATTERN = re.compile(r"```python(?P<meta>[^\n]*)", re.IGNORECASE)
PACKAGES_VALUE_PATTERN = re.compile(r'packages\s*=\s*(\[[^\n]*?\]|"[^"\n]*"|\'[^\'\n]*\')')


def parse_packages_meta(meta: str) -> Iterable[str]:
    """Extract package names from the fenced block metadata."""
    meta = meta.strip()
    if not meta:
        return []

    match = PACKAGES_VALUE_PATTERN.search(meta)
    if not match:
        return []

    raw_value = match.group(1)

    try:
        value = ast.literal_eval(raw_value)
    except (SyntaxError, ValueError):
        return []

    if isinstance(value, str):
        return [value] if value else []

    if isinstance(value, (list, tuple, set)):
        return [item for item in value if isinstance(item, str) and item]

    return []


def discover_required_packages() -> Set[str]:
    packages: Set[str] = set()
    for md_file in DOCS_DIR.rglob("*.md"):
        try:
            content = md_file.read_text(encoding="utf-8")
        except OSError:
            continue

        for match in FENCED_LANG_PATTERN.finditer(content):
            meta = match.group("meta") or ""
            packages.update(parse_packages_meta(meta))

    return packages


def resolve_package_files(package_names: Iterable[str]) -> Set[str]:
    if not LOCK_PATH.exists():
        print("Pyodide lock file not found; no package files resolved.", file=sys.stderr)
        return set()

    lock_data = json.loads(LOCK_PATH.read_text(encoding="utf-8"))
    manifest = lock_data.get("packages", {})

    resolved_files: Set[str] = set()
    queue = list(package_names)
    visited: Set[str] = set()
    missing: Set[str] = set()

    while queue:
        pkg = queue.pop()
        if pkg in visited:
            continue
        visited.add(pkg)

        entry = manifest.get(pkg)
        if not entry:
            missing.add(pkg)
            continue

        file_name = entry.get("file_name")
        if file_name:
            resolved_files.add(file_name)

        for dep in entry.get("depends", []):
            if dep not in visited:
                queue.append(dep)

    if missing:
        print(
            f"Warning: packages not found in pyodide-lock.json: {', '.join(sorted(missing))}",
            file=sys.stderr,
        )

    return resolved_files


def main() -> int:
    packages = discover_required_packages()
    if not packages:
        return 0

    files = resolve_package_files(packages)
    for file_name in sorted(files):
        print(file_name)

    return 0


if __name__ == "__main__":
    sys.exit(main())
