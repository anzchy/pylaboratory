/**
 * CDN disaster recovery helpers adapted from LangShift.
 * Provides prioritized health checks and failover selection.
 */

export interface CDNConfig {
  name: string
  baseUrl: string
  priority: number
}

export interface CDNResource {
  name: string
  cdns: CDNConfig[]
  healthCheck?: (url: string) => Promise<boolean>
}

function resolveLocalPyodideBase(): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '/assets/pyodide'
  }

  const scriptEl = document.querySelector<HTMLScriptElement>('script[src*="pylab-editor"]')
  if (scriptEl) {
    try {
      const scriptUrl = new URL(scriptEl.src, window.location.href)
      const match = scriptUrl.pathname.match(/^(.*)\/assets\/js\/[^/]+$/)
      const basePath = match?.[1] ?? ''
      const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`
      const absoluteBase = `${scriptUrl.origin}${normalizedBase}`
      return new URL('assets/pyodide', absoluteBase).href.replace(/\/$/, '')
    } catch (error) {
      console.warn('[CDN] Failed to resolve local Pyodide base URL', error)
    }
  }

  return `${window.location.origin}/assets/pyodide`
}

class CDNDisasterRecovery {
  private healthCache = new Map<string, { healthy: boolean; lastCheck: number }>()
  private readonly cacheTimeout = 5 * 60 * 1000

  async getHealthyCDN(resource: CDNResource, path = ''): Promise<string> {
    const sorted = [...resource.cdns].sort((a, b) => a.priority - b.priority)

    for (const cdn of sorted) {
      const cacheKey = cdn.baseUrl
      const cached = this.healthCache.get(cacheKey)
      if (cached && Date.now() - cached.lastCheck < this.cacheTimeout) {
        if (cached.healthy) {
          return cdn.baseUrl
        }
        continue
      }

      const fullUrl = `${cdn.baseUrl}${path}`
      const healthy = resource.healthCheck
        ? await resource.healthCheck(fullUrl)
        : await this.defaultHealthCheck(fullUrl)

      this.healthCache.set(cacheKey, { healthy, lastCheck: Date.now() })

      if (healthy) {
        return cdn.baseUrl
      }
    }

    return sorted[0]?.baseUrl ?? ''
  }

  clearCache(): void {
    this.healthCache.clear()
  }

  private async defaultHealthCheck(url: string, timeout = 3000): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)

      // 先尝试HEAD请求，如果失败则尝试GET请求
      let response: Response
      try {
        response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-cache'
        })
      } catch (headError) {
        // HEAD失败，尝试GET请求
        response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-cache'
        })
      }

      clearTimeout(timer)
      return response.ok
    } catch (error) {
      console.warn(`[CDN] health check failed for ${url}`, error)
      return false
    }
  }
}

const cdnManager = new CDNDisasterRecovery()

export const CDN_CONFIGS: Record<'MONACO_EDITOR' | 'PYODIDE', CDNResource> = {
  MONACO_EDITOR: {
    name: 'monaco-editor',
    cdns: [
      {
        name: 'jsdelivr',
        baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min',
        priority: 1
      },
      {
        name: 'jsdelivr-fastly',
        baseUrl: 'https://fastly.jsdelivr.net/npm/monaco-editor@0.52.2/min',
        priority: 2
      },
      {
        name: 'unpkg',
        baseUrl: 'https://unpkg.com/monaco-editor@0.52.2/min',
        priority: 3
      },
      {
        name: 'bootcdn',
        baseUrl: 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.52.2/min',
        priority: 4
      }
    ]
  },
  PYODIDE: {
    name: 'pyodide',
    cdns: [
      {
        name: 'local-assets',
        baseUrl: resolveLocalPyodideBase(),
        priority: 0
      },
      {
        name: 'github-raw-main',
        baseUrl: 'https://raw.githubusercontent.com/anzchy/pylaboratory/main/docs/assets/pyodide',
        priority: 1
      },
      {
        name: 'github-raw-master',
        baseUrl: 'https://raw.githubusercontent.com/anzchy/pylaboratory/master/docs/assets/pyodide',
        priority: 2
      },
      {
        name: 'unpkg-zhimg',
        baseUrl: 'https://unpkg.zhimg.com/pyodide@0.27.0',
        priority: 3
      },
      {
        name: 'elemecdn',
        baseUrl: 'https://npm.elemecdn.com/pyodide@0.27.0',
        priority: 4
      },
      {
        name: 'unpkg',
        baseUrl: 'https://unpkg.com/pyodide@0.27.0',
        priority: 5
      },
      {
        name: 'jsdelivr-china-jsd',
        baseUrl: 'https://jsd.onmicrosoft.cn/npm/pyodide@0.27.0',
        priority: 6
      },
      {
        name: 'jsdelivr',
        baseUrl: 'https://cdn.jsdelivr.net/npm/pyodide@0.27.0',
        priority: 7
      }
    ]
  }
}

export function getMonacoEditorCDN(): Promise<string> {
  return cdnManager.getHealthyCDN(CDN_CONFIGS.MONACO_EDITOR, '/vs/loader.min.js')
}

export function getPyodideCDN(): Promise<string> {
  return cdnManager.getHealthyCDN(CDN_CONFIGS.PYODIDE, '/pyodide.js')
}

export function preCheckAllCDNs(): Promise<void> {
  return Promise.all([
    cdnManager.getHealthyCDN(CDN_CONFIGS.MONACO_EDITOR, '/vs/loader.min.js'),
    cdnManager.getHealthyCDN(CDN_CONFIGS.PYODIDE)
  ]).then(() => undefined)
}
