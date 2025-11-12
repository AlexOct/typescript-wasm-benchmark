/**
 * JS vs WASM Benchmark Framework
 * Main entry point - can be exported as npm package
 */

// Export types
export type {
  BenchmarkTest,
  BenchmarkResult,
  TestConfig,
  TestModule,
  ProgressCallback,
  DataType,
} from './types';

// Export test registry
export { testRegistry } from './test-registry';

// Export WASM loader
export {
  initWasmModule,
  getWasmModuleInstance,
  WasmLoader,
  type WasmModuleInstance,
} from './wasm-loader';

// Export WASM bridge
export {
  getWasmModule,
  allocateUint32Array,
  allocateFloat32Array,
  readUint32Array,
  readFloat32Array,
  clearMemoryPools,
  createWasmWrapper,
  createAdvancedWasmWrapper,
} from './wasm-bridge';

// Export benchmark runner
export {
  runBenchmark,
  runBenchmarks,
  formatTime,
  generateSummary,
  type BenchmarkSummary,
} from './benchmark-runner';
