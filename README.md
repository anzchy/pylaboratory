read langshift-master repo, and read readme.md and spec.md, I want to use the tech stack in langshift to implement a

 python website with purpose illustrated in readme.md and spec.md, make use of the modules of langshift to run python

 on the web.



# PyLab Interactive Tutorial Site

PyLab is a GitHub Pages–hosted documentation site that turns Markdown-based Python tutorials into an interactive playground. Each code block can be edited, executed in-browser via Pyodide, and saved for future exploration, delivering hands-on practice without leaving the page.

## Highlights

- **Material for MkDocs** presentation with pymdownx enhancements for rich tutorial layouts.
- **LangShift runtime modules** (Monaco + Pyodide managers, CDN failover, virtualized editor shell) repackaged for a static MkDocs build.
- **In-browser execution** stitched through a dedicated Pyodide web worker so long-running snippets do not block the UI.
- **VS Code–style editing** powered by a self-hosted Monaco bundle with keyboard shortcuts and accessibility cues.
- **Learner persistence** through IndexedDB (localForage) plus optional export/import of `.py`/`.ipynb` files and GitHub Gist sync.
- **Offline-ready** experience with a service worker and PWA manifest tuned for tutorial replays on limited connectivity.

## Tech Stack

- **Site generator**: Material for MkDocs with `pymdownx.highlight`, `mkdocs-macros-plugin`, and custom macros that hydrate LangShift-derived editors.
- **Editor core**: Monaco Editor virtualized shell, Monaco manager, and CDN disaster-recovery utilities copied from `langshift-master` and bundled for MkDocs.
- **Python runtime**: Pyodide 0.27.x wrapped in a global loader + execution worker (originates from LangShift’s `PythonEditor` and `UniversalEditor` modules).
- **State & persistence**: IndexedDB via localForage, client-side draft serialization, and `.py`/`.ipynb` import/export bridges.
- **Optional sync**: GitHub OAuth + Gist sync module (deferred until P3 in the spec).
- **Dev & build tooling**: MkDocs CLI, Playwright regression harness, service-worker build scripts, and a lightweight Vite-based bundle step for editor assets.

## Repository Layout

```text
mkdocs.yml
requirements.txt
pylab/
├── src/
│   ├── components/          # Reorganized LangShift editor modules
│   ├── lib/                 # CDN + runtime helpers
│   └── workers/             # Pyodide execution worker entrypoint
├── package.json             # Bundler tooling for editor assets
├── tsconfig.json
docs/
├── index.md
├── tutorial/
│   └── 01_intro.md
├── assets/
│   ├── css/
│   │   └── extra.css
│   └── js/
│       ├── editor.js
│       ├── gist.js
│       ├── init.js
│       ├── pyodide-worker.js
│       ├── runner.js
│       └── storage.js
├── manifest.webmanifest
└── sw.js
scripts/
└── deploy-gh-pages.sh
specs/
└── 001-interactive-python-tutorial/   # Feature design docs (plan, spec, tasks, etc.)
```

## Getting Started

1. **Install prerequisites**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
   ```bash
   cd pylab
   npm install          # installs bundler + LangShift-derived editor deps
   npm run build        # builds Monaco/Pyodide bundles into docs/assets/js
   cd ..
   ```
   ```bash
   cd /Users/jackcheng/Documents/01_Coding/Front-end-projects/pylab
   /opt/homebrew/bin/python3.12 -m venv venv
   source .venv/bin/activate
   pip install -r requirements.txt
   
   which mkdocs
   mkdocs --version
   
   mkdocs serve
   ```
   Remember to activate `.venv` anytime you open a new terminal before working on the project so `mkdocs`, `pip`, etc., are on your path.
2. **Serve the docs locally**
   
   ```bash
   mkdocs serve
   ```
   Navigate to `http://127.0.0.1:8000/` and open the tutorial pages under `/tutorial/`.
3. **Build the static site**
   
   ```bash
   mkdocs build
   ```

## Development Workflow

- Keep all tutorial content in `docs/` and manage navigation through `mkdocs.yml`.
- When updating interactive behavior, modify source files in `pylab/src/` and rebuild; the generated bundles land in `docs/assets/js/` (`runner.js`, `editor.js`, `pyodide-worker.js`, `storage.js`, `gist.js`, `init.js`).
- After implementing a cohesive change, run `mkdocs build` and capture manual validation notes or screenshots. Include those details in the commit body to satisfy the “Transparent Git History” principle.
- Commit frequently with scope-focused messages, then push to the relevant feature branch (e.g., `001-interactive-python-tutorial`).

## How to run test in devlopment process

1. Fetch the Monaco AMD bundle into the repo (only needed once):

`scripts/fetch-monaco.sh`      # populates docs/assets/js/monaco/vs/*

