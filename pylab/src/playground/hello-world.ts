import { PyLabRuntimeController } from '../components/runtime-controller'

interface PlaygroundOptions {
  code?: string
  packages?: string[]
  timeoutMs?: number
}

interface PlaygroundInstance {
  run: () => void
  dispose: () => void
}

export function mountHelloWorldPlayground(
  container: HTMLElement,
  options: PlaygroundOptions = {}
): PlaygroundInstance {
  const controller = new PyLabRuntimeController()
  const code = options.code ?? 'print("Hello World")'
  const packages = options.packages ?? []
  const timeoutMs = options.timeoutMs

  container.classList.add('pylab-demo-playground')

  const textarea = document.createElement('textarea')
  textarea.className = 'pylab-demo-editor'
  textarea.value = code
  textarea.style.cssText = 'width:100%;height:180px;font-family:monospace;font-size:14px;padding:0.75rem;'

  const runButton = document.createElement('button')
  runButton.textContent = 'Run Python'
  runButton.className = 'pylab-demo-run'
  runButton.style.cssText = 'margin-top:0.75rem;padding:0.5rem 1rem;font-size:0.9rem;'

  const status = document.createElement('div')
  status.className = 'pylab-demo-status'
  status.textContent = 'Ready'
  status.style.cssText = 'margin-top:0.5rem;font-size:0.85rem;color:#475569;'

  const outputPre = document.createElement('pre')
  outputPre.className = 'pylab-demo-output'
  outputPre.textContent = '(no output yet)'
  outputPre.style.cssText = 'margin-top:0.75rem;padding:0.75rem;background:#0f172a;color:#e2e8f0;border-radius:0.5rem;min-height:80px;overflow:auto;'

  container.appendChild(textarea)
  container.appendChild(runButton)
  container.appendChild(status)
  container.appendChild(outputPre)

  let running = false

  const run = () => {
    if (running) return
    running = true
    runButton.disabled = true
    status.textContent = 'Running...'
    outputPre.textContent = ''

    controller
      .execute({
        code: textarea.value,
        packages,
        timeoutMs
      })
      .then((response) => {
        const { status: resultStatus, stdout, stderr, elapsedMs } = response
        running = false
        runButton.disabled = false

        if (resultStatus === 'success') {
          status.textContent = `Success in ${elapsedMs} ms`
        } else if (resultStatus === 'timeout') {
          status.textContent = `Timed out after ${elapsedMs} ms`
        } else {
          status.textContent = 'Execution failed'
        }

        const combined = [stdout, stderr].filter(Boolean).join('\n')
        outputPre.textContent = combined || '(no output)'
      })
      .catch((error) => {
        running = false
        runButton.disabled = false
        status.textContent = 'Execution failed'
        outputPre.textContent = error?.message ?? String(error)
      })
  }

  runButton.addEventListener('click', run)

  return {
    run,
    dispose: () => {
      controller.terminate()
      runButton.removeEventListener('click', run)
      container.innerHTML = ''
    }
  }
}
