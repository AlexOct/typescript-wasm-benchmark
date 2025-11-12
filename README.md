# TypeScript vs WebAssembly Performance Comparison

A performance benchmark comparing TypeScript and C++ (compiled to WebAssembly) implementations of algorithms operating on large Uint32Array datasets.

## 🎬 Live Demo

**[View Live Demo →](https://alexoct.github.io/typescript-wasm-benchmark/)**

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Build WASM module (requires Emscripten)
pnpm run build:wasm

# Start dev server
pnpm run dev
```

## 📊 What It Does

Compare the performance of identical algorithms implemented in both TypeScript and WebAssembly, including:
- Array operations (sum, find, sort, etc.)
- SIMD-optimized versions
- Statistical analysis with warmup phases

## 🛠️ Tech Stack

TypeScript + Vite + Emscripten + WebAssembly + WASM SIMD

## 📄 License

MIT
