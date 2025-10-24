# Feature Specification: Interactive Python Tutorial Playground

**Feature Branch**: `001-interactive-python-tutorial`  
**Created**: 2025-10-24  
**Status**: Draft  
**Input**: User description: "我想开发一个在线的网站，展示我的 Python tutorial，目前教程用 Markdown 写成，代码用 markdown 的代码 code area 写的。这个网站核心功能是可以在网站上运行 Python 代码，展示结果(类似于 playground，方便读者自己改代码，再运行，）并支持 code snippet 的修改和保存到本地客户端。网站的 tech stack 目前如下：前端/站点： Material for MkDocs（写作友好、文档站效果极佳） 插件：pymdownx.highlight（代码高亮）、mkdocs-macros-plugin（自定义按钮/短代码） 运行器：Pyodide + Web Worker（防止主线程卡顿） 编辑器：Monaco Editor（多文件/提示友好） 持久化：IndexedDB（localForage）+ “导出/导入 .py 或 .ipynb” +（可选）GitHub Gist OAuth UI：每个代码块加“编辑/运行/重置/保存”按钮；顶部有“新建草稿/打开草稿”的命令面板 部署：GitHub Pages（静态产物一键托管）"

## Architecture & Tech Stack

- **Static site generator**: Material for MkDocs with `pymdownx.highlight` and `mkdocs-macros-plugin` for Markdown authoring plus custom shortcodes.
- **Interactive editor bundle**: LangShift-derived Monaco manager, virtualized editor shell, and CDN disaster-recovery utilities packaged inside `pylab/src/components`.
- **Python runtime**: Pyodide 0.27.x orchestrated by a shared loader + execution worker (code lifted from LangShift’s `PythonEditor` and `UniversalEditor`).
- **State & persistence**: IndexedDB (localForage) for autosave, with `.py`/`.ipynb` import/export bridges and optional GitHub Gist sync (P3).
- **Build pipeline**: MkDocs for the documentation site, plus a lightweight Vite/TypeScript toolchain under `pylab/` that compiles the editor bundle into `docs/assets/js`.
- **Offline & accessibility**: Existing service worker + PWA manifest, augmented to cache the generated Monaco/Pyodide assets and retain keyboard-first controls.

## Constitution Alignment Checklist

- [x] Describe how the feature preserves the static MkDocs build (Material theme + required plugins) for GitHub Pages.
- [x] Confirm Pyodide execution stays inside the worker sandbox with defined resource limits.
- [x] Outline the interactive learning affordances (Monaco controls, run/reset/save states, status feedback).
- [x] Capture persistence expectations (IndexedDB autosave, export/import, optional Gist sync).
- [x] Note any offline/accessibility impacts and required updates to `manifest.webmanifest` or `sw.js`.
- [x] Identify how commits will be segmented and what manual validation evidence will accompany them.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Run tutorial code immediately (Priority: P1)

Learner opens a tutorial page, edits the pre-filled snippet, runs it in the browser, and sees the output inline without leaving the page.

**Why this priority**: Immediate feedback is the core promise of the site and unlocks self-guided experimentation for beginners.

**Independent Test**: Serve the site locally, open the “Intro” lesson, edit the sample code, press “Run,” and verify output + status indicator update without errors.

**Acceptance Scenarios**:

1. **Given** the learner is on `/tutorial/01_intro/`, **When** they modify the snippet and click “Run,” **Then** Pyodide executes in the worker and displays stdout/stderr plus a success status.
2. **Given** a long-running snippet, **When** execution exceeds the timeout, **Then** the worker terminates, and the UI reports a timeout with guidance to optimize code.

---

### User Story 2 - Save and restore drafts (Priority: P2)

Learner saves their edits automatically, can reset to tutorial defaults, and can export/import code for continued practice.

**Why this priority**: Persistence encourages longer study sessions and safeguards progress across refreshes or offline access.

**Independent Test**: Edit a snippet, refresh the page, confirm the draft reloads; export to `.py`, clear storage, import the file, and verify the snippet is restored.

**Acceptance Scenarios**:

1. **Given** the learner edits a snippet, **When** they refresh the page, **Then** the draft automatically reloads from IndexedDB.
2. **Given** the learner exports their work as `.ipynb`, **When** they later import the file via the command palette, **Then** the editor populates with the saved content.

---

### User Story 3 - Manage drafts across devices (Priority: P3)

Learner optionally authenticates with GitHub to sync drafts via Gist and can manage drafts through a command palette.

**Why this priority**: Cloud sync is optional but valuable for users switching devices or sharing progress.

**Independent Test**: Toggle Gist sync in a test environment, save a snippet, confirm Gist creation/update, and ensure disabling sync stops remote writes.

**Acceptance Scenarios**:

1. **Given** GitHub OAuth is connected, **When** the learner invokes “Save to Gist,” **Then** the worker posts the snippet to a private Gist and surfaces the link.
2. **Given** sync is disabled, **When** the learner saves a snippet, **Then** only local IndexedDB is touched, and no network requests are issued.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Pyodide fails to load because of offline-first service worker → display cached fallback message and provide retry option.
- Learner’s browser blocks IndexedDB (private mode) → fall back to in-memory storage with warning banner.
- Monaco assets fail to load → degrade to read-only code block with instructions to reload.
- Gist OAuth revoked mid-session → handle 401 from GitHub, prompt user to re-authenticate, avoid data loss.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Site MUST render via Material for MkDocs with the required plugins enabled while hydrating LangShift-derived editors built from `pylab/src`.
- **FR-002**: Tutorials MUST expose runnable Python blocks powered by Pyodide inside the web worker.
- **FR-003**: Learners MUST be able to edit, run, reset, and save code within Monaco-backed editors.
- **FR-004**: Session state MUST persist to IndexedDB and allow `.py`/`.ipynb` import-export without data loss.
- **FR-005**: Offline and accessibility behaviors MUST remain intact (service worker, manifest, keyboard support).
- **FR-006**: GitHub Gist OAuth MUST be optional and disabled by default, surfacing clear consent UI before any network call.
- **FR-007**: Command palette MUST include “New draft,” “Open draft,” “Export code,” and “Import code” actions regardless of connectivity.
- **FR-008**: Worker MUST expose execution timeout controls defaulting to 5 seconds, configurable per lesson in frontmatter.
- **FR-009**: Editor assets MUST be bundled via the `pylab` build step (Vite/TypeScript) and emitted to `docs/assets/js` with hashed filenames for cache busting.

### Key Entities *(include if feature involves data)*

- **Lesson**: Markdown document with frontmatter metadata (slug, title, prerequisites, required packages, default snippets).
- **CodeSnippet**: Executable code block tied to a lesson, with default code, metadata (language, exec timeout), and UI configuration.
- **Draft**: Learner-edited version stored in IndexedDB with fields for snippet id, code content, execution history, timestamp, and optional gist id.
- **GistSyncConfig**: OAuth token, gist id, consent flags; used only if sync enabled.
- **ExecutionResult**: Structured record emitted by the worker including stdout, stderr, status, execution time, and error payload (if any).
- **EditorBundle**: Compiled JavaScript assets sourced from LangShift modules, versioned and injected into MkDocs templates.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Learners run the sample code within 5 seconds of first focusing the editor on a cold browser session.
- **SC-002**: Offline re-open succeeds after assets are cached by the service worker, including Pyodide + Monaco bundles.
- **SC-003**: Keyboard-only execution of the tutorial flow completes without trapping focus or requiring a mouse.
- **SC-004**: At least 90% of polled beta users report that saving and restoring drafts is intuitive after one attempt.
