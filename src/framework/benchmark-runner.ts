/**
 * JS vs WASM Benchmark Framework - Benchmark Runner
 * Benchmark execution engine
 */

import type {
  BenchmarkTest,
  BenchmarkResult,
  TestConfig,
  ProgressCallback,
} from './types';

/**
 * Calculate median
 */
function calculateMedian(times: number[]): number {
  const sorted = [...times].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Format time
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
 * Run single benchmark test
 */
export async function runBenchmark(
  test: BenchmarkTest,
  config: TestConfig
): Promise<BenchmarkResult> {
  const tsTimes: number[] = [];
  const wasmTimes: number[] = [];

  // Prepare data
  const data = test.prepare(config);

  // Warmup phase
  console.log(`🔥 Warming up ${test.name}...`);
  try {
    for (let i = 0; i < config.warmupIterations; i++) {
      test.tsImpl(data);
      if (test.wasmImpl) {
        test.wasmImpl(data);
      }
    }
  } catch (error) {
    console.error(`❌ Warmup failed for ${test.name}:`, error);
    throw new Error(`${test.name} warmup failed: ${(error as Error).message}`);
  }

  // TypeScript benchmark
  console.log(`📊 Testing TypeScript ${test.name}...`);
  try {
    for (let i = 0; i < config.iterations; i++) {
      const start = performance.now();
      test.tsImpl(data);
      const end = performance.now();
      tsTimes.push(end - start);
    }
  } catch (error) {
    console.error(`❌ TypeScript test failed for ${test.name}:`, error);
    throw new Error(`${test.name} TypeScript test failed: ${(error as Error).message}`);
  }

  // WASM benchmark
  console.log(`📊 Testing WASM ${test.name}...`);
  try {
    if (!test.wasmImpl) {
      throw new Error(`WASM implementation not found for ${test.name}`);
    }

    for (let i = 0; i < config.iterations; i++) {
      const start = performance.now();
      test.wasmImpl(data);
      const end = performance.now();
      wasmTimes.push(end - start);
    }
  } catch (error) {
    console.error(`❌ WASM test failed for ${test.name}:`, error);
    throw new Error(`${test.name} WASM test failed: ${(error as Error).message}`);
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
    testName: test.name,
    testNameChinese: test.nameChinese,
    category: test.category,
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
 * Run multiple benchmark tests
 */
export async function runBenchmarks(
  tests: BenchmarkTest[],
  config: TestConfig,
  onProgress?: ProgressCallback
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];

    if (onProgress) {
      onProgress(i + 1, tests.length, test.name);
    }

    const result = await runBenchmark(test, config);
    results.push(result);

    console.log(`✅ ${test.name}: WASM ${result.speedup.toFixed(2)}x`);
  }

  return results;
}

/**
 * Generate test report summary
 */
export interface BenchmarkSummary {
  totalTests: number;
  wasmWins: number;
  tsWins: number;
  avgSpeedup: number;
  bestSpeedup: BenchmarkResult;
  worstSpeedup: BenchmarkResult;
}

export function generateSummary(results: BenchmarkResult[]): BenchmarkSummary {
  const wasmWins = results.filter(r => r.winner === 'WASM').length;
  const tsWins = results.filter(r => r.winner === 'TypeScript').length;
  const avgSpeedup = results.reduce((sum, r) => sum + r.speedup, 0) / results.length;

  const sortedBySpeedup = [...results].sort((a, b) => b.speedup - a.speedup);
  const bestSpeedup = sortedBySpeedup[0];
  const worstSpeedup = sortedBySpeedup[sortedBySpeedup.length - 1];

  return {
    totalTests: results.length,
    wasmWins,
    tsWins,
    avgSpeedup,
    bestSpeedup,
    worstSpeedup,
  };
}
