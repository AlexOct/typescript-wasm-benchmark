/**
 * TypeScript Algorithm Implementations
 * Pure TypeScript versions of the C++ algorithms for performance comparison
 */

/**
 * Sum all elements in the array
 */
export function sumArray(arr: Uint32Array): bigint {
  let sum = 0n;
  for (let i = 0; i < arr.length; i++) {
    sum += BigInt(arr[i]);
  }
  return sum;
}

/**
 * Find maximum element
 */
export function findMax(arr: Uint32Array): number {
  if (arr.length === 0) return 0;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}

/**
 * Find minimum element
 */
export function findMin(arr: Uint32Array): number {
  if (arr.length === 0) return 0;
  let min = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      min = arr[i];
    }
  }
  return min;
}

/**
 * Calculate average
 */
export function calculateAverage(arr: Uint32Array): number {
  if (arr.length === 0) return 0;
  const sum = sumArray(arr);
  return Number(sum) / arr.length;
}

/**
 * Multiply each element by a factor (in-place)
 */
export function multiplyArray(arr: Uint32Array, factor: number): Uint32Array {
  const result = new Uint32Array(arr);
  for (let i = 0; i < result.length; i++) {
    result[i] *= factor;
  }
  return result;
}

/**
 * Count elements greater than threshold
 */
export function countGreaterThan(arr: Uint32Array, threshold: number): number {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > threshold) {
      count++;
    }
  }
  return count;
}

/**
 * Helper function for quicksort - partition
 */
function partition(arr: Uint32Array, low: number, high: number): number {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      // Swap
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }

  // Swap pivot
  const temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;

  return i + 1;
}

/**
 * Quick sort (in-place) - Iterative version to avoid stack overflow
 */
export function quickSort(arr: Uint32Array): Uint32Array {
  if (arr.length <= 1) return new Uint32Array(arr);
  const result = new Uint32Array(arr);

  // Create an auxiliary stack for iterative quicksort
  const stack: number[] = [];

  // Push initial values of low and high to stack
  stack.push(0);
  stack.push(result.length - 1);

  // Keep popping from stack while it's not empty
  while (stack.length > 0) {
    // Pop high and low
    const high = stack.pop()!;
    const low = stack.pop()!;

    // Set pivot element at its correct position
    const pi = partition(result, low, high);

    // If there are elements on left side of pivot, push left side to stack
    if (pi - 1 > low) {
      stack.push(low);
      stack.push(pi - 1);
    }

    // If there are elements on right side of pivot, push right side to stack
    if (pi + 1 < high) {
      stack.push(pi + 1);
      stack.push(high);
    }
  }

  return result;
}

/**
 * Reverse array (in-place)
 */
export function reverseArray(arr: Uint32Array): Uint32Array {
  const result = new Uint32Array(arr);
  for (let i = 0; i < Math.floor(result.length / 2); i++) {
    const temp = result[i];
    result[i] = result[result.length - 1 - i];
    result[result.length - 1 - i] = temp;
  }
  return result;
}

/**
 * Calculate variance
 */
export function calculateVariance(arr: Uint32Array): number {
  if (arr.length === 0) return 0;

  const mean = calculateAverage(arr);
  let variance = 0;

  for (let i = 0; i < arr.length; i++) {
    const diff = arr[i] - mean;
    variance += diff * diff;
  }

  return variance / arr.length;
}

/**
 * Binary search (assumes sorted array)
 */
export function binarySearch(arr: Uint32Array, target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

/**
 * Add value to each element (in-place)
 */
export function addToArray(arr: Uint32Array, value: number): Uint32Array {
  const result = new Uint32Array(arr);
  for (let i = 0; i < result.length; i++) {
    result[i] += value;
  }
  return result;
}

/**
 * Count unique values
 */
export function countUnique(arr: Uint32Array): number {
  if (arr.length === 0) return 0;

  // Create a copy and sort it
  const sorted = quickSort(arr);

  let unique = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1]) {
      unique++;
    }
  }

  return unique;
}

/**
 * Apply 4x4 transformation matrix to 3D vectors
 * Input format: [x1, y1, z1, x2, y2, z2, ...]
 * Matrix in column-major order
 */
export function transformVectors(vectors: Float32Array, matrix: Float32Array): Float32Array {
  const result = new Float32Array(vectors);
  const count = vectors.length / 3;

  for (let i = 0; i < count; i++) {
    const x = vectors[i * 3 + 0];
    const y = vectors[i * 3 + 1];
    const z = vectors[i * 3 + 2];

    // Apply transformation matrix (assuming w = 1)
    result[i * 3 + 0] = matrix[0] * x + matrix[4] * y + matrix[8]  * z + matrix[12];
    result[i * 3 + 1] = matrix[1] * x + matrix[5] * y + matrix[9]  * z + matrix[13];
    result[i * 3 + 2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
  }

  return result;
}

/**
 * Create transformation matrix (scale, rotate, translate)
 */
export function createTransformMatrix(
  scaleX: number, scaleY: number, scaleZ: number,
  angleDeg: number,
  transX: number, transY: number, transZ: number
): Float32Array {
  const matrix = new Float32Array(16);
  const angleRad = angleDeg * Math.PI / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  // Column-major 4x4 matrix
  // Column 0
  matrix[0] = scaleX * cosA;
  matrix[1] = scaleX * sinA;
  matrix[2] = 0;
  matrix[3] = 0;

  // Column 1
  matrix[4] = scaleY * -sinA;
  matrix[5] = scaleY * cosA;
  matrix[6] = 0;
  matrix[7] = 0;

  // Column 2
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = scaleZ;
  matrix[11] = 0;

  // Column 3 (translation)
  matrix[12] = transX;
  matrix[13] = transY;
  matrix[14] = transZ;
  matrix[15] = 1;

  return matrix;
}
