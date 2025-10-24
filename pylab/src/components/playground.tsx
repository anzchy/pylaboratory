import React, { useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { VirtualizedEditor } from './virtualized-editor'
import { PyLabRuntimeController } from './runtime-controller'

export interface PlaygroundProps {
  defaultCode: string
  packages?: string[]
  timeoutMs?: number
  height?: number
  readOnly?: boolean
  showOutput?: boolean
  theme?: 'vs-light' | 'vs-dark'
  onRunComplete?: (result: { status: string; stdout: string; stderr: string; elapsedMs: number }) => void
}

const DEFAULT_HEIGHT = 320

function PlaygroundComponent({
  defaultCode,
  packages = [],
  timeoutMs,
  height = DEFAULT_HEIGHT,
  readOnly = false,
  showOutput = true,
  theme = 'vs-light',
  onRunComplete
}: PlaygroundProps) {
  const [code, setCode] = useState(defaultCode)
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error' | 'timeout'>('idle')
  const [output, setOutput] = useState('(no output)')
  const [isRunning, setIsRunning] = useState(false)

  const controller = useMemo(() => new PyLabRuntimeController(), [])

  useEffect(() => {
    return () => controller.terminate()
  }, [controller])

  const runCode = () => {
    if (isRunning) return
    setIsRunning(true)
    setStatus('running')
    setOutput('')

    controller
      .execute({ code, packages, timeoutMs })
      .then((response) => {
        const { status: resultStatus, stdout, stderr, elapsedMs } = response
        setStatus(resultStatus as typeof status)
        setIsRunning(false)

        if (resultStatus === 'success') {
          setOutput(stdout || '(no output)')
        } else if (resultStatus === 'timeout') {
          setOutput(stderr || 'Execution timed out')
        } else {
          setOutput(stderr || 'Execution failed')
        }

        onRunComplete?.({ status: resultStatus, stdout, stderr, elapsedMs })
      })
      .catch((error) => {
        setIsRunning(false)
        setStatus('error')
        setOutput(error?.message ?? String(error))
      })
  }

  const resetCode = () => {
    setCode(defaultCode)
    setStatus('idle')
    setOutput('(no output)')
  }

  return (
    <div className="pylab-playground">
      <div className="pylab-toolbar">
        <button type="button" onClick={runCode} disabled={isRunning} className="pylab-btn pylab-btn-run">
          {isRunning ? 'Running…' : 'Run'}
        </button>
        <button type="button" onClick={resetCode} disabled={isRunning || readOnly} className="pylab-btn">
          Reset
        </button>
        <span className={`pylab-status pylab-status-${status}`}>{status === 'idle' ? 'Ready' : status}</span>
      </div>

      <VirtualizedEditor
        language="python"
        value={code}
        onChange={(value) => setCode(value ?? '')}
        height={height}
        options={{ readOnly }}
        theme={theme}
      />

      {showOutput && (
        <div className="pylab-output">
          <div className="pylab-output-title">Output</div>
          <pre className="pylab-output-body">{output}</pre>
        </div>
      )}
    </div>
  )
}

export function mountPlayground(container: HTMLElement, props: PlaygroundProps): { dispose: () => void } {
  const root = ReactDOM.createRoot(container)
  root.render(
    <React.StrictMode>
      <PlaygroundComponent {...props} />
    </React.StrictMode>
  )

  return {
    dispose: () => root.unmount()
  }
}

export { PlaygroundComponent as Playground }
