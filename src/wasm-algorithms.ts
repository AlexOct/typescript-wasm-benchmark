/**
 */

import { getWasmModuleInstance } from './framework/wasm-loader';
import type { NaryTreeData, NumberMapData, StringMapData } from './ts-algorithms';

function getWasmModule() {
  return getWasmModuleInstance();
}

function toNumber(value: number | bigint): number {
  return Number(value);
}

function assertPointer(ptr: number, name: string): number {
  if (!ptr) {
    throw new Error(`Failed to create ${name} in WASM`);
  }
  return ptr;
}

export function allocateArray(arr: Uint32Array): number {
  const module = getWasmModule();
  const byteSize = arr.length * 4; // 4 bytes per uint32
  const ptr = module._malloc(byteSize);

  if (!ptr) {
    throw new Error('Failed to allocate memory in WASM');
  }

  // Copy data from JS array to WASM memory using setValue
  for (let i = 0; i < arr.length; i++) {
    module.setValue(ptr + i * 4, arr[i], 'i32');
  }

  return ptr;
}

export function allocateArrayEx(arr: Uint32Array): number {
  const module = getWasmModule();
  const byteSize = arr.length * 4; // 4 bytes per uint32
  const ptr = module._malloc(byteSize);

  if (!ptr) {
    throw new Error('Failed to allocate memory in WASM');
  }
  const start = ptr / module.HEAPU32.BYTES_PER_ELEMENT;
  const end = (ptr + byteSize) / module.HEAPU32.BYTES_PER_ELEMENT;
  const arrS = module.HEAPU32.subarray(start, end);
  arrS.set(arr);

  return ptr;
}

/**
 */
export function freeArray(ptr: number): void {
  const module = getWasmModule();
  module._free(ptr);
}


/**
 */
export function readArray(ptr: number, length: number): Uint32Array {
  const module = getWasmModule();
  const result = new Uint32Array(length);

  for (let i = 0; i < length; i++) {
    result[i] = module.getValue(ptr + i * 4, 'i32');
  }

  return result;
}

export function readArrayEx(ptr: number, length: number): Uint32Array {
  const module = getWasmModule();
  const result = new Uint32Array(length);
  const start = ptr / module.HEAPU32.BYTES_PER_ELEMENT;
  const end = start + length;
  const arrs = module.HEAPU32.subarray(start, end)

  result.set(arrs);

  return result;
}
/**
 */
export function allocateFloatArray(arr: Float32Array): number {
  const module = getWasmModule();
  const byteSize = arr.length * 4; // 4 bytes per float32
  const ptr = module._malloc(byteSize);

  if (!ptr) {
    throw new Error('Failed to allocate memory in WASM');
  }

  // Copy data from JS array to WASM memory using setValue
  for (let i = 0; i < arr.length; i++) {
    module.setValue(ptr + i * 4, arr[i], 'float');
  }

  return ptr;
}

export function allocateFloatArrayEx(arr: Float32Array): number {
  const module = getWasmModule();
  const byteSize = arr.length * 4; // 4 bytes per float32
  const ptr = module._malloc(byteSize);

  if (!ptr) {
    throw new Error('Failed to allocate memory in WASM');
  }
  const start = (ptr) / module.HEAPF32.BYTES_PER_ELEMENT;
  const end = (ptr + byteSize) / module.HEAPF32.BYTES_PER_ELEMENT;
  const arrS = module.HEAPF32.subarray(start, end);
  arrS.set(arr);
  return ptr;
}


/**
 */
export function readFloatArray(ptr: number, length: number): Float32Array {
  const module = getWasmModule();
  const result = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    result[i] = module.getValue(ptr + i * 4, 'float');
  }

  return result;
}

export function readFloatArrayEx(ptr: number, length: number): Float32Array {
  const module = getWasmModule();
  const result = new Float32Array(length);
  const heap_s = new Float32Array(module.HEAPF32.buffer, ptr, length);
  result.set(heap_s)

  return result;
}
/**
 */

export interface PreparedWasmBinaryTree {
  valuesPtr: number;
  nodeCount: number;
  dispose: () => void;
}

