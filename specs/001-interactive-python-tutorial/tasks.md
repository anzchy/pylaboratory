# 开发任务清单

## 阶段 1：初始化 LangShift 模块移植
- [x] 在 `pylab/` 目录内初始化 Node/Vite 项目脚手架，提交基础 `package.json`、`tsconfig.json`、`vite.config.ts`。  
- [x] 从 `langshift-master/components` 和 `langshift-master/lib` 复制所需 Monaco / Pyodide 管理模块到 `pylab/src/components` 与 `pylab/src/lib`，去除 Next.js 特定依赖。  
- [x] 为核心模块编写导出入口（如 `pylab/src/index.ts`），提供无框架的挂载 API。

## 阶段 2：Web Worker 执行管线
- [x] 在 `pylab/src/workers/` 构建 `pyodide-worker.ts`，复用 LangShift 的 Pyodide 管理逻辑并实现消息协议。  
- [x] 编写主线程运行器（`pylab/src/components/runtime-controller.ts`），负责与 worker 通信、处理 stdout/stderr、超时状态。

> **近期目标（MVP：浏览器运行 Hello World）**  
>  - 完成任务 4 与 5，确保 Pyodide worker 与主线程控制器联通。  
>  - 在 MkDocs 页面中引入最小测试脚本，能执行 `print("Hello World")` 并展示输出。  
>  - [ ] 验证首页 demo 按钮成功运行 “Hello World”。

## 阶段 3：编辑器 UI 与持久化
- [x] 实现 `pylab/src/components/playground.ts`，封装 LangShift 虚拟化编辑器、运行/重置/保存操作。  
7. 将 `docs-old` IndexedDB API 重写为 TypeScript（`pylab/src/storage/indexed-db.ts`），并贯通至 UI 控制器。  
8. 移植命令面板逻辑至 `pylab/src/palette/command-palette.ts`，接入草稿管理、导入/导出功能。

## 阶段 4：构建与 MkDocs 集成
9. 在 `pylab/package.json` 添加 `build`、`dev`、`lint` 脚本，确保产物输出到 `../docs/assets/js/`。  
10. 编写 MkDocs 宏（`docs/macros/pylab.py` 或同等插件）以在 Markdown 代码块中注入编辑器占位符。  
11. 更新 `sw.js` 和 `manifest.webmanifest`，缓存新的编辑器及 Pyodide 资源。

## 阶段 5：测试与交付
12. 撰写 Playwright 用例覆盖 US1 与 US2（运行 + 持久化），路径建议 `tests/us1-inline-execution.spec.ts`。  
13. 在 README 与 spec 中记录验证步骤，执行 `npm run build`、`mkdocs build`、Playwright 测试。  
14. 编制发布说明：整理验证证据、截图，准备推送到 GitHub Pages。
