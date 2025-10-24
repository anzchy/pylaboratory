import { useMonacoManager } from './components/monaco-manager'
import { VirtualizedEditor } from './components/virtualized-editor'
import {
  CDN_CONFIGS,
  getMonacoEditorCDN,
  getPyodideCDN,
  preCheckAllCDNs
} from './lib/cdn-disaster-recovery'
import { PyLabRuntimeController } from './components/runtime-controller'
import { mountHelloWorldPlayground } from './playground/hello-world'
import { mountPlayground } from './components/playground-new'

export {
  useMonacoManager,
  VirtualizedEditor,
  CDN_CONFIGS,
  getMonacoEditorCDN,
  getPyodideCDN,
  preCheckAllCDNs,
  PyLabRuntimeController,
  mountHelloWorldPlayground,
  mountPlayground
}

const api = {
  useMonacoManager,
  VirtualizedEditor,
  CDN_CONFIGS,
  getMonacoEditorCDN,
  getPyodideCDN,
  preCheckAllCDNs,
  PyLabRuntimeController,
  mountHelloWorldPlayground,
  mountPlayground
}

if (typeof globalThis !== 'undefined') {
  ;(globalThis as any).PyLabEditor = api
}

export default api