export interface PreparedWasmNaryTree {
  valuesPtr: number;
  childOffsetsPtr: number;
  childrenPtr: number;
  nodeCount: number;
  dispose: () => void;
}

function callBinaryTreeSum(functionName: string, tree: PreparedWasmBinaryTree): number {
  const module = getWasmModule();
  const sum = module.ccall(
    functionName,
    'number',
    ['number', 'number'],
    [tree.valuesPtr, tree.nodeCount]
  );
  return toNumber(sum);
}

function callNaryTreeSum(functionName: string, tree: PreparedWasmNaryTree): number {
  const module = getWasmModule();
  const sum = module.ccall(
    functionName,
    'number',
    ['number', 'number', 'number', 'number'],
    [tree.valuesPtr, tree.childOffsetsPtr, tree.childrenPtr, tree.nodeCount]
  );
  return toNumber(sum);
}

function createPreparedBinaryTree(values: Uint32Array): PreparedWasmBinaryTree {
  const valuesPtr = allocateArrayEx(values);
  let disposed = false;

  return {
    valuesPtr,
    nodeCount: values.length,
    dispose: () => {
      if (!disposed) {
        freeArray(valuesPtr);
        disposed = true;
      }
    },
  };
}

function createPreparedNaryTree(tree: NaryTreeData): PreparedWasmNaryTree {
  let valuesPtr = 0;
  let childOffsetsPtr = 0;
  let childrenPtr = 0;

  try {
    valuesPtr = allocateArrayEx(tree.values);
    childOffsetsPtr = allocateArrayEx(tree.childOffsets);
    childrenPtr = allocateArrayEx(tree.children);
  } catch (error) {
    if (childrenPtr) {
      freeArray(childrenPtr);
    }
    if (childOffsetsPtr) {
      freeArray(childOffsetsPtr);
    }
    if (valuesPtr) {
      freeArray(valuesPtr);
    }
    throw error;
  }

  let disposed = false;

  return {
    valuesPtr,
    childOffsetsPtr,
    childrenPtr,
    nodeCount: tree.values.length,
    dispose: () => {
      if (!disposed) {
        freeArray(valuesPtr);
        freeArray(childOffsetsPtr);
        freeArray(childrenPtr);
        disposed = true;
      }
    },
  };
}

export interface PreparedWasmStringMapData {
  keyBytesPtr: number;
  keyOffsetsPtr: number;
  valuesPtr: number;
  dataPtr: number;
  count: number;
  dispose: () => void;
}

export interface PreparedWasmStringMap {
  data: PreparedWasmStringMapData;
  mapPtr: number;
  dispose: () => void;
}

export interface PreparedWasmNumberTreeMapData {
  keysPtr: number;
  valuesPtr: number;
  count: number;
  dispose: () => void;
}

export interface PreparedWasmNumberTreeMap {
  data: PreparedWasmNumberTreeMapData;
  mapPtr: number;
  dispose: () => void;
}

const textEncoder = new TextEncoder();

function createStringMapEncoding(data: StringMapData): { keyBytes: Uint8Array; keyOffsets: Uint32Array } {
  const encodedKeys = data.keys.map(key => textEncoder.encode(key));
  const keyOffsets = new Uint32Array(data.keys.length + 1);
  let totalBytes = 0;

  for (let i = 0; i < encodedKeys.length; i++) {
    keyOffsets[i] = totalBytes;
    totalBytes += encodedKeys[i].length;
  }
  keyOffsets[encodedKeys.length] = totalBytes;

  const keyBytes = new Uint8Array(totalBytes);
  let cursor = 0;
  for (const encodedKey of encodedKeys) {
    keyBytes.set(encodedKey, cursor);
    cursor += encodedKey.length;
  }

  return { keyBytes, keyOffsets };
}

function allocateBytes(bytes: Uint8Array): number {
  if (bytes.length === 0) {
    return 0;
  }

  const module = getWasmModule();
  const ptr = module._malloc(bytes.length);
  if (!ptr) {
    throw new Error('Failed to allocate memory in WASM');
  }
  (module as typeof module & { HEAPU8: Uint8Array }).HEAPU8.set(bytes, ptr);
  return ptr;
}

