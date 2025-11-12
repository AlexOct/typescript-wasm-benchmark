/**
 * JS vs WASM Benchmark Framework
 * 主入口文件 - 可以作为 npm 包导出
 */

// 导出类型
export type {
  BenchmarkTest,
  BenchmarkResult,
  TestConfig,
  TestModule,
  ProgressCallback,
  DataType,
} from './types';

// 导出测试注册
export { testRegistry } from './test-registry';

// 导出 WASM 加载器
export {
  initWasmModule,
  getWasmModuleInstance,
  WasmLoader,
  type WasmModuleInstance,
} from './wasm-loader';

// 导出 WASM 桥接
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

// 导出 Benchmark 运行器
export {
  runBenchmark,
  runBenchmarks,
  formatTime,
  generateSummary,
  type BenchmarkSummary,
} from './benchmark-runner';
