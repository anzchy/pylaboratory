from __future__ import annotations

import html
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

FENCED_BLOCK_PATTERN = re.compile(
    r"```(?P<lang>[\w+-]+)(?P<meta>[^\n]*)\n(?P<body>.*?)```",
    re.DOTALL,
)

META_PATTERN = re.compile(
    r"""
    (?P<key>\w+)
    =
    (?P<value>
        "(?:[^"\\]|\\.)*" |
        '(?:[^'\\]|\\.)*' |
        \[[^\]]*\] |
        [^\s]+
    )
    """,
    re.VERBOSE,
)


class SnippetConfig:
    def __init__(
        self,
        identifier: str,
        language: str,
        code: str,
        packages: List[str] = None,
        timeout_ms: int = 5000,
        height: int = 320,
    ):
        self.identifier = identifier
        self.language = language
        self.code = code
        self.packages = packages if packages is not None else []
        self.timeout_ms = timeout_ms
        self.height = height

    def to_json(self) -> str:
        payload: Dict[str, Any] = {
            "id": self.identifier,
            "language": self.language,
            "defaultCode": self.code,
            "packages": self.packages,
            "timeoutMs": self.timeout_ms,
            "height": self.height,
        }
        return json.dumps(payload)


def _parse_meta(meta: str) -> Dict[str, str]:
    """Parse key=value pairs from the fenced block meta section."""
    results: Dict[str, str] = {}
    for match in META_PATTERN.finditer(meta):
        key = match.group("key")
        raw_value = match.group("value")
        results[key] = raw_value
    return results


def _parse_packages(raw_value: Optional[str]) -> List[str]:
    if not raw_value:
        return []
    trimmed = raw_value.strip()
    if trimmed.startswith('[') and trimmed.endswith(']'):
        try:
            return json.loads(trimmed)
        except json.JSONDecodeError:
            pass
    if (trimmed.startswith('"') and trimmed.endswith('"')) or (
        trimmed.startswith("'") and trimmed.endswith("'")
    ):
        value = trimmed[1:-1].strip()
        return [value] if value else []

    return [p.strip() for p in trimmed.split(',') if p.strip()]


def _next_snippet_id(state: Dict[str, Any], page_path: str) -> str:
    counter = state.setdefault("counter", 0) + 1
    state["counter"] = counter
    base = Path(page_path).stem.replace(' ', '-').lower() or "snippet"
    return f"{base}-snippet-{counter}"


def define_env(env):
    """MkDocs-macros entry point."""

    macro_state: Dict[str, Any] = {}

    def transform_fenced_snippets(markdown: str, page_path: str = "page") -> str:
        """Transform fenced code blocks into PyLab-ready placeholders."""
        snippets: List[str] = []
        cursor = 0

        for match in FENCED_BLOCK_PATTERN.finditer(markdown):
            start, end = match.span()
            snippets.append(markdown[cursor:start])

            lang = match.group("lang").strip().lower()
            meta_raw = match.group("meta") or ""
            body = match.group("body")

            # Only transform Python code blocks with metadata
            if lang == "python" and meta_raw.strip():
                meta = _parse_meta(meta_raw)
                packages = _parse_packages(meta.get("packages"))
                timeout = int(meta.get("timeout", meta.get("timeoutMs", 5000)))
                height = int(meta.get("height", 320))

                identifier = meta.get("id") or _next_snippet_id(macro_state, page_path)

                config = SnippetConfig(
                    identifier=identifier,
                    language=lang,
                    code=body.strip('\n'),
                    packages=packages,
                    timeout_ms=timeout,
                    height=height,
                )

                escaped_payload = html.escape(config.to_json(), quote=True)

                placeholder = (
                    f'<div class="pylab-snippet" '
                    f'data-snippet="{escaped_payload}"></div>'
                )

                snippets.append(placeholder)
            else:
                # Keep original code block for non-Python or metadata-less blocks
                snippets.append(markdown[start:end])

            cursor = end

        snippets.append(markdown[cursor:])
        return "".join(snippets)

    env.variables['transform_fenced_snippets'] = transform_fenced_snippets


def on_pre_page_macros(env):
    """Hook called before macros are processed on each page."""
    # Get the current markdown content
    markdown = env.markdown
    page = env.page

    macro_state: Dict[str, Any] = {}

    def transform_fenced_snippets(markdown: str, page_path: str = "page") -> str:
        """Transform fenced code blocks into PyLab-ready placeholders."""
        snippets: List[str] = []
        cursor = 0

        for match in FENCED_BLOCK_PATTERN.finditer(markdown):
            start, end = match.span()
            snippets.append(markdown[cursor:start])

            lang = match.group("lang").strip().lower()
            meta_raw = match.group("meta") or ""
            body = match.group("body")

            # Only transform Python code blocks with metadata
            if lang == "python" and meta_raw.strip():
                meta = _parse_meta(meta_raw)
                packages = _parse_packages(meta.get("packages"))
                timeout = int(meta.get("timeout", meta.get("timeoutMs", 5000)))
                height = int(meta.get("height", 320))

                identifier = meta.get("id") or _next_snippet_id(macro_state, page_path)

                config = SnippetConfig(
                    identifier=identifier,
                    language=lang,
                    code=body.strip('\n'),
                    packages=packages,
                    timeout_ms=timeout,
                    height=height,
                )

                escaped_payload = html.escape(config.to_json(), quote=True)

                placeholder = (
                    f'<div class="pylab-snippet" '
                    f'data-snippet="{escaped_payload}"></div>'
                )

                snippets.append(placeholder)
            else:
                # Keep original code block for non-Python or metadata-less blocks
                snippets.append(markdown[start:end])

            cursor = end

        snippets.append(markdown[cursor:])
        return "".join(snippets)

    page_path = page.file.src_path if hasattr(page, 'file') else "page"
    env.markdown = transform_fenced_snippets(markdown, page_path)
