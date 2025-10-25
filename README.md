# PyLab - Interactive Python Tutorial Platform

An interactive Python learning platform built with MkDocs and Pyodide, enabling users to learn and execute Python code directly in the browser.

## Features

- 🚀 **Browser-based Python Execution** - Run Python code without installation using Pyodide
- 📝 **Interactive Code Snippets** - Edit and execute code examples in real-time
- 🎨 **Clean UI** - Simple textarea-based editor with Run/Reset/Save buttons
- 🌐 **CDN Disaster Recovery** - Automatic fallback to China mirrors for better accessibility
- 📚 **MkDocs Integration** - Easy content authoring with Markdown

## Tech Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Python Runtime**: Pyodide (v0.27.0)
- **Documentation**: MkDocs with Material theme
- **Code Transformation**: mkdocs-macros-plugin

## Project Structure

```
pylaboratory/
├── docs/                    # MkDocs documentation source
│   ├── assets/
│   │   ├── css/            # Styles
│   │   └── js/             # Built JavaScript bundles
│   ├── index.md            # Home page
│   └── tutorial/           # Tutorial pages
├── pylab/                   # React editor components
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/            # CDN utilities
│   │   └── workers/        # Web workers (currently unused)
│   ├── package.json
│   └── vite.config.ts
├── macros/                  # MkDocs macro plugin
│   └── pylab_macros.py     # Code snippet transformer
├── mkdocs.yml              # MkDocs configuration
└── requirements.txt        # Python dependencies

```

## Quick Start

### 1. Install Dependencies

**Python dependencies:**
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**Node.js dependencies:**
```bash
cd pylab
npm install
```

### 2. Build Editor Bundle

```bash
cd pylab
npm run build
```

This generates `docs/assets/js/pylab-editor.js`

### 3. Run Development Server

```bash
# From project root
mkdocs serve --dev-addr 127.0.0.1:8000
```

Visit http://127.0.0.1:8000

## Usage

### Creating Interactive Snippets

In your Markdown files, use Python code blocks with the `pylab` language:

````markdown
```pylab
import numpy as np

def fibonacci(n):
    series = [0, 1]
    for _ in range(2, n):
        series.append(series[-1] + series[-2])
    return np.array(series)

print(fibonacci(10))
```
````

The macro plugin automatically transforms these into interactive playgrounds with:
- Editable code area
- Run button to execute code
- Reset button to restore original code
- Save button (localStorage - to be implemented)
- Status display
- Output console

### Custom Configuration

You can customize snippet behavior:

````markdown
```pylab packages=numpy,pandas timeout=10000 height=400
# Your code here
```
````

Parameters:
- `packages`: Comma-separated list of packages to preload
- `timeout`: Execution timeout in milliseconds (default: 5000)
- `height`: Editor height in pixels (default: 320)

## CDN Configuration & Offline Support

The platform uses multiple CDN mirrors for reliability:

**CDN Priority (Pyodide v0.27.0):**
1. **Local/GitHub** - Repository-hosted Pyodide files (priority 0)
2. **unpkg.zhimg.com** - 知乎镜像 (priority 1)
3. **npm.elemecdn.com** - 饿了么CDN (priority 2)
4. **unpkg.com** - 原版unpkg (priority 3)
5. **jsd.onmicrosoft.cn** - jsdelivr中国镜像 (priority 4)
6. **cdn.jsdelivr.net** - jsdelivr国际 (priority 5)

The system automatically tries CDNs in order until one succeeds.

### Offline Setup (Optional)

To enable offline Pyodide support (runtime + any packages referenced in Markdown demos), run:

```bash
bash scripts/download-pyodide.sh
```

What the script does:
- Syncs the Pyodide 0.27.0 runtime (`pyodide.mjs`, `pyodide.asm.wasm`, stdlib, type defs, etc.) into `docs/assets/pyodide/`.
- Parses all fenced Python snippets in `docs/**/*.md`, looks at the `packages=[...]` metadata, and downloads the matching wheels (plus dependencies) listed in `pyodide-lock.json`.

Once downloaded:
- The site works without internet connection
- Faster load times for repeated visits
- No CDN dependency issues

**File Size:** ~100MB (mainly for `pyodide.asm.wasm`)

**When adding new packages to docs:** update the Markdown code block (e.g. `packages=["pandas"]`), then re-run `bash scripts/download-pyodide.sh` so the required wheels are bundled before `mkdocs serve` or deployment.

## Development

### File Structure

**Key Files:**
- `pylab/src/components/playground-new.tsx` - Main playground component
- `pylab/src/lib/cdn-disaster-recovery.ts` - CDN fallback logic
- `macros/pylab_macros.py` - Markdown code block transformer
- `docs/assets/js/init.js` - Playground initialization

### Build Commands

```bash
# Build editor bundle
cd pylab && npm run build

# Run MkDocs dev server
mkdocs serve

# Build static site
mkdocs build
```

## License

MIT

## Acknowledgments

This project was inspired by and references code from:
- [LangShift](https://github.com/example/langshift) - Runtime logic and CDN disaster recovery
- [docs-old](./docs-old) - UI design reference

These reference directories are excluded from version control.
