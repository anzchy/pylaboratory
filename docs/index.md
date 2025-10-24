# PyLab Hello World Demo

在构建脚手架完成后，可以运行下方按钮来执行一个 `print("Hello World")` 示例。  
> 在执行 `mkdocs serve` 前，请先进入 `pylab/` 目录运行 `npm run build` 生成 `assets/js/pylab-editor.js`。

<div id="pylab-hello-demo" class="pylab-demo-container"></div>

<script>
  document.addEventListener('DOMContentLoaded', function () {
    const api = window.PyLabEditor || {};
    const target = document.getElementById('pylab-hello-demo');
    if (!target) return;

    if (typeof api.mountPlayground === 'function') {
      api.mountPlayground(target, {
        defaultCode: 'print("Hello World")',
        showOutput: true,
        height: 260
      });
    } else if (typeof api.mountHelloWorldPlayground === 'function') {
      api.mountHelloWorldPlayground(target);
    } else {
      console.warn('[PyLab] Editor bundle not loaded yet. Run `npm run build` inside pylab/.');
    }
  });
</script>
