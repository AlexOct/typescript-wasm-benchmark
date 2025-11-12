/**
 * Performance Benchmark Framework
 * Handles timing, statistics, and comparison of TS vs WASM implementations
 */

import * as tsAlgorithms from './ts-algorithms';
import { wasmAlgorithms } from './wasm-algorithms';

export interface BenchmarkResult {
  testName: string;
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

export interface TestConfig {
  arraySize: number;
  iterations: number;
  warmupIterations: number;
}

/**
 * Generate random Uint32Array
 */
export function generateRandomArray(size: number): Uint32Array {
  const arr = new Uint32Array(size);
  for (let i = 0; i < size; i++) {
    arr[i] = Math.floor(Math.random() * 1000000);
  }
  return arr;
}

/**
 * Generate sorted Uint32Array
 */
export function generateSortedArray(size: number): Uint32Array {
  const arr = generateRandomArray(size);
  return arr.sort((a, b) => a - b);
}

/**
 * Generate random 3D vectors (Float32Array with x,y,z triplets)
 */
export function generateRandomVectors(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    arr[i] = Math.random() * 200 - 100; // Random values between -100 and 100
  }
  return arr;
}

/**
 * Calculate median from array of numbers
 */
function calculateMedian(times: number[]): number {
  const sorted = [...times].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Format time for display
 */
export function formatTime(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}μs`;
  } else if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

/**
 * Run a single benchmark test
 */
export async function runBenchmark(
  testName: string,
  tsFunc: () => any,
  wasmFunc: () => any,
  config: TestConfig
): Promise<BenchmarkResult> {
  const tsTimes: number[] = [];
  const wasmTimes: number[] = [];

  // Warmup phase - JIT compilation
  console.log(`🔥 Warming up ${testName}...`);
  try {
    for (let i = 0; i < config.warmupIterations; i++) {
      tsFunc();
      wasmFunc();
    }
  } catch (error) {
    console.error(`❌ Warmup failed for ${testName}:`, error);
    throw new Error(`${testName} warmup failed: ${(error as Error).message}`);
  }

  // TypeScript benchmark
  console.log(`📊 Testing TypeScript ${testName}...`);
  try {
    for (let i = 0; i < config.iterations; i++) {
      const start = performance.now();
      tsFunc();
      const end = performance.now();
      tsTimes.push(end - start);
    }
  } catch (error) {
    console.error(`❌ TypeScript test failed for ${testName}:`, error);
    throw new Error(`${testName} TypeScript test failed: ${(error as Error).message}`);
  }

  // WASM benchmark
  console.log(`📊 Testing WASM ${testName}...`);
  try {
    for (let i = 0; i < config.iterations; i++) {
      const start = performance.now();
      wasmFunc();
      const end = performance.now();
      wasmTimes.push(end - start);
    }
  } catch (error) {
    console.error(`❌ WASM test failed for ${testName}:`, error);
    throw new Error(`${testName} WASM test failed: ${(error as Error).message}`);
  }

  // Calculate statistics
  const tsAvg = tsTimes.reduce((a, b) => a + b, 0) / tsTimes.length;
  const wasmAvg = wasmTimes.reduce((a, b) => a + b, 0) / wasmTimes.length;
  const tsMin = Math.min(...tsTimes);
  const wasmMin = Math.min(...wasmTimes);
  const tsMax = Math.max(...tsTimes);
  const wasmMax = Math.max(...wasmTimes);
  const tsMedian = calculateMedian(tsTimes);
  const wasmMedian = calculateMedian(wasmTimes);
  const speedup = tsAvg / wasmAvg;
  const winner = speedup >= 1 ? 'WASM' : 'TypeScript';

  return {
    testName,
    tsTime: tsAvg,
    wasmTime: wasmAvg,
    tsTimes,
    wasmTimes,
    tsAvg,
    wasmAvg,
    tsMin,
    wasmMin,
    tsMax,
    wasmMax,
    tsMedian,
    wasmMedian,
    speedup,
    winner,
  };
}

/**
 * Benchmark test definitions
 */
export interface BenchmarkTest {
  name: string;
  prepare: (size: number) => any;
  tsFunc: (data: any) => any;
  wasmFunc: (data: any) => any;
}

export const benchmarkTests: BenchmarkTest[] = [
  {
    name: 'Sum Array',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.sumArray(arr),
    wasmFunc: (arr) => wasmAlgorithms.sumArray(arr),
  },
  {
    name: 'Find Max',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.findMax(arr),
    wasmFunc: (arr) => wasmAlgorithms.findMax(arr),
  },
  {
    name: 'Find Min',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.findMin(arr),
    wasmFunc: (arr) => wasmAlgorithms.findMin(arr),
  },
  {
    name: 'Calculate Average',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.calculateAverage(arr),
    wasmFunc: (arr) => wasmAlgorithms.calculateAverage(arr),
  },
  {
    name: 'Multiply Array',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.multiplyArray(arr, 2),
    wasmFunc: (arr) => wasmAlgorithms.multiplyArray(arr, 2),
  },
  {
    name: 'Count Greater Than',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.countGreaterThan(arr, 500000),
    wasmFunc: (arr) => wasmAlgorithms.countGreaterThan(arr, 500000),
  },
  {
    name: 'Quick Sort',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.quickSort(arr),
    wasmFunc: (arr) => wasmAlgorithms.quickSort(arr),
  },
  {
    name: 'Reverse Array',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.reverseArray(arr),
    wasmFunc: (arr) => wasmAlgorithms.reverseArray(arr),
  },
  {
    name: 'Calculate Variance',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.calculateVariance(arr),
    wasmFunc: (arr) => wasmAlgorithms.calculateVariance(arr),
  },
  {
    name: 'Binary Search',
    prepare: (size) => {
      const arr = generateSortedArray(size);
      return { arr, target: arr[Math.floor(arr.length / 2)] };
    },
    tsFunc: (data) => tsAlgorithms.binarySearch(data.arr, data.target),
    wasmFunc: (data) => wasmAlgorithms.binarySearch(data.arr, data.target),
  },

  // ========== SIMD OPTIMIZED TESTS ==========

  {
    name: 'Sum Array (SIMD)',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.sumArray(arr),
    wasmFunc: (arr) => wasmAlgorithms.sumArraySIMD(arr),
  },
  {
    name: 'Find Max (SIMD)',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.findMax(arr),
    wasmFunc: (arr) => wasmAlgorithms.findMaxSIMD(arr),
  },
  {
    name: 'Find Min (SIMD)',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.findMin(arr),
    wasmFunc: (arr) => wasmAlgorithms.findMinSIMD(arr),
  },
  {
    name: 'Calculate Average (SIMD)',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.calculateAverage(arr),
    wasmFunc: (arr) => wasmAlgorithms.calculateAverageSIMD(arr),
  },
  {
    name: 'Multiply Array (SIMD)',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.multiplyArray(arr, 2),
    wasmFunc: (arr) => wasmAlgorithms.multiplyArraySIMD(arr, 2),
  },
  {
    name: 'Add To Array (SIMD)',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.addToArray(arr, 100),
    wasmFunc: (arr) => wasmAlgorithms.addToArraySIMD(arr, 100),
  },
  {
    name: 'Count Greater Than (SIMD)',
    prepare: (size) => generateRandomArray(size),
    tsFunc: (arr) => tsAlgorithms.countGreaterThan(arr, 500000),
    wasmFunc: (arr) => wasmAlgorithms.countGreaterThanSIMD(arr, 500000),
  },

  // ========== MATRIX TRANSFORMATION TESTS ==========

  {
    name: 'Matrix Transform',
    prepare: (size) => {
      const vectors = generateRandomVectors(size);
      const matrix = tsAlgorithms.createTransformMatrix(2, 1.5, 1, 45, 10, 20, 5);
      return { vectors, matrix };
    },
    tsFunc: (data) => {
      const vectorsCopy = new Float32Array(data.vectors);
      return tsAlgorithms.transformVectors(vectorsCopy, data.matrix);
    },
    wasmFunc: (data) => {
      const vectorsCopy = new Float32Array(data.vectors);
      return wasmAlgorithms.transformVectors(vectorsCopy, data.matrix);
    },
  },
  {
    name: 'Matrix Transform (SIMD)',
    prepare: (size) => {
      const vectors = generateRandomVectors(size);
      const matrix = tsAlgorithms.createTransformMatrix(2, 1.5, 1, 45, 10, 20, 5);
      return { vectors, matrix };
    },
    tsFunc: (data) => {
      const vectorsCopy = new Float32Array(data.vectors);
      return tsAlgorithms.transformVectors(vectorsCopy, data.matrix);
    },
    wasmFunc: (data) => {
      //const vectorsCopy = new Float32Array(data.vectors);
      return wasmAlgorithms.transformVectorsSIMD(data.vectors, data.matrix);
    },
  },
];

/**
 * Run all benchmark tests
 */
export async function runAllBenchmarks(
  config: TestConfig,
  onProgress?: (current: number, total: number, testName: string) => void
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  for (let i = 0; i < benchmarkTests.length; i++) {
    const test = benchmarkTests[i];

    if (onProgress) {
      onProgress(i + 1, benchmarkTests.length, test.name);
    }

    const data = test.prepare(config.arraySize);

    const result = await runBenchmark(
      test.name,
      () => test.tsFunc(data),
      () => test.wasmFunc(data),
      config
    );

    results.push(result);
    console.log(`✅ ${test.name}: WASM ${result.speedup.toFixed(2)}x`);
  }

  return results;
}