function callStringMapData(functionName: string, data: PreparedWasmStringMapData): number {
  const result = getWasmModule().ccall(
    functionName,
    'number',
    ['number'],
    [data.dataPtr]
  );
  return toNumber(result);
}

function createPreparedStringMapData(data: StringMapData): PreparedWasmStringMapData {
  if (data.values.length !== data.keys.length) {
    throw new Error('StringMapData values length must match keys length');
  }

  const { keyBytes, keyOffsets } = createStringMapEncoding(data);
  let keyBytesPtr = 0;
  let keyOffsetsPtr = 0;
  let valuesPtr = 0;
  let dataPtr = 0;

  try {
    keyBytesPtr = allocateBytes(keyBytes);
    keyOffsetsPtr = allocateArrayEx(keyOffsets);
    valuesPtr = data.values.length > 0 ? allocateArrayEx(data.values) : 0;
    dataPtr = assertPointer(toNumber(getWasmModule().ccall(
      'createStringMapData',
      'number',
      ['number', 'number', 'number', 'number'],
      [keyBytesPtr, keyOffsetsPtr, valuesPtr, data.keys.length]
    )), 'string map data');
  } catch (error) {
    if (dataPtr) {
      getWasmModule().ccall('freeStringMapData', null, ['number'], [dataPtr]);
    }
    if (valuesPtr) freeArray(valuesPtr);
    if (keyOffsetsPtr) freeArray(keyOffsetsPtr);
    if (keyBytesPtr) freeArray(keyBytesPtr);
    throw error;
  }

  let disposed = false;
  return {
    keyBytesPtr,
    keyOffsetsPtr,
    valuesPtr,
    dataPtr,
    count: data.keys.length,
    dispose: () => {
      if (!disposed) {
        getWasmModule().ccall('freeStringMapData', null, ['number'], [dataPtr]);
        if (valuesPtr) freeArray(valuesPtr);
        freeArray(keyOffsetsPtr);
        if (keyBytesPtr) freeArray(keyBytesPtr);
        disposed = true;
      }
    },
  };
}

function createPreparedStringMapWith(
  data: PreparedWasmStringMapData,
  prepareFunctionName: string,
  freeFunctionName: string,
  name: string
): PreparedWasmStringMap {
  const mapPtr = assertPointer(toNumber(getWasmModule().ccall(
    prepareFunctionName,
    'number',
    ['number'],
    [data.dataPtr]
  )), name);
  let disposed = false;
  return {
    data,
    mapPtr,
    dispose: () => {
      if (!disposed) {
        getWasmModule().ccall(freeFunctionName, null, ['number'], [mapPtr]);
        disposed = true;
      }
    },
  };
}

function createPreparedStringMap(data: PreparedWasmStringMapData): PreparedWasmStringMap {
  return createPreparedStringMapWith(data, 'prepareStringMap', 'freePreparedStringMap', 'prepared string map');
}

function createPreparedNumberTreeMapData(data: NumberMapData): PreparedWasmNumberTreeMapData {
  if (data.values.length !== data.keys.length) {
    throw new Error('NumberMapData values length must match keys length');
  }

  let keysPtr = 0;
  let valuesPtr = 0;

  try {
    keysPtr = data.keys.length > 0 ? allocateArrayEx(data.keys) : 0;
    valuesPtr = data.values.length > 0 ? allocateArrayEx(data.values) : 0;
  } catch (error) {
    if (valuesPtr) freeArray(valuesPtr);
    if (keysPtr) freeArray(keysPtr);
    throw error;
  }

  let disposed = false;
  return {
    keysPtr,
    valuesPtr,
    count: data.keys.length,
    dispose: () => {
      if (!disposed) {
        if (valuesPtr) freeArray(valuesPtr);
        if (keysPtr) freeArray(keysPtr);
        disposed = true;
      }
    },
  };
}

