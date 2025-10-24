import React, { useEffect, useRef, useState } from 'react'
import { useMonacoManager } from './monaco-manager'

interface VirtualizedEditorProps {
  language: string
  value: string
  onChange?: (value: string | undefined) => void
  theme?: string
  height?: number
  options?: Record<string, unknown>
}

const MonacoEditorLazy = React.lazy(() =>
  import('@monaco-editor/react').then((module) => ({
    default: module.default
  }))
)

export function VirtualizedEditor({
  language,
  value,
  onChange,
  theme = 'vs-light',
  height = 300,
  options = {}
}: VirtualizedEditorProps) {
  const { isReady, isLoading, error } = useMonacoManager()
  const [shouldRender, setShouldRender] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true)
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  if (error) {
    return (
      <div ref={containerRef} className="border rounded p-4 bg-red-50" style={{ height }}>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    )
  }

  if (!shouldRender || isLoading || !isReady) {
    return (
      <div ref={containerRef} className="border rounded p-4 bg-gray-50" style={{ height }}>
        <div className="text-gray-600 text-sm">正在加载编辑器...</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ height }}>
      <React.Suspense
        fallback={
          <div className="border rounded p-4 bg-gray-50" style={{ height }}>
            <div className="text-gray-600 text-sm">正在加载编辑器...</div>
          </div>
        }
      >
        <MonacoEditorLazy
          language={language}
          theme={theme}
          value={value}
          onChange={onChange}
          height={height}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
            ...options
          }}
        />
      </React.Suspense>
    </div>
  )
}
