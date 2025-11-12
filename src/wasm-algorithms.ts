/**
 * WASM Algorithm Wrappers
 * WASM 算法包装器 - 提供所有 WASM 函数的 TypeScript 接口
 */

import { getWasmModuleInstance } from './framework/wasm-loader';

function getWasmModule() {
  return getWasmModuleInstance();
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
 * Free allocated memory in WASM
 * @param ptr Pointer to free
 */
export function freeArray(ptr: number): void {
  const module = getWasmModule();
  module._free(ptr);
}


/**
 * Copy data from WASM memory back to TypeScript array
 * @param ptr Pointer to WASM memory
 * @param length Array length
 * @returns Uint32Array with copied data
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
 * Allocate memory for a Float32Array in WASM memory
 * @param arr TypeScript Float32Array
 * @returns Pointer to allocated memory in WASM
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
 * Copy float data from WASM memory back to TypeScript array
 * @param ptr Pointer to WASM memory
 * @param length Array length
 * @returns Float32Array with copied data
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
 * WASM Algorithm Wrappers
 */

export const wasmAlgorithms = {
  /**
   * Sum all elements in array
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
   * Find maximum element
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
   * Find minimum element
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
   * Calculate average
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
   * Multiply each element by factor (in-place)
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
   * Count elements greater than threshold
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
   * Quick sort (in-place)
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
   * Reverse array (in-place)
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
   * Calculate variance
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
   * Binary search (assumes sorted array)
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
   * Add value to each element (in-place)
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
   * Count unique values
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

  // ========== SIMD OPTIMIZED VERSIONS ==========

  /**
   * Sum array using SIMD (4 elements at once)
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
   * Find maximum using SIMD
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
   * Find minimum using SIMD
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
   * Calculate average using SIMD
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
   * Multiply each element using SIMD
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
   * Add value to each element using SIMD
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
   * Count elements greater than threshold using SIMD
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
   * Transform 3D vectors using transformation matrix
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
   * Transform 3D vectors using SIMD optimization
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
   * Create transformation matrix in WASM
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
