import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/typescript-wasm-benchmark/' : '/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
})
