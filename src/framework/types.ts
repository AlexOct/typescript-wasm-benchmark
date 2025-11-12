/**
 * JS vs WASM Benchmark Framework - Type Definitions
 * 核心类型定义
 */

/**
 * 测试配置
 */
export interface TestConfig {
  arraySize: number;
  iterations: number;
  warmupIterations: number;
}

/**
 * Benchmark 结果
 */
export interface BenchmarkResult {
  testName: string;
  testNameChinese: string;
  category: string;
  tsTime: number;
  wasmTime: number;
  tsTimes: number[];
  wasmTimes: number[];
  tsAvg: number;
  wasmAvg: number;
  tsMin: number;
  wasmMin: number;
  tsMax: number;
  wasmMax: number;
  tsMedian: number;
  wasmMedian: number;
  speedup: number;
  winner: 'TypeScript' | 'WASM';
}

/**
 * 数据类型
 */
export type DataType =
  | 'uint32array'
  | 'float32array'
  | 'number'
  | 'custom';

/**
 * 测试定义
 */
export interface BenchmarkTest<TData = any> {
  // 基本信息
  name: string;
  nameChinese: string;
  category: string;

  // 数据准备
  prepare: (config: TestConfig) => TData;

  // TypeScript 实现
  tsImpl: (data: TData) => any;

  // WASM 函数名称
  wasmFuncName: string;

  // WASM 包装器（可选，如果不提供则使用默认包装）
  wasmImpl?: (data: TData) => any;

  // SIMD 版本的函数名（可选）
  wasmFuncNameSIMD?: string;

  // 是否启用 SIMD 测试
  enableSIMD?: boolean;

  // 数据类型（用于自动生成 WASM 包装器）
  dataType?: DataType;
}

/**
 * 测试模块
 */
export interface TestModule {
  category: string;
  tests: BenchmarkTest[];
}

/**
 * 进度回调
 */
export type ProgressCallback = (
  current: number,
  total: number,
  testName: string
) => void;