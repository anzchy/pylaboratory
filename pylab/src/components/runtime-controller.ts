import PyodideWorker from '../workers/pyodide-worker.ts?worker'

export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'timeout'

interface ExecuteRequest {
  code: string
  packages?: string[]
  timeoutMs?: number
}

interface ExecuteResponse {
  requestId: string
  status: ExecutionStatus | 'success' | 'error' | 'timeout'
  stdout: string
  stderr: string
  elapsedMs: number
}

export class PyLabRuntimeController {
  private worker: Worker | null = null
  private pending = new Map<string, (response: ExecuteResponse) => void>()

  constructor() {
    if (typeof window !== 'undefined') {
      this.worker = new PyodideWorker()
      this.worker.addEventListener('message', this.handleWorkerMessage)
      this.worker.postMessage({ type: 'warmup' })
    }
  }

  execute({ code, packages = [], timeoutMs }: ExecuteRequest): Promise<ExecuteResponse> {
    if (!this.worker) {
      return Promise.reject(new Error('Pyodide worker is not available'))
    }

    const supportsUUID =
      typeof globalThis.crypto !== 'undefined' &&
      typeof globalThis.crypto.randomUUID === 'function'

    const requestId = supportsUUID
      ? `req-${globalThis.crypto.randomUUID()}`
      : `req-${Date.now()}-${Math.random().toString(16).slice(2)}`

    return new Promise((resolve) => {
      this.pending.set(requestId, resolve)
      this.worker?.postMessage({
        type: 'execute',
        requestId,
        code,
        packages,
        timeoutMs
      })
    })
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate()
      this.worker.removeEventListener('message', this.handleWorkerMessage)
      this.worker = null
      this.pending.clear()
    }
  }

  private handleWorkerMessage = (event: MessageEvent<ExecuteResponse | any>) => {
    const data = event.data
    if (!data?.requestId) {
      return
    }

    const resolver = this.pending.get(data.requestId)
    if (resolver) {
      resolver(data as ExecuteResponse)
      this.pending.delete(data.requestId)
    }
  }
}
