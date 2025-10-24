(function () {
  function waitForPyLabEditor(retries, delay) {
    return new Promise(function (resolve, reject) {
      var attempts = 0;
      function check() {
        if (window.PyLabEditor && typeof window.PyLabEditor.mountPlayground === 'function') {
          resolve(window.PyLabEditor);
          return;
        }
        attempts += 1;
        if (attempts > retries) {
          reject(new Error('PyLabEditor not available after waiting'));
          return;
        }
        setTimeout(check, delay);
      }
      check();
    });
  }

  function mountSnippets(PyLabEditor) {
    document.querySelectorAll('.pylab-snippet').forEach(function (el) {
      try {
        var raw = el.getAttribute('data-snippet');
        if (!raw) return;
        var config = JSON.parse(raw);

        console.log('[PyLab] Mounting snippet:', config.id);

        // 调用 mountPlayground 挂载组件
        PyLabEditor.mountPlayground(el, {
          defaultCode: config.defaultCode || '',
          packages: config.packages || [],
          timeoutMs: config.timeoutMs || 5000,
          height: config.height || 320,
        });
      } catch (err) {
        console.error('[PyLab] Failed to mount snippet', err);
      }
    });
  }

  function bootstrap() {
    console.log('[PyLab] Initializing...');
    waitForPyLabEditor(50, 100)
      .then(function (api) {
        console.log('[PyLab] Editor loaded, mounting snippets...');
        mountSnippets(api);
      })
      .catch(function (error) {
        console.warn('[PyLab] Editor bundle not ready:', error.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
