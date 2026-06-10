/**
 * Performance Benchmark Framework
 * Handles timing, statistics, and comparison of TS vs WASM implementations
 */

import * as tsAlgorithms from './ts-algorithms';
import {
  type PreparedWasmBinaryTree,
  type PreparedWasmNaryTree,
  type PreparedWasmNumberTreeMap,
  type PreparedWasmNumberTreeMapData,
  type PreparedWasmStringMap,
  type PreparedWasmStringMapData,
  wasmAlgorithms,
} from './wasm-algorithms';

export interface BenchmarkResult {
  testName: string;
  tsFuncName?: string;
  wasmFuncName?: string;
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

const TREE_NODE_COUNT = 1_000_000;
const NARY_TREE_CHILDREN_PER_NODE = 4;
const STRING_MAP_ENTRY_COUNT = 100_000;

interface BinaryTreeBenchmarkData {
  values: Uint32Array;
  wasmTree: PreparedWasmBinaryTree;
}

interface NaryTreeBenchmarkData {
  tree: tsAlgorithms.NaryTreeData;
  wasmTree: PreparedWasmNaryTree;
}

interface StringMapBenchmarkData {
  data: tsAlgorithms.StringMapData;
  lookupMap: Map<string, number>;
  deleteMap: Map<string, number>;
  wasmData: PreparedWasmStringMapData;
  wasmLookupMap: PreparedWasmStringMap;
  wasmDeleteMap: PreparedWasmStringMap;
}

interface NumberTreeMapBenchmarkData {
  data: tsAlgorithms.NumberMapData;
  lookupMap: Map<number, number>;
  deleteMap: Map<number, number>;
  wasmData: PreparedWasmNumberTreeMapData;
  wasmLookupMap: PreparedWasmNumberTreeMap;
  wasmDeleteMap: PreparedWasmNumberTreeMap;
}

function generateTreeValues(size: number): Uint32Array {
  const values = new Uint32Array(size);
  for (let i = 0; i < size; i++) {
    values[i] = ((i * 2654435761) >>> 0) % 1000000;
  }
  return values;
}

function generateNaryTree(size: number): tsAlgorithms.NaryTreeData {
  const values = generateTreeValues(size);
  const childOffsets = new Uint32Array(size + 1);
  const children = new Uint32Array(Math.max(0, size - 1));
  let childCursor = 0;

  for (let nodeIndex = 0; nodeIndex < size; nodeIndex++) {
    childOffsets[nodeIndex] = childCursor;
    const firstChild = nodeIndex * NARY_TREE_CHILDREN_PER_NODE + 1;
    const endChild = Math.min(size, firstChild + NARY_TREE_CHILDREN_PER_NODE);

    for (let childIndex = firstChild; childIndex < endChild; childIndex++) {
      children[childCursor++] = childIndex;
    }
  }

  childOffsets[size] = childCursor;

  return { values, childOffsets, children };
}

function cloneNaryTree(tree: tsAlgorithms.NaryTreeData): tsAlgorithms.NaryTreeData {
  return {
    values: new Uint32Array(tree.values),
    childOffsets: new Uint32Array(tree.childOffsets),
    children: new Uint32Array(tree.children),
  };
}

function generateStringMapData(size: number): tsAlgorithms.StringMapData {
  const keys: string[] = [];
  const values = new Uint32Array(size);

  for (let i = 0; i < size; i++) {
    const suffix = ((i * 2654435761) >>> 0).toString(36);
    keys.push(`key_${i.toString().padStart(6, '0')}_${suffix}`);
    values[i] = (i * 17 + 23) % 1000000;
  }

  return { keys, values };
}

function generateNumberMapData(size: number): tsAlgorithms.NumberMapData {
  const keys = new Uint32Array(size);
  const values = new Uint32Array(size);

  for (let i = 0; i < size; i++) {
    keys[i] = (i * 2654435761) >>> 0;
    values[i] = (i * 17 + 23) % 1000000;
  }

  return { keys, values };
}

function prepareStringMapBenchmarkData(): StringMapBenchmarkData {
  const data = generateStringMapData(STRING_MAP_ENTRY_COUNT);
  const wasmData = wasmAlgorithms.prepareStringMapData(data);
  return {
    data,
    lookupMap: tsAlgorithms.createStringMap(data),
    deleteMap: tsAlgorithms.createStringMap(data),
    wasmData,
    wasmLookupMap: wasmAlgorithms.prepareStringMap(wasmData),
    wasmDeleteMap: wasmAlgorithms.prepareStringMap(wasmData),
  };
}

function prepareNumberTreeMapBenchmarkData(): NumberTreeMapBenchmarkData {
  const data = generateNumberMapData(STRING_MAP_ENTRY_COUNT);
  const wasmData = wasmAlgorithms.prepareNumberTreeMapData(data);
  return {
    data,
    lookupMap: tsAlgorithms.createNumberMap(data),
    deleteMap: tsAlgorithms.createNumberMap(data),
    wasmData,
    wasmLookupMap: wasmAlgorithms.prepareNumberTreeMap(wasmData),
    wasmDeleteMap: wasmAlgorithms.prepareNumberTreeMap(wasmData),
  };
}

function prepareBinaryTreeBenchmarkData(): BinaryTreeBenchmarkData {
  const values = generateTreeValues(TREE_NODE_COUNT);
  return {
    values,
    wasmTree: wasmAlgorithms.prepareBinaryTree(values),
  };
}

function prepareNaryTreeBenchmarkData(): NaryTreeBenchmarkData {
  const tree = generateNaryTree(TREE_NODE_COUNT);
  return {
    tree,
    wasmTree: wasmAlgorithms.prepareNaryTree(tree),
  };
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
  config: TestConfig,
  tsFuncName?: string,
  wasmFuncName?: string,
  tsSetup?: () => void,
  wasmSetup?: () => void
): Promise<BenchmarkResult> {
  const tsTimes: number[] = [];
  const wasmTimes: number[] = [];

  // Warmup phase - JIT compilation
  console.log(`🔥 Warming up ${testName}...`);
  try {
    for (let i = 0; i < config.warmupIterations; i++) {
      tsSetup?.();
      tsFunc();
      wasmSetup?.();
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
      tsSetup?.();
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
      wasmSetup?.();
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
    tsFuncName,
    wasmFuncName,
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
export interface BenchmarkTest<TData = any> {
  name: string;
  tsFuncName?: string;
  wasmFuncName?: string;
  prepare: (size: number) => TData;
  tsSetup?: (data: TData) => void;
  wasmSetup?: (data: TData) => void;
  tsFunc: (data: TData) => any;
  wasmFunc: (data: TData) => any;
  cleanup?: (data: TData) => void;
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

  // ========== STRING MAP TESTS ==========

  {
    name: 'String unordered_map Insert',
    tsFuncName: 'insertStringMapEntries',
    wasmFuncName: 'insertStringMapEntries',
    prepare: () => prepareStringMapBenchmarkData(),
    tsFunc: (data: StringMapBenchmarkData) => tsAlgorithms.insertStringMapEntries(data.data),
    wasmFunc: (data: StringMapBenchmarkData) => wasmAlgorithms.insertStringMapEntries(data.wasmData),
    cleanup: (data: StringMapBenchmarkData) => {
      data.wasmLookupMap.dispose();
      data.wasmDeleteMap.dispose();
      data.wasmData.dispose();
    },
  },
  {
    name: 'String unordered_map Lookup',
    tsFuncName: 'lookupStringMapEntries',
    wasmFuncName: 'lookupStringMapEntries',
    prepare: () => prepareStringMapBenchmarkData(),
    tsSetup: (data: StringMapBenchmarkData) => {
      data.lookupMap = tsAlgorithms.createStringMap(data.data);
    },
    wasmSetup: (data: StringMapBenchmarkData) => {
      wasmAlgorithms.resetStringMap(data.wasmLookupMap);
    },
    tsFunc: (data: StringMapBenchmarkData) => tsAlgorithms.lookupStringMapEntries(data.data, data.lookupMap),
    wasmFunc: (data: StringMapBenchmarkData) => wasmAlgorithms.lookupStringMapEntries(data.wasmLookupMap),
    cleanup: (data: StringMapBenchmarkData) => {
      data.wasmLookupMap.dispose();
      data.wasmDeleteMap.dispose();
      data.wasmData.dispose();
    },
  },
  {
    name: 'String unordered_map Delete',
    tsFuncName: 'deleteStringMapEntries',
    wasmFuncName: 'deleteStringMapEntries',
    prepare: () => prepareStringMapBenchmarkData(),
    tsSetup: (data: StringMapBenchmarkData) => {
      data.deleteMap = tsAlgorithms.createStringMap(data.data);
    },
    wasmSetup: (data: StringMapBenchmarkData) => {
      wasmAlgorithms.resetStringMap(data.wasmDeleteMap);
    },
    tsFunc: (data: StringMapBenchmarkData) => tsAlgorithms.deleteStringMapEntries(data.data, data.deleteMap),
    wasmFunc: (data: StringMapBenchmarkData) => wasmAlgorithms.deleteStringMapEntries(data.wasmDeleteMap),
    cleanup: (data: StringMapBenchmarkData) => {
      data.wasmLookupMap.dispose();
      data.wasmDeleteMap.dispose();
      data.wasmData.dispose();
    },
  },
  {
    name: 'Int std::map Insert',
    tsFuncName: 'insertNumberMapEntries',
    wasmFuncName: 'insertNumberTreeMapEntries',
    prepare: () => prepareNumberTreeMapBenchmarkData(),
    tsFunc: (data: NumberTreeMapBenchmarkData) => tsAlgorithms.insertNumberMapEntries(data.data),
    wasmFunc: (data: NumberTreeMapBenchmarkData) => wasmAlgorithms.insertNumberTreeMapEntries(data.wasmData),
    cleanup: (data: NumberTreeMapBenchmarkData) => {
      data.wasmLookupMap.dispose();
      data.wasmDeleteMap.dispose();
      data.wasmData.dispose();
    },
  },
  {
    name: 'Int std::map Lookup',
    tsFuncName: 'lookupNumberMapEntries',
    wasmFuncName: 'lookupNumberTreeMapEntries',
    prepare: () => prepareNumberTreeMapBenchmarkData(),
    tsSetup: (data: NumberTreeMapBenchmarkData) => {
      data.lookupMap = tsAlgorithms.createNumberMap(data.data);
    },
    wasmSetup: (data: NumberTreeMapBenchmarkData) => {
      wasmAlgorithms.resetNumberTreeMap(data.wasmLookupMap);
    },
    tsFunc: (data: NumberTreeMapBenchmarkData) => tsAlgorithms.lookupNumberMapEntries(data.data, data.lookupMap),
    wasmFunc: (data: NumberTreeMapBenchmarkData) => wasmAlgorithms.lookupNumberTreeMapEntries(data.wasmLookupMap),
    cleanup: (data: NumberTreeMapBenchmarkData) => {
      data.wasmLookupMap.dispose();
      data.wasmDeleteMap.dispose();
      data.wasmData.dispose();
    },
  },
  {
    name: 'Int std::map Delete',
    tsFuncName: 'deleteNumberMapEntries',
    wasmFuncName: 'deleteNumberTreeMapEntries',
    prepare: () => prepareNumberTreeMapBenchmarkData(),
    tsSetup: (data: NumberTreeMapBenchmarkData) => {
      data.deleteMap = tsAlgorithms.createNumberMap(data.data);
    },
    wasmSetup: (data: NumberTreeMapBenchmarkData) => {
      wasmAlgorithms.resetNumberTreeMap(data.wasmDeleteMap);
    },
    tsFunc: (data: NumberTreeMapBenchmarkData) => tsAlgorithms.deleteNumberMapEntries(data.data, data.deleteMap),
    wasmFunc: (data: NumberTreeMapBenchmarkData) => wasmAlgorithms.deleteNumberTreeMapEntries(data.wasmDeleteMap),
    cleanup: (data: NumberTreeMapBenchmarkData) => {
      data.wasmLookupMap.dispose();
      data.wasmDeleteMap.dispose();
      data.wasmData.dispose();
    },
  },

  // ========== TREE TRAVERSAL TESTS ==========

  {
    name: 'Binary Tree DFS Traversal Only',
    tsFuncName: 'sumBinaryTreeDfs',
    wasmFuncName: 'sumBinaryTreeDfs',
    prepare: () => prepareBinaryTreeBenchmarkData(),
    tsFunc: (data: BinaryTreeBenchmarkData) => tsAlgorithms.sumBinaryTreeDfs(data.values),
    wasmFunc: (data: BinaryTreeBenchmarkData) => wasmAlgorithms.sumBinaryTreeDfs(data.wasmTree),
    cleanup: (data: BinaryTreeBenchmarkData) => data.wasmTree.dispose(),
  },
  {
    name: 'Binary Tree BFS Traversal Only',
    tsFuncName: 'sumBinaryTreeBfs',
    wasmFuncName: 'sumBinaryTreeBfs',
    prepare: () => prepareBinaryTreeBenchmarkData(),
    tsFunc: (data: BinaryTreeBenchmarkData) => tsAlgorithms.sumBinaryTreeBfs(data.values),
    wasmFunc: (data: BinaryTreeBenchmarkData) => wasmAlgorithms.sumBinaryTreeBfs(data.wasmTree),
    cleanup: (data: BinaryTreeBenchmarkData) => data.wasmTree.dispose(),
  },
  {
    name: 'N-ary Tree DFS Traversal Only',
    tsFuncName: 'sumNaryTreeDfs',
    wasmFuncName: 'sumNaryTreeDfs',
    prepare: () => prepareNaryTreeBenchmarkData(),
    tsFunc: (data: NaryTreeBenchmarkData) => tsAlgorithms.sumNaryTreeDfs(data.tree),
    wasmFunc: (data: NaryTreeBenchmarkData) => wasmAlgorithms.sumNaryTreeDfs(data.wasmTree),
    cleanup: (data: NaryTreeBenchmarkData) => data.wasmTree.dispose(),
  },
  {
    name: 'N-ary Tree BFS Traversal Only',
    tsFuncName: 'sumNaryTreeBfs',
    wasmFuncName: 'sumNaryTreeBfs',
    prepare: () => prepareNaryTreeBenchmarkData(),
    tsFunc: (data: NaryTreeBenchmarkData) => tsAlgorithms.sumNaryTreeBfs(data.tree),
    wasmFunc: (data: NaryTreeBenchmarkData) => wasmAlgorithms.sumNaryTreeBfs(data.wasmTree),
    cleanup: (data: NaryTreeBenchmarkData) => data.wasmTree.dispose(),
  },
  {
    name: 'Binary Tree DFS End-to-End',
    tsFuncName: 'sumBinaryTreeDfs',
    wasmFuncName: 'sumBinaryTreeDfsEndToEnd',
    prepare: () => generateTreeValues(TREE_NODE_COUNT),
    tsFunc: (values: Uint32Array) => tsAlgorithms.sumBinaryTreeDfs(new Uint32Array(values)),
    wasmFunc: (values: Uint32Array) => wasmAlgorithms.sumBinaryTreeDfsEndToEnd(values),
  },
  {
    name: 'Binary Tree BFS End-to-End',
    tsFuncName: 'sumBinaryTreeBfs',
    wasmFuncName: 'sumBinaryTreeBfsEndToEnd',
    prepare: () => generateTreeValues(TREE_NODE_COUNT),
    tsFunc: (values: Uint32Array) => tsAlgorithms.sumBinaryTreeBfs(new Uint32Array(values)),
    wasmFunc: (values: Uint32Array) => wasmAlgorithms.sumBinaryTreeBfsEndToEnd(values),
  },
  {
    name: 'N-ary Tree DFS End-to-End',
    tsFuncName: 'sumNaryTreeDfs',
    wasmFuncName: 'sumNaryTreeDfsEndToEnd',
    prepare: () => generateNaryTree(TREE_NODE_COUNT),
    tsFunc: (tree: tsAlgorithms.NaryTreeData) => tsAlgorithms.sumNaryTreeDfs(cloneNaryTree(tree)),
    wasmFunc: (tree: tsAlgorithms.NaryTreeData) => wasmAlgorithms.sumNaryTreeDfsEndToEnd(tree),
  },
  {
    name: 'N-ary Tree BFS End-to-End',
    tsFuncName: 'sumNaryTreeBfs',
    wasmFuncName: 'sumNaryTreeBfsEndToEnd',
    prepare: () => generateNaryTree(TREE_NODE_COUNT),
    tsFunc: (tree: tsAlgorithms.NaryTreeData) => tsAlgorithms.sumNaryTreeBfs(cloneNaryTree(tree)),
    wasmFunc: (tree: tsAlgorithms.NaryTreeData) => wasmAlgorithms.sumNaryTreeBfsEndToEnd(tree),
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
    try {
      const result = await runBenchmark(
        test.name,
        () => test.tsFunc(data),
        () => test.wasmFunc(data),
        config,
        test.tsFuncName,
        test.wasmFuncName,
        test.tsSetup ? () => test.tsSetup!(data) : undefined,
        test.wasmSetup ? () => test.wasmSetup!(data) : undefined
      );

      results.push(result);
      console.log(`✅ ${test.name}: WASM ${result.speedup.toFixed(2)}x`);
    } finally {
      test.cleanup?.(data);
    }
  }

  return results;
}
