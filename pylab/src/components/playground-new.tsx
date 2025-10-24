import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { getPyodideCDN } from '../lib/cdn-disaster-recovery'

interface PlaygroundProps {
  defaultCode: string
  packages?: string[]
  timeoutMs?: number
  height?: number
}

// 简单的代码编辑器（不依赖 Monaco）
function SimpleCodeEditor({
  value,
  onChange,
  height,
  readOnly
}: {
  value: string
  onChange: (value: string) => void
  height: number
  readOnly: boolean
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      style={{
        width: '100%',
        height: `${height}px`,
        padding: '12px',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
        fontSize: '14px',
        lineHeight: '1.5',
        border: 'none',
        outline: 'none',
        resize: 'none',
        backgroundColor: '#f8f9fa',
        color: '#24292e'
      }}
      spellCheck={false}
    />
  )
}

// 全局 Pyodide 管理器
class PyodideManager {
  private static instance: PyodideManager
  private pyodide: any = null
  private isLoading = false
  private loadPromise: Promise<any> | null = null
  private subscribers: Set<(pyodide: any) => void> = new Set()

  private constructor() {}

  static getInstance(): PyodideManager {
    if (!PyodideManager.instance) {
      PyodideManager.instance = new PyodideManager()
    }
    return PyodideManager.instance
  }

  async getPyodide(): Promise<any> {
    if (this.pyodide) {
      return this.pyodide
    }

    if (this.loadPromise) {
      return this.loadPromise
    }

    this.isLoading = true
    this.loadPromise = this.loadPyodide()

    try {
      this.pyodide = await this.loadPromise
      this.subscribers.forEach(callback => callback(this.pyodide))
      return this.pyodide
    } catch (error) {
      this.loadPromise = null
      this.isLoading = false
      throw error
    } finally {
      this.isLoading = false
    }
  }

  private async loadPyodide(): Promise<any> {
    // 加载 Pyodide script
    if (!(globalThis as any).loadPyodide) {
      const healthyCDN = await getPyodideCDN()
      const script = document.createElement('script')
      script.src = `${healthyCDN}/pyodide.js`
      script.async = true

      await new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    try {
      const healthyCDN = await getPyodideCDN()
      console.log(`[PyLab] Loading Pyodide from: ${healthyCDN}`)

      const pyodideInstance = await (globalThis as any).loadPyodide({
        indexURL: healthyCDN,
        fullStdLib: false
      })

      console.log('[PyLab] Pyodide loaded successfully')
      return pyodideInstance
    } catch (error) {
      console.error('[PyLab] Pyodide initialization failed:', error)
      throw error
    }
  }

  subscribe(callback: (pyodide: any) => void): () => void {
    this.subscribers.add(callback)

    if (this.pyodide) {
      callback(this.pyodide)
    }

    return () => {
      this.subscribers.delete(callback)
    }
  }

  isPyodideLoading(): boolean {
    return this.isLoading
  }

  isPyodideReady(): boolean {
    return this.pyodide !== null
  }
}

const pyodideManager = PyodideManager.getInstance()

export function Playground({
  defaultCode,
  packages = [],
  timeoutMs = 5000,
  height = 320
}: PlaygroundProps) {
  const [code, setCode] = useState(defaultCode)
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'running' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('Ready')
  const [pyodide, setPyodide] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 订阅 Pyodide 实例
  useEffect(() => {
    if (!isClient) return

    const unsubscribe = pyodideManager.subscribe((pyodideInstance) => {
      setPyodide(pyodideInstance)
      setStatus('idle')
      setStatusMessage('Ready')
    })

    if (!pyodideManager.isPyodideReady() && !pyodideManager.isPyodideLoading()) {
      setStatus('loading')
      setStatusMessage('Loading Python runtime...')
      pyodideManager.getPyodide().catch((err) => {
        console.error('[PyLab] Pyodide initialization failed:', err)
        setStatus('error')
        setStatusMessage('Failed to load Python runtime')
      })
    }

    return unsubscribe
  }, [isClient])

  const runCode = async () => {
    if (!pyodide || !code.trim()) return

    // 取消之前的执行
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setStatus('running')
    setStatusMessage('Executing...')
    setOutput('')

    const startTime = performance.now()

    try {
      // 加载需要的包
      if (packages.length > 0) {
        await pyodide.loadPackagesFromImports(code, {
          messageCallback: (msg: string) => console.log('[PyLab]', msg),
          errorCallback: (msg: string) => console.error('[PyLab]', msg)
        })
      }

      // 设置输出捕获
      pyodide.runPython(`
import sys
import io

class StringIO:
    def __init__(self):
        self.buffer = []

    def write(self, text):
        self.buffer.append(text)

    def getvalue(self):
        return ''.join(self.buffer)

output_capture = StringIO()
sys.stdout = output_capture
sys.stderr = output_capture
      `)

      // 执行代码（带超时）
      const executePromise = Promise.race([
        (async () => {
          pyodide.runPython(code)
          const result = pyodide.runPython('output_capture.getvalue()')
          return result
        })(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Execution timed out')), timeoutMs)
        })
      ])

      if (signal.aborted) {
        throw new Error('Execution cancelled')
      }

      const result = await executePromise
      const elapsedMs = Math.round(performance.now() - startTime)

      setOutput(result || '(no output)')
      setStatus('success')
      setStatusMessage(`Completed in ${elapsedMs} ms`)

    } catch (error: any) {
      const elapsedMs = Math.round(performance.now() - startTime)
      const errorMessage = error?.message ?? String(error)

      if (errorMessage.includes('timed out')) {
        setStatus('error')
        setStatusMessage(`Timed out after ${timeoutMs} ms`)
      } else if (errorMessage.includes('cancelled')) {
        setStatus('idle')
        setStatusMessage('Cancelled')
      } else {
        setStatus('error')
        setStatusMessage(`Error after ${elapsedMs} ms`)
      }

      setOutput(errorMessage)
    } finally {
      // 重置标准输出
      try {
        pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__')
      } catch (e) {
        console.error('[PyLab] Failed to reset stdout/stderr:', e)
      }
    }
  }