function createPreparedNumberMapWith<T extends { data: PreparedWasmNumberTreeMapData; mapPtr: number; dispose: () => void }>(
  data: PreparedWasmNumberTreeMapData,
  prepareFunctionName: string,
  freeFunctionName: string,
  name: string
): T {
  const mapPtr = assertPointer(toNumber(getWasmModule().ccall(
    prepareFunctionName,
    'number',
    ['number', 'number', 'number'],
    [data.keysPtr, data.valuesPtr, data.count]
  )), name);
  let disposed = false;
  return {
    data,
    mapPtr,
    dispose: () => {
      if (!disposed) {
        getWasmModule().ccall(freeFunctionName, null, ['number'], [mapPtr]);
        disposed = true;
      }
    },
  } as T;
}

function createPreparedNumberTreeMap(data: PreparedWasmNumberTreeMapData): PreparedWasmNumberTreeMap {
  return createPreparedNumberMapWith(data, 'prepareNumberTreeMap', 'freePreparedNumberTreeMap', 'prepared number tree map');
}

export const wasmAlgorithms = {
  /**
   */
  sumArray(arr: Uint32Array): bigint {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      const sum = module.ccall(
        'sumArray',
        'number',
        ['number', 'number'],
        [ptr, arr.length]
      );
      return BigInt(sum);
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  findMax(arr: Uint32Array): number {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      return module.ccall(
        'findMax',
        'number',
        ['number', 'number'],
        [ptr, arr.length]
      );
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  findMin(arr: Uint32Array): number {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      return module.ccall(
        'findMin',
        'number',
        ['number', 'number'],
        [ptr, arr.length]
      );
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  calculateAverage(arr: Uint32Array): number {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      return module.ccall(
        'calculateAverage',
        'number',
        ['number', 'number'],
        [ptr, arr.length]
      );
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  multiplyArray(arr: Uint32Array, factor: number): Uint32Array {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      module.ccall(
        'multiplyArray',
        null,
        ['number', 'number', 'number'],
        [ptr, arr.length, factor]
      );
      return readArrayEx(ptr, arr.length);
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  countGreaterThan(arr: Uint32Array, threshold: number): number {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      return module.ccall(
        'countGreaterThan',
        'number',
        ['number', 'number', 'number'],
        [ptr, arr.length, threshold]
      );
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  quickSort(arr: Uint32Array): Uint32Array {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      module.ccall(
        'quickSort',
        null,
        ['number', 'number'],
        [ptr, arr.length]
      );
      return readArrayEx(ptr, arr.length);
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  reverseArray(arr: Uint32Array): Uint32Array {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      module.ccall(
        'reverseArray',
        null,
        ['number', 'number'],
        [ptr, arr.length]
      );
      return readArrayEx(ptr, arr.length);
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  calculateVariance(arr: Uint32Array): number {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      return module.ccall(
        'calculateVariance',
        'number',
        ['number', 'number'],
        [ptr, arr.length]
      );
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  binarySearch(arr: Uint32Array, target: number): number {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      return module.ccall(
        'binarySearch',
        'number',
        ['number', 'number', 'number'],
        [ptr, arr.length, target]
      );
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  addToArray(arr: Uint32Array, value: number): Uint32Array {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      module.ccall(
        'addToArray',
        null,
        ['number', 'number', 'number'],
        [ptr, arr.length, value]
      );
      return readArrayEx(ptr, arr.length);
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  countUnique(arr: Uint32Array): number {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      return module.ccall(
        'countUnique',
        'number',
        ['number', 'number'],
        [ptr, arr.length]
      );
    } finally {
      freeArray(ptr);
    }
  },

  prepareBinaryTree(values: Uint32Array): PreparedWasmBinaryTree {
    return createPreparedBinaryTree(values);
  },

  prepareNaryTree(tree: NaryTreeData): PreparedWasmNaryTree {
    return createPreparedNaryTree(tree);
  },

  sumBinaryTreeDfs(tree: PreparedWasmBinaryTree): number {
    return callBinaryTreeSum('sumBinaryTreeDfs', tree);
  },

  sumBinaryTreeBfs(tree: PreparedWasmBinaryTree): number {
    return callBinaryTreeSum('sumBinaryTreeBfs', tree);
  },

  sumNaryTreeDfs(tree: PreparedWasmNaryTree): number {
    return callNaryTreeSum('sumNaryTreeDfs', tree);
  },

  sumNaryTreeBfs(tree: PreparedWasmNaryTree): number {
    return callNaryTreeSum('sumNaryTreeBfs', tree);
  },

  sumBinaryTreeDfsEndToEnd(values: Uint32Array): number {
    const tree = createPreparedBinaryTree(values);
    try {
      return callBinaryTreeSum('sumBinaryTreeDfs', tree);
    } finally {
      tree.dispose();
    }
  },

  sumBinaryTreeBfsEndToEnd(values: Uint32Array): number {
    const tree = createPreparedBinaryTree(values);
    try {
      return callBinaryTreeSum('sumBinaryTreeBfs', tree);
    } finally {
      tree.dispose();
    }
  },

  sumNaryTreeDfsEndToEnd(treeData: NaryTreeData): number {
    const tree = createPreparedNaryTree(treeData);
    try {
      return callNaryTreeSum('sumNaryTreeDfs', tree);
    } finally {
      tree.dispose();
    }
  },

  sumNaryTreeBfsEndToEnd(treeData: NaryTreeData): number {
    const tree = createPreparedNaryTree(treeData);
    try {
      return callNaryTreeSum('sumNaryTreeBfs', tree);
    } finally {
      tree.dispose();
    }
  },

  prepareStringMapData(data: StringMapData): PreparedWasmStringMapData {
    return createPreparedStringMapData(data);
  },

  prepareStringMap(data: PreparedWasmStringMapData): PreparedWasmStringMap {
    return createPreparedStringMap(data);
  },

  resetStringMap(map: PreparedWasmStringMap): void {
    const next = createPreparedStringMap(map.data);
    map.dispose();
    map.mapPtr = next.mapPtr;
    map.dispose = next.dispose;
  },

  insertStringMapEntries(data: PreparedWasmStringMapData): number {
    return callStringMapData('insertStringMapEntries', data);
  },

  lookupStringMapEntries(map: PreparedWasmStringMap): number {
    const result = getWasmModule().ccall(
      'lookupStringMapEntries',
      'number',
      ['number'],
      [map.mapPtr]
    );
    return toNumber(result);
  },

  deleteStringMapEntries(map: PreparedWasmStringMap): number {
    const result = getWasmModule().ccall(
      'deleteStringMapEntries',
      'number',
      ['number'],
      [map.mapPtr]
    );
    return toNumber(result);
  },

  prepareNumberTreeMapData(data: NumberMapData): PreparedWasmNumberTreeMapData {
    return createPreparedNumberTreeMapData(data);
  },

  prepareNumberTreeMap(data: PreparedWasmNumberTreeMapData): PreparedWasmNumberTreeMap {
    return createPreparedNumberTreeMap(data);
  },

  resetNumberTreeMap(map: PreparedWasmNumberTreeMap): void {
    const next = createPreparedNumberTreeMap(map.data);
    map.dispose();
    map.mapPtr = next.mapPtr;
    map.dispose = next.dispose;
  },

  insertNumberTreeMapEntries(data: PreparedWasmNumberTreeMapData): number {
    const result = getWasmModule().ccall(
      'insertNumberTreeMapEntries',
      'number',
      ['number', 'number', 'number'],
      [data.keysPtr, data.valuesPtr, data.count]
    );
    return toNumber(result);
  },

  lookupNumberTreeMapEntries(map: PreparedWasmNumberTreeMap): number {
    const result = getWasmModule().ccall(
      'lookupNumberTreeMapEntries',
      'number',
      ['number'],
      [map.mapPtr]
    );
    return toNumber(result);
  },

  deleteNumberTreeMapEntries(map: PreparedWasmNumberTreeMap): number {
    const result = getWasmModule().ccall(
      'deleteNumberTreeMapEntries',
      'number',
      ['number'],
      [map.mapPtr]
    );
    return toNumber(result);
  },

  // ========== SIMD OPTIMIZED VERSIONS ==========

  /**
   */
  sumArraySIMD(arr: Uint32Array): bigint {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      const sum = module.ccall(
        'sumArraySIMD',
        'number',
        ['number', 'number'],
        [ptr, arr.length]
      );
      return BigInt(sum);
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  findMaxSIMD(arr: Uint32Array): number {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      return module.ccall(
        'findMaxSIMD',
        'number',
        ['number', 'number'],
        [ptr, arr.length]
      );
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  findMinSIMD(arr: Uint32Array): number {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      return module.ccall(
        'findMinSIMD',
        'number',
        ['number', 'number'],
        [ptr, arr.length]
      );
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  calculateAverageSIMD(arr: Uint32Array): number {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      return module.ccall(
        'calculateAverageSIMD',
        'number',
        ['number', 'number'],
        [ptr, arr.length]
      );
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  multiplyArraySIMD(arr: Uint32Array, factor: number): Uint32Array {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      module.ccall(
        'multiplyArraySIMD',
        null,
        ['number', 'number', 'number'],
        [ptr, arr.length, factor]
      );
      return readArrayEx(ptr, arr.length);
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  addToArraySIMD(arr: Uint32Array, value: number): Uint32Array {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      module.ccall(
        'addToArraySIMD',
        null,
        ['number', 'number', 'number'],
        [ptr, arr.length, value]
      );
      return readArrayEx(ptr, arr.length);
    } finally {
      freeArray(ptr);
    }
  },

  /**
   */
  countGreaterThanSIMD(arr: Uint32Array, threshold: number): number {
    const ptr = allocateArrayEx(arr);
    try {
      const module = getWasmModule();
      return module.ccall(
        'countGreaterThanSIMD',
        'number',
        ['number', 'number', 'number'],
        [ptr, arr.length, threshold]
      );
    } finally {
      freeArray(ptr);
    }
  },

  // ========== MATRIX TRANSFORMATION ==========

  /**
   */
  transformVectors(vectors: Float32Array, matrix: Float32Array): Float32Array {
    const vectorsPtr = allocateFloatArrayEx(vectors);
    const matrixPtr = allocateFloatArrayEx(matrix);
    try {
      const module = getWasmModule();
      const count = vectors.length / 3;

      // Debug: Check if function exists
      console.log('Calling transformVectors with count:', count);

      module.ccall(
        'transformVectors',
        null,
        ['number', 'number', 'number'],
        [vectorsPtr, matrixPtr, count]
      );
      return readFloatArrayEx(vectorsPtr, vectors.length);
    } catch (error) {
      console.error('transformVectors error:', error);
      throw error;
    } finally {
      freeArray(vectorsPtr);
      freeArray(matrixPtr);
    }
  },

  /**
   */
  transformVectorsSIMD(vectors: Float32Array, matrix: Float32Array): Float32Array {
    const vectorsPtr = allocateFloatArrayEx(vectors);
    const matrixPtr = allocateFloatArrayEx(matrix);
    try {
      const module = getWasmModule();
      const count = vectors.length / 3;
      module.ccall(
        'transformVectorsSIMD',
        null,
        ['number', 'number', 'number'],
        [vectorsPtr, matrixPtr, count]
      );
      return readFloatArrayEx(vectorsPtr, vectors.length);
    } finally {
      freeArray(vectorsPtr);
      freeArray(matrixPtr);
    }
  },

  /**
   */
  createTransformMatrix(
    scaleX: number, scaleY: number, scaleZ: number,
    angleDeg: number,
    transX: number, transY: number, transZ: number
  ): Float32Array {
    const matrixPtr = getWasmModule()._malloc(16 * 4); // 16 floats
    try {
      const module = getWasmModule();
      module.ccall(
        'createTransformMatrix',
        null,
        ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
        [matrixPtr, scaleX, scaleY, scaleZ, angleDeg, transX, transY, transZ]
      );
      return readFloatArrayEx(matrixPtr, 16);
    } finally {
      freeArray(matrixPtr);
    }
  },
};
