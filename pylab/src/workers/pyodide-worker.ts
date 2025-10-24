/// <reference lib="webworker" />

const PYODIDE_VERSION = '0.27.0'
const DEFAULT_TIMEOUT_MS = 5000

interface ExecuteMessage {
  type: 'execute'
  requestId: string
  code: string
  packages?: string[]
  timeoutMs?: number
}

interface WarmupMessage {
  type: 'warmup'
}

type WorkerMessage = ExecuteMessage | WarmupMessage

let pyodideReady: Promise<any> | null = null

async function loadPyodideRuntime() {
  if (!pyodideReady) {
    pyodideReady = (async () => {
      const cdnBase = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`
      try {
        importScripts(`${cdnBase}pyodide.js`)
        const instance = await (self as any).loadPyodide({
          indexURL: cdnBase,
          fullStdLib: false
        })
        return instance
      } catch (error) {
        console.error('[PyLab Worker] Failed to load Pyodide from CDN', error)
        throw error
      }
    })()
  }
  return pyodideReady
}

async function handleExecute(message: ExecuteMessage) {
  const { requestId, code, packages = [], timeoutMs = DEFAULT_TIMEOUT_MS } = message
  const pyodide = await loadPyodideRuntime()

  let stdout = ''
  let stderr = ''

  const stdoutWriter = (text: string) => {
    stdout += text
  }
  const stderrWriter = (text: string) => {
    stderr += text
  }

  const start = performance.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    pyodide.setStdout({ batched: stdoutWriter })
    pyodide.setStderr({ batched: stderrWriter })

    if (packages.length > 0) {
      await pyodide.loadPackage(packages)
    }

    await Promise.race([
      pyodide.runPythonAsync(code),
      new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => reject(new Error('Execution timed out')))
      })
    ])

    postMessage({
      requestId,
      status: 'success',
      stdout: stdout.trimEnd(),
      stderr: stderr.trimEnd(),
      elapsedMs: Math.round(performance.now() - start)
    })
  } catch (error: any) {
    const isTimeout = error?.message?.includes('timed out') || error?.name === 'AbortError'
    postMessage({
      requestId,
      status: isTimeout ? 'timeout' : 'error',
      stdout: stdout.trimEnd(),
      stderr: (stderr + (error?.message ?? String(error))).trimEnd(),
      elapsedMs: Math.round(performance.now() - start)
    })
  } finally {
    clearTimeout(timeout)
    pyodide.setStdout()
    pyodide.setStderr()
  }
}

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const data = event.data
  if (data?.type === 'warmup') {
    loadPyodideRuntime()
      .then(() => postMessage({ type: 'warmup', status: 'ready' }))
      .catch((error) => postMessage({ type: 'warmup', status: 'error', message: error?.message ?? String(error) }))
    return
  }

  if (data?.type === 'execute') {
    handleExecute(data).catch((error) => {
      postMessage({
        requestId: data.requestId,
        status: 'error',
        stdout: '',
        stderr: error?.message ?? String(error),
        elapsedMs: 0
      })
    })
  }
})
