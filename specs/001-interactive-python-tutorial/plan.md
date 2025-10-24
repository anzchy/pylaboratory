# PyLab LangShift Integration Plan

## Implementation Phases

1. **Repackage core runtime**  
   - Copy LangShift Monaco/Pyodide modules (`python-editor.tsx`, `universal-editor.tsx`, `monaco-manager.tsx`, `virtualized-editor.tsx`, CDN helpers) into `pylab/src/components` and `pylab/src/lib`.  
   - Remove Next.js-specific dependencies and expose a framework-agnostic entry (Web Component or hydrate helper) for MkDocs pages.

2. **Worker-first execution**  
   - Extract Pyodide manager logic from LangShift and relocate execution into `pylab/src/workers/pyodide-worker.ts`.  
   - Keep LangShift’s dynamic package loading, stdout/stderr capture, and execution timeout strategy; avoid reusing legacy `docs-old` worker code unless needed for fallback paths.

3. **UI shell + persistence**  
   - Implement a controller (e.g., `playground.ts`) that mounts the LangShift editor bundle, wires run/reset/save/export buttons, and communicates with the worker.  
   - Reuse the IndexedDB API surface from `docs-old` (`saveDraft`, `loadDraft`, `listDrafts`, `deleteDraft`) but adapt its implementation to TypeScript modules under `pylab/src/storage`.

4. **Command palette & optional sync**  
   - Port the command palette UI (keyboard shortcuts, filtering) from `docs-old/assets/js/palette.js` into `pylab/src/palette`.  
   - Stub GitHub Gist sync in a separate module so it can be enabled post-MVP.

5. **Build & integration pipeline**  
   - Add Vite (or tsup) config under `pylab/` to output ES modules into `../docs/assets/js`.  
   - Create MkDocs macros that transform fenced code blocks into the new custom editor element and inject snippet metadata.  
   - Ensure the service worker and caching strategy include the generated Monaco/Pyodide assets.

6. **Validation & automation**  
   - Extend `npm run build` to compile the editor bundle before running `mkdocs build`.  
   - Add Playwright smoke tests targeting the MkDocs output to verify editor mounting, worker execution, persistence, and command palette shortcuts.

## Target Project Structure

```
mkdocs.yml
requirements.txt
plan.md
pylab/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── components/      # LangShift-derived editor shell, Monaco manager
│   ├── lib/             # CDN helpers, utility functions
│   ├── storage/         # IndexedDB/localForage adapters
│   ├── palette/         # Command palette implementation
│   └── workers/         # Pyodide worker entry
└── dist/                # Build output (gitignored)
docs/
├── assets/
│   ├── css/
│   └── js/              # Generated bundles (pylab-editor.js, pyodide-worker.js, etc.)
├── tutorial/
│   └── 01_intro.md
├── index.md
├── manifest.webmanifest
└── sw.js
specs/001-interactive-python-tutorial/
scripts/
└── deploy-gh-pages.sh
```

## 技术框架 / Tech Stack Snapshot

- **Static site**: Material for MkDocs + `pymdownx.highlight` + `mkdocs-macros-plugin`
- **Editor/runtime**: LangShift Monaco manager + virtualized editor shell + Pyodide loader (refactored for MkDocs)
- **Execution model**: Pyodide in Web Worker with message-based orchestration
- **Persistence**: IndexedDB/localForage, `.py`/`.ipynb` import/export, optional GitHub Gist sync
- **Bundling**: Vite/TypeScript under `pylab/`, outputs ES modules to `docs/assets/js`
- **PWA**: Service worker caches Monaco, Pyodide, and editor bundles for offline use
- **Testing**: `npm run build` + `mkdocs build` + Playwright smoke tests covering editor/worker flows
