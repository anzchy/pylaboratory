# Repository Guidelines

## Project Structure & Module Organization
- `pylab/` hosts the TypeScript build pipeline derived from LangShift. Source modules live under `pylab/src/` (`components/` for editor shells, `lib/` for shared helpers, `workers/` for the Pyodide runtime, `storage/` for IndexedDB adapters, `palette/` for command UI). Build artifacts are emitted to `pylab/dist/` (gitignored).
- `docs/` contains the MkDocs site (`index.md`, `tutorial/*`, `assets/js` for the generated bundles, `assets/css`, `manifest.webmanifest`, `sw.js`). Treat `docs/assets/js/*.js` as build output—edit the TypeScript sources in `pylab/src` instead.
- `specs/001-interactive-python-tutorial/` tracks planning documents, while `plan.md` outlines the current LangShift integration roadmap.

## Build, Test, and Development Commands
- `cd pylab && npm install` – install the editor toolchain dependencies.
- `npm run build` (from `pylab/`) – compile the LangShift-derived modules and copy bundles into `docs/assets/js`.
- `npm run dev -- --watch` – rebuild editor bundles on change during MkDocs authoring sessions.
- `mkdocs serve` – run the documentation site locally at `http://127.0.0.1:8000/`.
- `mkdocs build` – produce the static site output (`site/`).
- `npx playwright test --config=tests/playwright.config.ts` – execute end-to-end checks once the editor bundles are present.

## Coding Style & Naming Conventions
- TypeScript and modern ES modules in `pylab/src`, Python Markdown content in `docs/`. Prefer 2-space indentation for TS/JS and 4 spaces for Python snippets.
- Use PascalCase for React components/classes, camelCase for functions and variables, and kebab-case for build outputs (`pylab-editor.js`).
- Run formatters before committing (`npx prettier --write "pylab/src/**/*.ts*" "docs/**/*.md"` once the tooling lands).

## Testing Guidelines
- Target Playwright for smoke tests covering editor mounting, Pyodide execution, persistence, and command palette flows.
- Name new tests after the user story they cover (e.g., `us1-inline-execution.spec.ts`).
- Document manual validation steps (browser + device) in `specs/001-interactive-python-tutorial/notes.md`.

## Commit & Pull Request Guidelines
- Use scope-prefixed commit messages (`feat(editor):`, `chore(build):`) mirroring the LangShift history. Include validation notes (commands run, screenshots) in the commit body when relevant.
- Pull requests should mention the user story or task ID, summarize high-level changes, list validation evidence (`mkdocs build`, Playwright runs), and attach UI screenshots for visible updates.

## Architecture Overview
- MkDocs delivers the static shell; a custom macro replaces fenced Python code blocks with the LangShift-based editor component.
- Pyodide is loaded once via the shared worker, with CDN failover handled by the copied `cdn-disaster-recovery` helpers.
- IndexedDB stores drafts and execution history, while optional GitHub Gist sync remains feature-gated until P3.
