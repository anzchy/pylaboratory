import { useEffect, useState } from 'react'
import { loader } from '@monaco-editor/react'
import { getMonacoEditorCDN } from '../lib/cdn-disaster-recovery'

class MonacoManager {
  private static instance: MonacoManager
  private isInitialized = false
  private initPromise: Promise<void> | null = null
  private subscribers = new Set<() => void>()

  private constructor() {}

  static getInstance(): MonacoManager {
    if (!MonacoManager.instance) {
      MonacoManager.instance = new MonacoManager()
    }
    return MonacoManager.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    if (!this.initPromise) {
      this.initPromise = this.loadMonaco()
    }

    await this.initPromise
    this.isInitialized = true
    this.notifySubscribers()
  }

  private async loadMonaco(): Promise<void> {
    try {
      const healthyCDN = await getMonacoEditorCDN()
      loader.config({
        paths: {
          vs: `${healthyCDN}/vs`
        }
      })
      await loader.init()
    } catch (error) {
      console.error('[MonacoManager] CDN failed, falling back to default', error)
      loader.config({
        paths: {
          vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs'
        }
      })
      await loader.init()
    }
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback)
    if (this.isInitialized) {
      callback()
    }
    return () => {
      this.subscribers.delete(callback)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((cb) => cb())
  }
}

const monacoManager = MonacoManager.getInstance()

export function useMonacoManager() {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = monacoManager.subscribe(() => {
      setIsReady(true)
      setIsLoading(false)
    })

    monacoManager
      .initialize()
      .catch((err) => {
        console.error('[MonacoManager] initialization failed', err)
        setError('编辑器初始化失败')
        setIsLoading(false)
      })

    return unsubscribe
  }, [])

  return { isReady, isLoading, error }
}