  const resetCode = () => {
    setCode(defaultCode)
    setOutput('')
    setStatus('idle')
    setStatusMessage('Snippet reset to defaults')
  }

  const saveCode = () => {
    // TODO: 实现保存到 localStorage
    setStatus('idle')
    setStatusMessage('Draft saved locally')
  }

  const isLoading = status === 'loading'
  const isRunning = status === 'running'
  const canRun = pyodide && !isRunning && !isLoading

  return (
    <div
      className="pylab-playground"
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
    >
      {/* Toolbar */}
      <div
        className="pylab-toolbar"
        style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          alignItems: 'center'
        }}
      >
        <button
          onClick={runCode}
          disabled={!canRun}
          style={{
            padding: '6px 16px',
            backgroundColor: canRun ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: canRun ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
        <button
          onClick={resetCode}
          disabled={isRunning}
          style={{
            padding: '6px 16px',
            backgroundColor: isRunning ? '#ccc' : '#757575',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          Reset
        </button>
        <button
          onClick={saveCode}
          disabled={isRunning}
          style={{
            padding: '6px 16px',
            backgroundColor: isRunning ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          Save
        </button>
        <div
          className="pylab-status"
          style={{
            marginLeft: 'auto',
            fontSize: '13px',
            color: status === 'error' ? '#d32f2f' : status === 'success' ? '#388e3c' : '#666'
          }}
        >
          {statusMessage}
        </div>
      </div>

      {/* Editor */}
      <div style={{ height: `${height}px`, borderBottom: '1px solid #e0e0e0' }}>
        <SimpleCodeEditor
          value={code}
          onChange={(value) => setCode(value)}
          height={height}
          readOnly={isRunning}
        />
      </div>

      {/* Output */}
      <div
        className="pylab-output"
        style={{
          padding: '12px',
          backgroundColor: '#263238',
          color: '#e0e0e0',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
          fontSize: '13px',
          minHeight: '80px',
          maxHeight: '200px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {output || '(output will appear here)'}
      </div>
    </div>
  )
}

export function mountPlayground(container: HTMLElement, config: PlaygroundProps) {
  const root = ReactDOM.createRoot(container)
  root.render(React.createElement(Playground, config))

  return {
    dispose: () => {
      root.unmount()
    }
  }
}
