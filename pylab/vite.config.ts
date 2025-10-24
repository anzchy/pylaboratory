import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  base: './',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
    process: '{"env":{"NODE_ENV":"production"}}'
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'PyLabEditor',
      formats: ['iife'],
      fileName: () => 'pylab-editor.js'
    },
    outDir: path.resolve(__dirname, '../docs/assets/js'),
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        exports: 'named'
      }
    }
  }
})
