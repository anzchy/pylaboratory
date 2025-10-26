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

Use fenced Python blocks with metadata so the macro can upgrade them into playgrounds:

````markdown
```python packages=["numpy"] timeout=8000
import numpy as np

def fibonacci(n):
    series = [0, 1]
    for _ in range(2, n):
        series.append(series[-1] + series[-2])
    return np.array(series)

print(fibonacci(10))
```
````

The macro plugin automatically renders:
- An editable code pane with Run/Reset controls
- Execution status and console output
- Automatic package loading based on the `packages=[...]` metadata

#### Multiple Modules Example

When a snippet needs more than one package, list them all in the metadata:

````markdown
```python packages=["pandas", "numpy"] timeout=8000 height=420
import pandas as pd
import numpy as np

df = pd.DataFrame(np.random.randn(5, 3), columns=["A", "B", "C"])
print(df.describe())
```
````

Parameters:
- `packages`: JSON-style list of Pyodide packages to preload (empty list if none).
- `timeout`: Execution timeout in milliseconds (default `5000`).
- `height`: Editor height in pixels (default `320`).

> **Tip:** After adding or changing packages in Markdown, run\
> `bash scripts/download-pyodide.sh` to refresh the offline wheels before `mkdocs serve` or deployment.

## 如何更新 Tutorials

### 1. 更新导航菜单 (TOC)

**控制 TOC 的文件：`mkdocs.yml`**

在第 3-7 行的 `nav:` 部分，手动添加新的 markdown 文件：

```yaml
nav:
  - Home: index.md
  - Tutorials:
      - Hello World: tutorial/01_intro.md
      - Python Framework: tutorial/02_python_framework.md
      - Snippet Demo: tutorial/02_snippet_demo.md
```

每次添加新的 tutorial 文件，都要在 `mkdocs.yml` 的 `nav:` 部分添加对应的条目。

### 2. 在 Markdown 中添加交互式代码块

创建或编辑 `docs/tutorial/` 下的 `.md` 文件，使用 Python 代码块的元数据语法：

```markdown
```python height=150 timeout=8000 packages=[]
print(f"2 + 3 = {2 + 3}")
print(f"5 - 4 = {5 - 4}")
print(f"2 * 3 = {2 * 3}")
print(f"8 / 2 = {8 / 2}")
```
```

### 3. 代码块元数据参数说明

| 参数 | 说明 | 默认值 | 单位 | 是否必需 |
|-----|------|--------|------|---------|
| `height` | 代码编辑器窗口高度 | 320 | px (像素) | ❌ |
| `timeout` | 代码执行超时时间 | 5000 | ms (毫秒) | ❌ |
| `packages` | 预加载的 Python 包列表 | [] | JSON 数组 | ✅ |
| `id` | 代码片段的唯一标识符 | 自动生成 | - | ❌ |

**重要：** 至少需要一个参数（如 `packages=[]` 或 `height=320`），代码块才会转换成交互式播放器。不带参数的代码块会显示为普通代码块。

### 4. 使用示例

#### 小代码块（150px 高）
```markdown
```python height=150 packages=[]
print("Hello World")
```
```

#### 中等代码块（300px，加载 numpy）
```markdown
```python height=300 timeout=10000 packages=["numpy"]
import numpy as np
arr = np.array([1, 2, 3, 4, 5])
print(f"Array: {arr}")
print(f"Sum: {np.sum(arr)}")
```
```

#### 大代码块（500px，加载多个包）
```markdown
```python height=500 timeout=15000 packages=["numpy", "pandas"]
import numpy as np
import pandas as pd

data = {"A": [1, 2, 3], "B": [4, 5, 6]}
df = pd.DataFrame(data)
print(df.describe())
```
```

### 5. 推荐的高度值

| 场景 | 推荐高度 |
|------|---------|
| 单行简单代码 | 100-150px |
| 2-5 行代码 | 200-300px |
| 5-10 行代码 | 300-400px |
| 10+ 行代码 | 400-600px |
| 复杂函数/类定义 | 600-800px |

### 6. 代码控制流程

```
编辑 .md 文件
    ↓
mkdocs build 运行时
    ↓
macros/pylab_macros.py 解析元数据
    ↓ 提取 height、timeout、packages 等参数
    ↓
生成 HTML 占位符：<div class="pylab-snippet" data-snippet='{"height": 150, ...}'>
    ↓
部署到网站
    ↓
浏览器加载 init.js
    ↓
init.js 调用 mountPlayground() 挂载 React 组件
    ↓
playground-new.tsx 应用 height: ${height}px 样式
    ↓
编辑器显示为指定高度
```

### 7. 高度代码位置

- **Markdown 宏处理器：** `macros/pylab_macros.py` 第 116、175 行
  ```python
  height = int(meta.get("height", 320))  # 默认 320px
  ```

- **React 组件：** `pylab/src/components/playground-new.tsx`
  ```typescript
  style={{ height: `${height}px`, borderBottom: '1px solid #e0e0e0' }}
  ```

### 8. 工作流程

```bash
# 1. 编辑 markdown 文件
nano docs/tutorial/my_tutorial.md

# 2. 添加到 mkdocs.yml nav 部分
nano mkdocs.yml

# 3. 本地测试
mkdocs serve

# 4. 如果加入新的 packages，下载离线文件
bash scripts/download-pyodide.sh

# 5. 提交并推送（GitHub Actions 会自动构建和部署）
git add .
git commit -m "docs: add new tutorial"
git push origin master
```



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
- [LangShift](https://github.com/anzchy/langshift) - Runtime logic and CDN disaster recovery
- Claude Cli assisstance
- Codex Cli assisstance

These reference directories are excluded from version control.