2. Download Pyodide 0.26.1 into docs/assets/js/pyodide/ (as noted in that folder’s README):

   ```
   curl -L https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js \
             -o docs/assets/js/pyodide/pyodide.js
        curl -L https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.asm.js \
             -o docs/assets/js/pyodide/pyodide.asm.js
        curl -L https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.asm.data \
             -o docs/assets/js/pyodide/pyodide.asm.data
        # include any other .data/.wasm files you need for packages
   ```



3. Restart mkdocs serve and re-run Playwright:

```
cd pylab
npm run dev -- --watch   # optional: rebuild editor bundles on change
cd ..

mkdocs serve --dev-addr 127.0.0.1:8000

export PYLAB_BASE_URL=http://127.0.0.1:8000/pylab

npx playwright test --config=tests/playwright.config.ts
```

Once the editor and worker bundles exist, the DOM will render the run/reset/save buttons and the tests will pass.

## Testing & Validation

Playwright regression and accessibility checks are optional but recommended:

```bash
npm install --save-dev playwright @axe-core/playwright
npx playwright install chromium
npx playwright test
```

Manual smoke test steps:

1. Launch `mkdocs serve`.
2. Edit and run the sample snippet on `/tutorial/01_intro/`.
3. Confirm stdout/stderr display, timeout handling, and IndexedDB persistence.
4. Exercise export/import workflows and, if enabled, GitHub Gist sync.

Document the outcomes in `docs/notes/` (see tasks plan) before merging.

## Deployment

Deploy the static site to GitHub Pages using the provided helper:

```bash
DRY_RUN=1 scripts/deploy-gh-pages.sh   # preview build
scripts/deploy-gh-pages.sh             # push to gh-pages
```

Ensure Pyodide and Monaco artifacts remain self-hosted within `docs/assets/` so the site works offline.

## Roadmap

1. **MVP (US1)** – Inline editing and execution with Pyodide worker sandbox and accessible controls.
2. **Persistence (US2)** – Autosave, reset, export/import, and draft management via command palette.
3. **Cross-device sync (US3)** – Optional GitHub OAuth and Gist integration with user-controlled consent.

Additional polishing tasks (performance tuning, accessibility reviews, documentation refreshes) are tracked in `specs/001-interactive-python-tutorial/tasks.md`.

## Contributing

1. Create or switch to a numbered feature branch (e.g., `001-new-feature`).
2. Update the relevant spec/plan/task docs under `specs/`.
3. Implement the change, validate locally, and ensure `mkdocs build` succeeds.
4. Commit with descriptive messages referencing touched files or user stories.
5. Open a pull request describing validation evidence and constitution gate checks.

## License

License details are not yet specified. Add a `LICENSE` file before public release.



## **CDN解决方案说明**



 方案1：使用国内CDN镜像（已配置）✅



 我已经添加了以下国内镜像，按优先级排序：

1. **jsd.onmicrosoft.cn** - jsdelivr中国镜像（最快）
2. **jsd.cdn.zzko.cn** - jsdelivr备用中国镜像
3. jsdelivr国际版（备选）
4. fastly.jsdelivr.net（备选）
5. unpkg.com（备选）



 方案2：自托管到腾讯云COS（如果方案1不行）



 如果国内镜像仍然不稳定，可以自托管Pyodide：



1. **下载Pyodide完整包**：

 \# 下载Pyodide v0.27.0（约150MB）

 wget https://github.com/pyodide/pyodide/releases/download/0.27.0/pyodide-0.27.0.tar.bz2

 tar -xjf pyodide-0.27.0.tar.bz2



2. **上传到腾讯云COS**：

  \- 创建公开读的存储桶

  \- 上传整个 pyodide 文件夹

  \- 获得CDN加速域名（例如：https://your-bucket.cos.ap-guangzhou.myqcloud.com/pyodide）

3. **修改CDN配置**：

 // cdn-disaster-recovery.ts 中添加：

 {

  name: 'tencent-cos',

  baseUrl: 'https://your-bucket.cos.ap-guangzhou.myqcloud.com/pyodide',

  priority: 1 // 设为最高优先级

 }



 方案3：使用国内npm镜像



 也可以通过淘宝/阿里云npm镜像：

 {

  name: 'npmmirror',

  baseUrl: 'https://registry.npmmirror.com/pyodide/0.27.0/files/dist',

  priority: 1

 }



 测试新配置



 刷新浏览器（http://127.0.0.1:8000/），观察Console输出。应该会看到：

 [PyLab] Loading Pyodide from: https://jsd.onmicrosoft.cn/npm/pyodide@0.27.0/dist



 如果第一个镜像失败，会自动尝试下一个，直到找到可用的CDN。



 **需要我帮你配置自托管方案吗？** 如果国内镜像速度仍然不理想，我可以提供详细的腾讯云COS配置步骤。
