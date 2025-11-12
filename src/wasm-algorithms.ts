/**
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
